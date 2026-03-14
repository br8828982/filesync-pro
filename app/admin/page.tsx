import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsAdmin } from "@/components/admin/products-admin"
import { OrdersAdmin } from "@/components/admin/orders-admin"
import { InventoryAdmin } from "@/components/admin/inventory-admin"
import { StatsAdmin } from "@/components/admin/stats-admin"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <StatsAdmin />
        </TabsContent>

        <TabsContent value="products">
          <ProductsAdmin />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersAdmin />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryAdmin />
        </TabsContent>
      </Tabs>
    </div>
  )
}