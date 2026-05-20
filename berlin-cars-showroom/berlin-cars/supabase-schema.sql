-- =============================================
-- Berlin Cars Showroom — Supabase SQL Setup
-- Run this in Supabase SQL Editor
-- =============================================

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price INTEGER NOT NULL,
  km INTEGER NOT NULL,
  color TEXT,
  fuel TEXT DEFAULT 'Petrol',
  transmission TEXT DEFAULT 'Automatic',
  seats INTEGER DEFAULT 5,
  condition TEXT DEFAULT 'Used',
  location TEXT DEFAULT 'Doha',
  description TEXT,
  features TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  badge TEXT DEFAULT '',
  is_sold BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  whatsapp TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Car photos table
CREATE TABLE IF NOT EXISTS car_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  is_cover BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default admin (password: BerlinCars2025)
-- You can change password in Admin Panel after first login
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (username) DO NOTHING;

-- Storage bucket for car photos (run in Supabase Dashboard > Storage)
-- Create a bucket named: car-photos (set to public)

-- Enable Row Level Security
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Public can read cars and photos
CREATE POLICY "Public read cars" ON cars FOR SELECT USING (true);
CREATE POLICY "Public read photos" ON car_photos FOR SELECT USING (true);

-- Only service role can write (handled server-side via API routes)
CREATE POLICY "Service role all" ON cars FOR ALL USING (true);
CREATE POLICY "Service role photos all" ON car_photos FOR ALL USING (true);
CREATE POLICY "Service role admins" ON admins FOR ALL USING (true);
