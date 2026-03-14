"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCart } from "@/lib/cart"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

const SHIPPING_OPTIONS = [
  { value: 'standard', label: 'Standard Shipping (Free)', price: 0 },
  { value: 'express', label: 'Express Shipping', price: 1500 },
  { value: 'overnight', label: 'Overnight Shipping', price: 3500 },
]

export function CheckoutForm() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [cart, setCart] = useState(getCart())
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    shippingOption: 'standard',
    couponCode: '',
  })

  const [shippingCost, setShippingCost] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        setFormData(prev => ({
          ...prev,
          email: data.user.email || '',
        }))
      }
    })
  }, [])

  useEffect(() => {
    const option = SHIPPING_OPTIONS.find(opt => opt.value === formData.shippingOption)
    setShippingCost(option?.price || 0)
  }, [formData.shippingOption])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleApplyCoupon = async () => {
    if (!formData.couponCode.trim()) return

    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', formData.couponCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error || !coupon) {
        toast({
          title: "Invalid coupon",
          description: "This coupon code is not valid",
          variant: "destructive",
        })
        return
      }

      // Check expiry
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast({
          title: "Expired coupon",
          description: "This coupon has expired",
          variant: "destructive",
        })
        return
      }

      // Check usage limit
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        toast({
          title: "Coupon limit reached",
          description: "This coupon has reached its usage limit",
          variant: "destructive",
        })
        return
      }

      // Check minimum order amount
      if (cart.subtotal < coupon.min_order_amount * 100) {
        toast({
          title: "Minimum order not met",
          description: `Minimum order amount is ${formatCurrency(coupon.min_order_amount * 100)}`,
          variant: "destructive",
        })
        return
      }

      // Calculate discount
      let discountAmount = 0
      if (coupon.discount_type === 'percentage') {
        discountAmount = Math.floor((cart.subtotal * coupon.discount_value) / 100)
      } else {
        discountAmount = coupon.discount_value * 100
      }

      setDiscount(discountAmount)
      setCouponApplied(true)
      
      toast({
        title: "Coupon applied!",
        description: `You saved ${formatCurrency(discountAmount)}`,
      })
    } catch (error) {
      console.error('Error applying coupon:', error)
      toast({
        title: "Error",
        description: "Failed to apply coupon",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const total = cart.subtotal + shippingCost - discount

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items,
          customerDetails: {
            email: formData.email,
            name: formData.fullName,
            phone: formData.phone,
          },
          shippingAddress: {
            line1: formData.addressLine1,
            line2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
          },
          shippingOption: formData.shippingOption,
          couponCode: couponApplied ? formData.couponCode : null,
          subtotal: cart.subtotal,
          shippingCost,
          discount,
          total,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to proceed to payment",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const total = cart.subtotal + shippingCost - discount

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email*</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={!!user}
              />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name*</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="addressLine1">Address Line 1*</Label>
              <Input
                id="addressLine1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City*</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">Postal Code*</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country*</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Options */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SHIPPING_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-accent"
              >
                <input
                  type="radio"
                  name="shippingOption"
                  value={option.value}
                  checked={formData.shippingOption === option.value}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                <span className="flex-1">{option.label}</span>
                <span className="font-semibold">
                  {option.price === 0 ? 'Free' : formatCurrency(option.price)}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Coupon Code */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                name="couponCode"
                placeholder="Enter coupon code"
                value={formData.couponCode}
                onChange={handleInputChange}
                disabled={couponApplied}
              />
              <Button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponApplied || !formData.couponCode.trim()}
              >
                {couponApplied ? 'Applied' : 'Apply'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div>
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}