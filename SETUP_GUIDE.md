# Quick Setup Guide

Follow these steps to get your e-commerce system running.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be ready

## Step 3: Run Database Migrations

In your Supabase project dashboard:

1. Go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**
5. Repeat for `002_seed_data.sql` and `003_functions.sql`

## Step 4: Get Supabase Credentials

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy the following:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - anon/public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - service_role key (`SUPABASE_SERVICE_ROLE_KEY`) - **Keep this secret!**

## Step 5: Set Up Stripe

1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your test API keys from **Developers** → **API keys**:
   - Publishable key (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
   - Secret key (`STRIPE_SECRET_KEY`)

## Step 6: Configure Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 7: Set Up Stripe Webhooks (Local Development)

Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

Run webhook forwarding:
```bash
stripe login
stripe listen --forward-to https://studious-doodle-7v9ppg4w4gpgfp9jx-3000.app.github.dev/api/webhooks/stripe
```

Copy the webhook signing secret (starts with `whsec_`) to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Step 8: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 9: Create Test Data (Optional)

The seed data includes 12 sample products with various stock levels.

## Step 10: Create Admin Account

1. Sign up at [http://localhost:3000/auth](http://localhost:3000/auth)
2. Go to Supabase SQL Editor
3. Run this query (replace with your user ID):

```sql
-- Find your user ID
SELECT id, email FROM auth.users;

-- Set role to admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-id-here';
```

4. Refresh your browser and you'll see the "Admin Dashboard" link

## Testing the System

### Test Product Browsing
- Browse products on homepage
- Filter by category (Electronics, Accessories)
- Search for products

### Test Shopping Cart
- Add products to cart
- Update quantities
- Remove items
- Cart persists across page reloads

### Test Checkout Flow

1. Add items to cart
2. Click "Proceed to Checkout"
3. Fill in shipping details
4. Try coupon code: `WELCOME10` (10% off)
5. Click "Proceed to Payment"

### Test Stripe Payment

Use test card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

### Test Order Success
- Complete payment
- See order confirmation
- Check email (if configured)

### Test Admin Dashboard
- Go to `/admin`
- View statistics
- Create/edit/delete products
- Manage orders
- View inventory logs

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add all environment variables from `.env.local`
5. Update `NEXT_PUBLIC_APP_URL` to your production URL
6. Deploy

### Set Up Production Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `checkout.session.async_payment_failed`
5. Copy the signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
7. Redeploy

## Common Issues

### "Orders not creating"
- Webhook not configured properly
- Check Stripe webhook logs
- Verify `STRIPE_WEBHOOK_SECRET` is correct

### "Stock not updating"
- Database functions not created
- Run `003_functions.sql` migration

### "Can't access admin dashboard"
- User role is not 'admin'
- Run the admin update query

### "Cart not working"
- Browser blocking localStorage
- Check browser console for errors

## Test Coupons

The seed data includes these test coupons:

- `WELCOME10` - 10% off orders over ₹10
- `SAVE500` - ₹5 off orders over ₹50
- `FLASH20` - 20% off orders over ₹20

## Need Help?

- Check the main README.md for detailed documentation
- Review the code comments
- Open an issue on GitHub

## Next Steps

1. Customize the design and branding
2. Add more product categories
3. Set up email notifications (Supabase supports Resend, SendGrid, etc.)
4. Configure Supabase Storage for product images
5. Add more payment methods
6. Implement customer reviews
7. Add analytics tracking

Happy building! 🚀