import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      items,
      customerDetails,
      shippingAddress,
      shippingOption,
      couponCode,
      subtotal,
      shippingCost,
      discount,
      total,
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // Validate stock availability and prices
    const stockValidation = await Promise.all(
      items.map(async (item: any) => {
        const { data: product } = await supabase
          .from('products')
          .select('id, price, stock_quantity, stock_reserved')
          .eq('id', item.id)
          .single()

        if (!product) {
          throw new Error(`Product ${item.name} not found`)
        }

        const availableStock = product.stock_quantity - product.stock_reserved

        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Only ${availableStock} available.`)
        }

        if (product.price !== item.price) {
          throw new Error(`Price mismatch for ${item.name}`)
        }

        return { productId: product.id, quantity: item.quantity }
      })
    )

    // Validate coupon if provided
    let validatedDiscount = 0
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (coupon) {
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
          return NextResponse.json(
            { error: 'Coupon has expired' },
            { status: 400 }
          )
        }

        if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
          return NextResponse.json(
            { error: 'Coupon usage limit reached' },
            { status: 400 }
          )
        }

        if (subtotal < coupon.min_order_amount * 100) {
          return NextResponse.json(
            { error: 'Minimum order amount not met for coupon' },
            { status: 400 }
          )
        }

        if (coupon.discount_type === 'percentage') {
          validatedDiscount = Math.floor((subtotal * coupon.discount_value) / 100)
        } else {
          validatedDiscount = coupon.discount_value * 100
        }
      }
    }

    // Validate total calculation
    const calculatedTotal = subtotal + shippingCost - validatedDiscount
    if (Math.abs(calculatedTotal - total) > 1) {
      return NextResponse.json(
        { error: 'Total amount mismatch' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerDetails.email,
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: shippingCost,
              currency: 'inr',
            },
            display_name:
              shippingOption === 'express'
                ? 'Express Shipping'
                : shippingOption === 'overnight'
                ? 'Overnight Shipping'
                : 'Standard Shipping',
          },
        },
      ],
      discounts: validatedDiscount > 0 ? [{
        coupon: await createStripeCoupon(validatedDiscount),
      }] : undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        items: JSON.stringify(items),
        shipping_option: shippingOption,
        coupon_code: couponCode || '',
        customer_phone: customerDetails.phone || '',
      },
    })

    // Reserve stock
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    for (const { productId, quantity } of stockValidation) {
      // Create reservation
      await supabase.from('stock_reservations').insert({
        product_id: productId,
        quantity,
        stripe_session_id: session.id,
        expires_at: expiresAt.toISOString(),
      })

      // Update reserved stock
      await supabase.rpc('reserve_stock', {
        product_id: productId,
        reserve_qty: quantity,
      })
    }

    // Save checkout session
    await supabase.from('checkout_sessions').insert({
      stripe_session_id: session.id,
      items: items,
      customer_details: customerDetails,
      shipping_address: shippingAddress,
      shipping_option: shippingOption,
      subtotal: subtotal / 100,
      shipping_cost: shippingCost / 100,
      total: total / 100,
      expires_at: expiresAt.toISOString(),
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createStripeCoupon(amountOff: number): Promise<string> {
  const coupon = await stripe.coupons.create({
    amount_off: amountOff,
    currency: 'inr',
    duration: 'once',
  })
  return coupon.id
}