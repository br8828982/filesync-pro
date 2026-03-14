"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

export function InventoryAdmin() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    const { data, error } = await supabase
      .from('inventory_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setLogs(data)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Inventory Log</h2>

      <Card>
        <CardHeader>
          <CardTitle>Recent Inventory Changes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground">No inventory changes yet</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-start py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-semibold">{log.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.change_type.toUpperCase()} - {log.reason || 'No reason provided'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Before:</span> {log.quantity_before}
                    </p>
                    <p className="text-sm font-semibold">
                      <span
                        className={
                          log.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">After:</span> {log.quantity_after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}