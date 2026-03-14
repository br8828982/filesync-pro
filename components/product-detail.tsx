"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ShoppingCart, Minus, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { addToCart, updateCartItemQuantity, getCart } from "@/lib/cart"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock_quantity: number
  stock_reserved: number
  category: string | null
  images: string[]
}

export function ProductDetail({ product }: { product: Product }) {
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  
  const availableStock = product.stock_quantity - product.stock_reserved
  const isLowStock = availableStock > 0 && availableStock <= 5
  const isOutOfStock = availableStock === 0

  const handleAddToCart = () => {
    try {
      const cart = getCart()
      const existingItem = cart.items.find(item => item.id === product.id)
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > availableStock) {
          throw new Error('Not enough stock available')
        }
        updateCartItemQuantity(product.id, newQuantity)
      } else {
        for (let i = 0; i < quantity; i++) {
          addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images[0] || '/placeholder.png',
            stock: availableStock,
          })
        }
      }

      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.name} added to your cart`,
      })
      
      setQuantity(1)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add to cart",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Image Gallery */}
      <div className="space-y-4">
        <Card className="aspect-square relative overflow-hidden">
          {product.images[selectedImage] ? (
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </Card>

        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square relative overflow-hidden rounded-md border-2 transition-colors ${
                  selectedImage === index ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {isOutOfStock && (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge variant="secondary">Only {availableStock} left</Badge>
            )}
          </div>
          
          {product.category && (
            <p className="text-muted-foreground">{product.category}</p>
          )}
        </div>

        <div className="text-4xl font-bold text-primary">
          {formatCurrency(product.price)}
        </div>

        {product.description && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Quantity:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                disabled={quantity >= availableStock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
            <Link href="/cart" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                View Cart
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
          </p>
        </div>
      </div>
    </div>
  )
}