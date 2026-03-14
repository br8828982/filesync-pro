"use client"

import Link from "next/link"
import { ShoppingCart, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getCart } from "@/lib/cart"
import { createClient } from "@/lib/supabase/client"
import { User as SupabaseUser } from "@supabase/supabase-js"

export function Header() {
  const [itemCount, setItemCount] = useState(0)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Load initial cart count
    const cart = getCart()
    setItemCount(cart.itemCount)

    // Listen for cart updates
    const handleCartUpdate = () => {
      const cart = getCart()
      setItemCount(cart.itemCount)
    }

    window.addEventListener('cart-updated', handleCartUpdate)

    // Get user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      
      if (data.user) {
        // Check if admin
        supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => {
            setIsAdmin(profile?.role === 'admin')
          })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setIsAdmin(profile?.role === 'admin')
          })
      } else {
        setIsAdmin(false)
      }
    })

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          E-Shop
        </Link>

        <nav className="flex items-center gap-4">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="ghost">Admin Dashboard</Button>
            </Link>
          )}
          
          {user ? (
            <>
              <Link href="/orders">
                <Button variant="ghost">My Orders</Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
          )}

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}