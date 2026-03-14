"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { clearCart } from "@/lib/cart"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!sessionId) {
      router.push('/')
      return
    }

    // Clear cart
    clearCart()

    // Fetch order details
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('stripe_session_id', sessionId)
          .single()

        if (error) throw error

        setOrder(data)
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    // Wait a bit for webhook to process
    const timer = setTimeout(fetchOrder, 2000)
    return () => clearTimeout(timer)
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Processing your order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-lg mb-4">Order is being processed. Please check your email for confirmation.</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. A confirmation email has been sent to{' '}
            <span className="font-semibold">{order.customer_email}</span>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-mono text-sm">{order.id}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Items</h3>
              <div className="space-y-2">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity * 100)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <p className="text-sm">
                {order.customer_name}<br />
                {order.address_line1}<br />
                {order.address_line2 && <>{order.address_line2}<br /></>}
                {order.city}, {order.state} {order.postal_code}<br />
                {order.country}
              </p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal * 100)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(order.shipping_cost * 100)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount_amount * 100)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.total * 100)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href="/orders" className="flex-1">
                <Button variant="outline" className="w-full">
                  View Order History
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}