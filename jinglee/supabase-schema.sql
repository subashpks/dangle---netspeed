-- ==============================================================================
-- JINGLEE PAYMENT GATEWAY & DEVICE-BOUND POS PLATFORM
-- Supabase PostgreSQL Schema & Security Policies (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS (Tenant level)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_type TEXT DEFAULT 'retail',
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. DEVICE SETS (Groupings of POS terminals / Outlets / Lanes)
CREATE TABLE IF NOT EXISTS public.device_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g., "Counter 1 - Flagship Branch"
    location_tag TEXT DEFAULT 'Main Counter',
    settlement_upi_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PURCHASES & RAZORPAY ORDERS
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    plan_tier TEXT NOT NULL, -- 'Starter Set', 'Pro Set Cluster', 'Enterprise Mesh'
    amount_in_paise BIGINT NOT NULL, -- 100 paise = 1 INR
    currency TEXT DEFAULT 'INR' NOT NULL,
    razorpay_order_id TEXT UNIQUE NOT NULL,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    payment_status TEXT DEFAULT 'created' NOT NULL, -- 'created', 'paid', 'failed'
    device_allowance INT DEFAULT 1 NOT NULL,
    license_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. REGISTERED DEVICES (Bound to Set and local cryptographic key)
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    set_id UUID REFERENCES public.device_sets(id) ON DELETE SET NULL,
    device_name TEXT NOT NULL,
    device_fingerprint TEXT UNIQUE NOT NULL,
    pairing_code TEXT,
    public_key TEXT,
    status TEXT DEFAULT 'active' NOT NULL, -- 'pending', 'active', 'revoked'
    device_model TEXT DEFAULT 'Jinglee Terminal V1',
    last_synced_at TIMESTAMPTZ,
    last_ip TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TRANSACTIONS LEDGER (Realtime synced)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    set_id UUID REFERENCES public.device_sets(id) ON DELETE SET NULL,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    razorpay_payment_id TEXT,
    amount_in_paise BIGINT NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    payment_method TEXT NOT NULL, -- 'upi_qr', 'card', 'tap_pay', 'link'
    status TEXT NOT NULL, -- 'success', 'refunded', 'offline_buffered'
    customer_ref TEXT,
    signature TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Helper to check ownership
CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organizations
    WHERE id = target_org_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations Policy
CREATE POLICY "Users can manage their own org" 
ON public.organizations FOR ALL 
USING (owner_id = auth.uid());

-- Device Sets Policy
CREATE POLICY "Users can manage sets in their org" 
ON public.device_sets FOR ALL 
USING (public.is_org_member(org_id));

-- Purchases Policy
CREATE POLICY "Users can view purchases for their org" 
ON public.purchases FOR ALL 
USING (public.is_org_member(org_id));

-- Devices Policy
CREATE POLICY "Users can manage devices in their org" 
ON public.devices FOR ALL 
USING (public.is_org_member(org_id));

-- Transactions Policy
CREATE POLICY "Users can view transactions in their org" 
ON public.transactions FOR ALL 
USING (public.is_org_member(org_id));

-- Enable Realtime replication for transactions and devices
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
