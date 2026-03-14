import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  const supabase = await createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Get session details
        const items = JSON.parse(session.metadata?.items || '[]')
        const shippingOption = session.metadata?.shipping_option || 'standard'
        const couponCode = session.metadata?.coupon_code || null
        const customerPhone = session.metadata?.customer_phone || null

        // Get shipping details
        const shippingDetails = session.shipping_details || session.customer_details

        if (!shippingDetails?.address) {
          throw new Error('No shipping address provided')
        }

        // Calculate amounts
        const subtotal = session.amount_subtotal || 0
        const shippingCost = session.total_details?.amount_shipping || 0
        const discountAmount = session.total_details?.amount_discount || 0
        const total = session.amount_total || 0

        // Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            stripe_session_id: session.id,
            user_id: null, // We'll handle user linking separately if needed
            status: 'confirmed',
            payment_status: 'paid',
            fulfillment_status: 'pending',
            customer_email: session.customer_details?.email || session.customer_email || '',
            customer_name: shippingDetails.name || '',
            customer_phone: customerPhone,
            address_line1: shippingDetails.address.line1 || '',
            address_line2: shippingDetails.address.line2 || null,
            city: shippingDetails.address.city || '',
            state: shippingDetails.address.state || null,
            postal_code: shippingDetails.address.postal_code || '',
            country: shippingDetails.address.country || '',
            subtotal: subtotal / 100,
            shipping_cost: shippingCost / 100,
            discount_amount: discountAmount / 100,
            total: total / 100,
            coupon_code: couponCode,
          })
          .select()
          .single()

        if (orderError || !order) {
          throw new Error(`Failed to create order: ${orderError?.message}`)
        }

        // Create order items and fulfill stock
        for (const item of items) {
          // Create order item
          await supabase.from('order_items').insert({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            product_image: item.image,
            price: item.price / 100,
            quantity: item.quantity,
          })

          // Fulfill order (reduce stock and reserved stock)
          await supabase.rpc('fulfill_order', {
            product_id: item.id,
            fulfill_qty: item.quantity,
          })

          // Log inventory change
          await supabase.rpc('log_inventory_change', {
            p_product_id: item.id,
            p_product_name: item.name,
            p_change_type: 'sale',
            p_quantity_before: 0, // Will be updated by trigger
            p_quantity_change: -item.quantity,
            p_quantity_after: 0, // Will be updated by trigger
            p_order_id: order.id,
            p_reason: `Order ${order.id}`,
          })
        }

        // Mark reservations as released
        await supabase
          .from('stock_reservations')
          .update({ released: true })
          .eq('stripe_session_id', session.id)

        // Update coupon usage if used
        if (couponCode) {
          await supabase
            .from('coupons')
            .update({ used_count: supabase.rpc('increment', { x: 1 }) })
            .eq('code', couponCode.toUpperCase())
        }

        // Mark checkout session as completed
        await supabase
          .from('checkout_sessions')
          .update({ completed: true })
          .eq('stripe_session_id', session.id)

        console.log(`Order created successfully: ${order.id}`)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session

        // Release stock reservations
        const { data: reservations } = await supabase
          .from('stock_reservations')
          .select('*')
          .eq('stripe_session_id', session.id)
          .eq('released', false)

        if (reservations) {
          for (const reservation of reservations) {
            await supabase.rpc('release_stock', {
              product_id: reservation.product_id,
              release_qty: reservation.quantity,
            })

            await supabase
              .from('stock_reservations')
              .update({ released: true })
              .eq('id', reservation.id)
          }
        }

        console.log(`Session expired and stock released: ${session.id}`)
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Log failed payment
        const items = JSON.parse(session.metadata?.items || '[]')
        
        await supabase.from('failed_payments').insert({
          stripe_session_id: session.id,
          customer_email: session.customer_details?.email || session.customer_email || '',
          amount: (session.amount_total || 0) / 100,
          error_message: 'Payment failed',
          items,
          customer_details: session.customer_details,
        })

        // Release stock reservations
        const { data: reservations } = await supabase
          .from('stock_reservations')
          .select('*')
          .eq('stripe_session_id', session.id)
          .eq('released', false)

        if (reservations) {
          for (const reservation of reservations) {
            await supabase.rpc('release_stock', {
              product_id: reservation.product_id,
              release_qty: reservation.quantity,
            })

            await supabase
              .from('stock_reservations')
              .update({ released: true })
              .eq('id', reservation.id)
          }
        }

        console.log(`Payment failed and stock released: ${session.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'