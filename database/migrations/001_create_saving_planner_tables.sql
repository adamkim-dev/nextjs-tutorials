-- Smart Saving Planner Database Migration
-- This script creates all necessary tables for the Smart Saving Planner feature

-- First, update the users table to add salary and daily_allowance fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS salary NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_allowance NUMERIC DEFAULT 0;

-- Create enum types for frequency and saving plan types
DO $$ BEGIN
    CREATE TYPE frequency_type AS ENUM ('monthly', 'weekly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE saving_plan_type AS ENUM ('send_home', 'saving', 'investing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create fixed_expenses table
CREATE TABLE IF NOT EXISTS fixed_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    frequency frequency_type NOT NULL DEFAULT 'monthly',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debts table
CREATE TABLE IF NOT EXISTS debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creditor TEXT NOT NULL,
    amount_remaining NUMERIC NOT NULL CHECK (amount_remaining >= 0),
    monthly_payment NUMERIC NOT NULL CHECK (monthly_payment >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    borrower TEXT NOT NULL,
    amount_remaining NUMERIC NOT NULL CHECK (amount_remaining >= 0),
    monthly_collect NUMERIC NOT NULL CHECK (monthly_collect >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saving_plans table
CREATE TABLE IF NOT EXISTS saving_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type saving_plan_type NOT NULL,
    percentage_of_salary NUMERIC CHECK (percentage_of_salary >= 0 AND percentage_of_salary <= 100),
    fixed_amount NUMERIC CHECK (fixed_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure either percentage_of_salary or fixed_amount is set, but not both
    CONSTRAINT saving_plan_amount_check CHECK (
        (percentage_of_salary IS NOT NULL AND fixed_amount IS NULL) OR
        (percentage_of_salary IS NULL AND fixed_amount IS NOT NULL)
    )
);

-- Create daily_spending_logs table
CREATE TABLE IF NOT EXISTS daily_spending_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount_spent NUMERIC NOT NULL CHECK (amount_spent >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure one log per user per day
    UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_user_id ON fixed_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_saving_plans_user_id ON saving_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_spending_logs_user_id ON daily_spending_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_spending_logs_date ON daily_spending_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_spending_logs_user_date ON daily_spending_logs(user_id, date);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at columns
CREATE TRIGGER update_fixed_expenses_updated_at 
    BEFORE UPDATE ON fixed_expenses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debts_updated_at 
    BEFORE UPDATE ON debts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at 
    BEFORE UPDATE ON loans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saving_plans_updated_at 
    BEFORE UPDATE ON saving_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_spending_logs_updated_at 
    BEFORE UPDATE ON daily_spending_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE saving_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_spending_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to ensure users can only access their own data
CREATE POLICY "Users can view their own fixed expenses" ON fixed_expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fixed expenses" ON fixed_expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fixed expenses" ON fixed_expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fixed expenses" ON fixed_expenses
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own debts" ON debts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts" ON debts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" ON debts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" ON debts
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own loans" ON loans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans" ON loans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans" ON loans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans" ON loans
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own saving plans" ON saving_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saving plans" ON saving_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saving plans" ON saving_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saving plans" ON saving_plans
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own daily spending logs" ON daily_spending_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily spending logs" ON daily_spending_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily spending logs" ON daily_spending_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily spending logs" ON daily_spending_logs
    FOR DELETE USING (auth.uid() = user_id);