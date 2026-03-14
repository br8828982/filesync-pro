-- Insert sample products
INSERT INTO products (name, description, price, stock_quantity, category, images) VALUES
  (
    'Wireless Headphones',
    'Premium noise-cancelling wireless headphones with 30-hour battery life.',
    15999,
    25,
    'Electronics',
    ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500']
  ),
  (
    'Smart Watch',
    'Feature-packed smartwatch with health tracking and notifications.',
    24999,
    15,
    'Electronics',
    ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500']
  ),
  (
    'Laptop Backpack',
    'Durable waterproof backpack with padded laptop compartment.',
    3499,
    50,
    'Accessories',
    ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500']
  ),
  (
    'Mechanical Keyboard',
    'RGB mechanical gaming keyboard with Cherry MX switches.',
    8999,
    30,
    'Electronics',
    ARRAY['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500']
  ),
  (
    'Wireless Mouse',
    'Ergonomic wireless mouse with precision tracking.',
    2999,
    3,
    'Electronics',
    ARRAY['https://images.unsplash.com/photo-1527814050087-3793815479db?w=500']
  ),
  (
    'USB-C Hub',
    '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader.',
    4999,
    45,
    'Electronics',
    ARRAY['https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500']
  ),
  (
    'Phone Stand',
    'Adjustable aluminum phone stand for desk.',
    1299,
    100,
    'Accessories',
    ARRAY['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500']
  ),
  (
    'Webcam HD',
    '1080p HD webcam with auto-focus and built-in microphone.',
    5999,
    20,
    'Electronics',
    ARRAY['https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500']
  ),
  (
    'Bluetooth Speaker',
    'Portable waterproof Bluetooth speaker with 360° sound.',
    7999,
    2,
    'Electronics',
    ARRAY['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500']
  ),
  (
    'Cable Organizer',
    'Silicone cable management clips, 10-pack.',
    599,
    0,
    'Accessories',
    ARRAY['https://images.unsplash.com/photo-1591290619762-d99b405a7fea?w=500']
  ),
  (
    'Monitor Stand',
    'Wooden monitor stand with storage compartment.',
    2499,
    35,
    'Accessories',
    ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500']
  ),
  (
    'LED Desk Lamp',
    'Adjustable LED desk lamp with USB charging port.',
    3999,
    40,
    'Accessories',
    ARRAY['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500']
  );

-- Insert sample coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, is_active, expires_at) VALUES
  ('WELCOME10', 'percentage', 10, 1000, 100, true, NOW() + INTERVAL '30 days'),
  ('SAVE500', 'fixed', 500, 5000, 50, true, NOW() + INTERVAL '30 days'),
  ('FLASH20', 'percentage', 20, 2000, 25, true, NOW() + INTERVAL '7 days');