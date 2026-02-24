/*
  # Acharya Engine v78.1 - Complete Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `dob` (date) - Date of birth for astrological calculations
      - `birth_time` (time) - Time of birth
      - `birth_place` (text) - Place of birth
      - `faith` (text) - Either 'sikhism' or 'hinduism' for remedy customization
      - `display_currency` (text) - 'INR' or 'USD'
      - `credits` (integer) - Available prediction credits
      - `is_admin` (boolean) - Admin access flag
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `packages`
      - `id` (uuid, primary key)
      - `name` (text) - Package name
      - `credits` (integer) - Number of credits included
      - `price_inr` (numeric) - Price in INR
      - `price_usd` (numeric) - Price in USD
      - `is_active` (boolean) - Package availability
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)

    - `predictions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `query` (text) - User's question
      - `query_category` (text) - Career, Wealth, Health, etc.
      - `prediction_content` (jsonb) - Full structured prediction
      - `created_at` (timestamptz)

    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `package_id` (uuid, references packages)
      - `payment_id` (text) - External payment gateway ID
      - `order_id` (text) - Unique order ID
      - `signature` (text) - HMAC signature for verification
      - `amount` (numeric) - Transaction amount
      - `currency` (text) - INR or USD
      - `credits_added` (integer) - Credits added to account
      - `status` (text) - pending, completed, failed
      - `created_at` (timestamptz)
      - `verified_at` (timestamptz)

    - `admin_metrics`
      - `id` (uuid, primary key)
      - `date` (date) - Metric date
      - `total_revenue` (numeric) - Gross revenue
      - `api_cost` (numeric) - AI API costs
      - `net_profit` (numeric) - Revenue - API costs
      - `predictions_count` (integer) - Predictions generated
      - `new_users` (integer) - New signups
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Profiles: Users can view and update their own profile
    - Packages: Public read access, admin write access
    - Predictions: Users can only access their own predictions
    - Transactions: Users can view their own transactions
    - Admin metrics: Admin-only access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  dob date NOT NULL,
  birth_time time,
  birth_place text NOT NULL,
  faith text NOT NULL CHECK (faith IN ('sikhism', 'hinduism')),
  display_currency text NOT NULL DEFAULT 'INR' CHECK (display_currency IN ('INR', 'USD')),
  credits integer NOT NULL DEFAULT 0,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits integer NOT NULL,
  price_inr numeric NOT NULL,
  price_usd numeric NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages"
  ON packages FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage packages"
  ON packages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  query text NOT NULL,
  query_category text NOT NULL,
  prediction_content jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own predictions"
  ON predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own predictions"
  ON predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid REFERENCES packages(id),
  payment_id text,
  order_id text NOT NULL,
  signature text,
  amount numeric NOT NULL,
  currency text NOT NULL CHECK (currency IN ('INR', 'USD')),
  credits_added integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create admin_metrics table
CREATE TABLE IF NOT EXISTS admin_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_revenue numeric NOT NULL DEFAULT 0,
  api_cost numeric NOT NULL DEFAULT 0,
  net_profit numeric NOT NULL DEFAULT 0,
  predictions_count integer NOT NULL DEFAULT 0,
  new_users integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view metrics"
  ON admin_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can manage metrics"
  ON admin_metrics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert default packages
INSERT INTO packages (name, credits, price_inr, price_usd, sort_order)
VALUES 
  ('Starter Pack', 3, 499, 7, 1),
  ('Explorer Pack', 10, 1499, 20, 2),
  ('Master Pack', 25, 2999, 40, 3),
  ('Guru Pack', 50, 4999, 65, 4)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_admin_metrics_date ON admin_metrics(date DESC);