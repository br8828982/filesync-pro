# E-Commerce System - Next.js 14 + Supabase + Stripe

A complete, production-ready e-commerce system built with Next.js 14 (App Router), Supabase, and Stripe.

## Features

### Core Features
- **Product Catalog**: Browse products with images, prices, descriptions, and categories
- **Advanced Search & Filtering**: Category-based filtering and text search
- **Real-time Stock Management**: Live stock availability with "low stock" warnings
- **Shopping Cart**: Persistent cart with localStorage, real-time validation
- **Multi-step Checkout**: Cart → Shipping Info → Payment
- **Stripe Payment Integration**: Secure payments with Stripe Checkout
- **Order Management**: Track orders with status updates
- **User Authentication**: Email/password authentication via Supabase Auth
- **Guest Checkout**: No login required for purchases
- **Discount Coupons**: Support for percentage and fixed-amount discounts

### Advanced Features
- **Stock Reservations**: Automatic 30-minute stock hold during checkout
- **Atomic Stock Operations**: Race condition prevention with database constraints
- **Inventory Audit Trail**: Complete logging of all stock changes
- **Webhook-based Order Creation**: Reliable order processing via Stripe webhooks
- **Price & Stock Validation**: Server-side validation before payment
- **Failed Payment Tracking**: Logs failed payments for manual review
- **Admin Dashboard**: Complete product, order, and inventory management

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe Checkout
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account
- Stripe account

## Installation

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Set up Supabase Database**:

Run the migration files in order in your Supabase SQL Editor:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_seed_data.sql`
- `supabase/migrations/003_functions.sql`

4. **Create an admin user** (optional):

After signing up through the app, run this in Supabase SQL Editor:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-id';
```

5. **Set up Stripe Webhook**:

For local development:
```bash
# Install Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

For production, create a webhook endpoint in Stripe Dashboard pointing to:
`https://yourdomain.com/api/webhooks/stripe`

Select these events:
- `checkout.session.completed`
- `checkout.session.expired`
- `checkout.session.async_payment_failed`

6. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── checkout/           # Stripe checkout session creation
│   │   └── webhooks/stripe/    # Stripe webhook handler
│   ├── admin/                  # Admin dashboard
│   ├── auth/                   # Authentication pages
│   ├── cart/                   # Shopping cart
│   ├── checkout/               # Checkout flow
│   ├── orders/                 # Order history
│   ├── products/[id]/          # Product detail pages
│   └── order/success/          # Order confirmation
├── components/
│   ├── admin/                  # Admin components
│   ├── ui/                     # Reusable UI components (shadcn)
│   ├── header.tsx              # Site header with cart
│   ├── product-card.tsx        # Product display card
│   ├── product-grid.tsx        # Product listing
│   └── checkout-form.tsx       # Checkout form
├── lib/
│   ├── supabase/               # Supabase client utilities
│   ├── stripe/                 # Stripe client utilities
│   ├── cart.ts                 # Cart management
│   └── utils.ts                # Utility functions
├── supabase/migrations/        # Database migrations
└── types/
    └── database.ts             # TypeScript database types
```

## Key Concepts

### Stock Management

The system uses a two-tier stock management approach:

1. **Available Stock** = `stock_quantity - stock_reserved`
2. **Stock Reservations**: When checkout begins, stock is reserved for 30 minutes
3. **Atomic Operations**: Database functions prevent race conditions
4. **Audit Trail**: All stock changes are logged in `inventory_log` table

### Order Flow

1. User adds items to cart (client-side validation)
2. User proceeds to checkout
3. API validates stock and prices (server-side)
4. Stock is reserved for 30 minutes
5. Stripe Checkout session created
6. User completes payment on Stripe
7. Webhook receives payment confirmation
8. Order created, stock fulfilled (reserved → actual reduction)
9. User sees order confirmation

### Coupon System

- Percentage or fixed-amount discounts
- Minimum order amount requirements
- Usage limits and expiry dates
- Server-side validation

## Admin Features

Access admin dashboard at `/admin` (requires admin role):

1. **Statistics Dashboard**: Revenue, orders, stock alerts
2. **Product Management**: CRUD operations for products
3. **Order Management**: View and update order statuses
4. **Inventory Logs**: Complete audit trail of stock changes

## API Routes

### POST /api/checkout
Creates a Stripe checkout session with stock and price validation.

### POST /api/webhooks/stripe
Handles Stripe webhook events for order creation and stock management.

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for complete schema including:

- Products (with stock management)
- Orders & Order Items
- Stock Reservations
- Inventory Logs
- Coupons
- User Profiles & Addresses

## Security Features

- Row Level Security (RLS) policies on all tables
- Server-side price validation
- Server-side stock validation
- Stock reservation system
- Database constraints prevent negative stock
- Atomic operations prevent race conditions

## Testing

1. **Test Product Browsing**: Navigate to homepage, filter by category, search
2. **Test Cart**: Add items, update quantities, remove items
3. **Test Checkout Flow**: Complete checkout with test card: `4242 4242 4242 4242`
4. **Test Stock Management**: Try to order more than available stock
5. **Test Coupons**: Use test coupons from seed data (e.g., `WELCOME10`)
6. **Test Admin**: Create admin user and manage products/orders

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Set up Production Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events (see above)
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Troubleshooting

**Orders not creating after payment?**
- Check webhook is properly configured
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook logs in Stripe Dashboard

**Stock not updating?**
- Verify database functions are created (`003_functions.sql`)
- Check Supabase logs for errors

**Cart not persisting?**
- Check browser localStorage
- Verify cart-updated events are firing

## Sample Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Authentication: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any 5-digit ZIP.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.