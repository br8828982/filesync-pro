export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  stock: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  itemCount: number
}

const CART_KEY = 'shopping-cart'

export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], subtotal: 0, itemCount: 0 }
  }

  try {
    const stored = localStorage.getItem(CART_KEY)
    if (!stored) {
      return { items: [], subtotal: 0, itemCount: 0 }
    }

    const items: CartItem[] = JSON.parse(stored)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return { items, subtotal, itemCount }
  } catch {
    return { items: [], subtotal: 0, itemCount: 0 }
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
    
    // Dispatch custom event for cart updates
    window.dispatchEvent(new Event('cart-updated'))
  } catch (error) {
    console.error('Failed to save cart:', error)
  }
}

export function addToCart(product: CartItem): void {
  const cart = getCart()
  const existingItem = cart.items.find(item => item.id === product.id)

  if (existingItem) {
    // Update quantity if item already exists
    if (existingItem.quantity + 1 <= product.stock) {
      existingItem.quantity += 1
    } else {
      throw new Error('Not enough stock available')
    }
  } else {
    // Add new item
    if (product.stock > 0) {
      cart.items.push({ ...product, quantity: 1 })
    } else {
      throw new Error('Product is out of stock')
    }
  }

  saveCart(cart.items)
}

export function updateCartItemQuantity(productId: string, quantity: number): void {
  const cart = getCart()
  const item = cart.items.find(item => item.id === productId)

  if (!item) return

  if (quantity <= 0) {
    // Remove item
    const filtered = cart.items.filter(item => item.id !== productId)
    saveCart(filtered)
  } else if (quantity <= item.stock) {
    // Update quantity
    item.quantity = quantity
    saveCart(cart.items)
  } else {
    throw new Error('Not enough stock available')
  }
}

export function removeFromCart(productId: string): void {
  const cart = getCart()
  const filtered = cart.items.filter(item => item.id !== productId)
  saveCart(filtered)
}

export function clearCart(): void {
  saveCart([])
}