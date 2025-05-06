/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (serial, primary key)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `price` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `products` table 
    - Add policies for authenticated users to manage products
*/

CREATE TABLE IF NOT EXISTS products(
  id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete products"
  ON products 
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow public to read products"
  ON products
  FOR SELECT
  TO anon
  USING (true);