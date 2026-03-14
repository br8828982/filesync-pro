-- Function to reserve stock atomically
CREATE OR REPLACE FUNCTION reserve_stock(product_id UUID, reserve_qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_reserved = stock_reserved + reserve_qty
  WHERE id = product_id
    AND (stock_quantity - stock_reserved) >= reserve_qty;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock available';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to release stock reservation
CREATE OR REPLACE FUNCTION release_stock(product_id UUID, release_qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_reserved = GREATEST(0, stock_reserved - release_qty)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to fulfill order (convert reservation to actual stock reduction)
CREATE OR REPLACE FUNCTION fulfill_order(product_id UUID, fulfill_qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET 
    stock_quantity = stock_quantity - fulfill_qty,
    stock_reserved = stock_reserved - fulfill_qty
  WHERE id = product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change(
  p_product_id UUID,
  p_product_name TEXT,
  p_change_type TEXT,
  p_quantity_before INTEGER,
  p_quantity_change INTEGER,
  p_quantity_after INTEGER,
  p_order_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO inventory_log (
    product_id,
    product_name,
    change_type,
    quantity_before,
    quantity_change,
    quantity_after,
    order_id,
    user_id,
    reason
  ) VALUES (
    p_product_id,
    p_product_name,
    p_change_type,
    p_quantity_before,
    p_quantity_change,
    p_quantity_after,
    p_order_id,
    p_user_id,
    p_reason
  );
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired reservations
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER := 0;
  reservation RECORD;
BEGIN
  FOR reservation IN
    SELECT id, product_id, quantity
    FROM stock_reservations
    WHERE released = false
      AND expires_at < NOW()
  LOOP
    -- Release the reserved stock
    PERFORM release_stock(reservation.product_id, reservation.quantity);
    
    -- Mark reservation as released
    UPDATE stock_reservations
    SET released = true
    WHERE id = reservation.id;
    
    expired_count := expired_count + 1;
  END LOOP;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically log inventory changes on stock updates
CREATE OR REPLACE FUNCTION trigger_log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stock_quantity != NEW.stock_quantity THEN
    PERFORM log_inventory_change(
      NEW.id,
      NEW.name,
      CASE
        WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'restock'
        WHEN NEW.stock_quantity < OLD.stock_quantity THEN 'sale'
        ELSE 'adjustment'
      END,
      OLD.stock_quantity,
      NEW.stock_quantity - OLD.stock_quantity,
      NEW.stock_quantity,
      NULL,
      auth.uid(),
      'Stock updated'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_product_stock_changes
AFTER UPDATE ON products
FOR EACH ROW
WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
EXECUTE FUNCTION trigger_log_stock_change();