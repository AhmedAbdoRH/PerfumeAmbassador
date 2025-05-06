/*
  # Fix Products RLS Policies

  1. Changes
    - Remove existing RLS policies for products table
    - Add new comprehensive RLS policies
      - Allow authenticated users full access (ALL operations)
      - Allow public users read-only access (SELECT operations)

  2. Security
    - Enable RLS on products table
    - Add policies for both authenticated and public users
    - Ensure proper access control based on user role
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;
DROP POLICY IF EXISTS "Allow public to read products" ON products;
DROP POLICY IF EXISTS "Allow public to view products" ON products;

-- Create new policies
CREATE POLICY "Enable read access for everyone on products"
ON products
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable full access for authenticated users on products"
ON products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;