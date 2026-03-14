"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCart } from "@/lib/cart"
import { CheckoutForm } from "@/components/checkout-form"
import { Card } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckoutPage() {
  const router = useRouter()
  const [hasItems, setHasItems] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cart = getCart()
    if (cart.items.length === 0) {
      setHasItems(false)
    } else {
      setHasItems(true)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center">Loading...</p>
      </div>
    )
  }

  if (!hasItems) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center p-6">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some products before checking out
          </p>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <CheckoutForm />
    </div>
  )
}