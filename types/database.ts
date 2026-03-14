export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          stock_quantity: number
          stock_reserved: number
          category: string | null
          images: string[]
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          stock_quantity?: number
          stock_reserved?: number
          category?: string | null
          images?: string[]
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          stock_quantity?: number
          stock_reserved?: number
          category?: string | null
          images?: string[]
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          phone: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string | null
          full_name: string
          phone: string | null
          address_line1: string
          address_line2: string | null
          city: string
          state: string | null
          postal_code: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string | null
          full_name: string
          phone?: string | null
          address_line1: string
          address_line2?: string | null
          city: string
          state?: string | null
          postal_code: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string | null
          full_name?: string
          phone?: string | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string | null
          postal_code?: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          stripe_session_id: string
          status: string
          payment_status: string
          fulfillment_status: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          address_line1: string
          address_line2: string | null
          city: string
          state: string | null
          postal_code: string
          country: string
          subtotal: number
          shipping_cost: number
          discount_amount: number
          total: number
          coupon_code: string | null
          notes: string | null
          failed_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          stripe_session_id: string
          status?: string
          payment_status?: string
          fulfillment_status?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          address_line1: string
          address_line2?: string | null
          city: string
          state?: string | null
          postal_code: string
          country: string
          subtotal: number
          shipping_cost?: number
          discount_amount?: number
          total: number
          coupon_code?: string | null
          notes?: string | null
          failed_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          stripe_session_id?: string
          status?: string
          payment_status?: string
          fulfillment_status?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string | null
          postal_code?: string
          country?: string
          subtotal?: number
          shipping_cost?: number
          discount_amount?: number
          total?: number
          coupon_code?: string | null
          notes?: string | null
          failed_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_image: string | null
          price: number
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_image?: string | null
          price: number
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_image?: string | null
          price?: number
          quantity?: number
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_type: string
          discount_value: number
          min_order_amount: number
          max_uses: number | null
          used_count: number
          expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: string
          discount_value: number
          min_order_amount?: number
          max_uses?: number | null
          used_count?: number
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: string
          discount_value?: number
          min_order_amount?: number
          max_uses?: number | null
          used_count?: number
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inventory_log: {
        Row: {
          id: string
          product_id: string | null
          product_name: string
          change_type: string
          quantity_before: number
          quantity_change: number
          quantity_after: number
          order_id: string | null
          user_id: string | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          product_name: string
          change_type: string
          quantity_before: number
          quantity_change: number
          quantity_after: number
          order_id?: string | null
          user_id?: string | null
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          product_name?: string
          change_type?: string
          quantity_before?: number
          quantity_change?: number
          quantity_after?: number
          order_id?: string | null
          user_id?: string | null
          reason?: string | null
          created_at?: string
        }
      }
      stock_reservations: {
        Row: {
          id: string
          product_id: string
          quantity: number
          stripe_session_id: string
          reserved_at: string
          expires_at: string
          released: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity: number
          stripe_session_id: string
          reserved_at?: string
          expires_at: string
          released?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          stripe_session_id?: string
          reserved_at?: string
          expires_at?: string
          released?: boolean
          created_at?: string
        }
      }
      failed_payments: {
        Row: {
          id: string
          stripe_session_id: string
          customer_email: string
          amount: number
          error_message: string
          items: Json
          customer_details: Json
          created_at: string
        }
        Insert: {
          id?: string
          stripe_session_id: string
          customer_email: string
          amount: number
          error_message: string
          items: Json
          customer_details: Json
          created_at?: string
        }
        Update: {
          id?: string
          stripe_session_id?: string
          customer_email?: string
          amount?: number
          error_message?: string
          items?: Json
          customer_details?: Json
          created_at?: string
        }
      }
      checkout_sessions: {
        Row: {
          id: string
          stripe_session_id: string
          user_id: string | null
          items: Json
          customer_details: Json
          shipping_address: Json
          shipping_option: string
          subtotal: number
          shipping_cost: number
          total: number
          created_at: string
          expires_at: string
          completed: boolean
        }
        Insert: {
          id?: string
          stripe_session_id: string
          user_id?: string | null
          items: Json
          customer_details: Json
          shipping_address: Json
          shipping_option: string
          subtotal: number
          shipping_cost: number
          total: number
          created_at?: string
          expires_at: string
          completed?: boolean
        }
        Update: {
          id?: string
          stripe_session_id?: string
          user_id?: string | null
          items?: Json
          customer_details?: Json
          shipping_address?: Json
          shipping_option?: string
          subtotal?: number
          shipping_cost?: number
          total?: number
          created_at?: string
          expires_at?: string
          completed?: boolean
        }
      }
    }
  }
}