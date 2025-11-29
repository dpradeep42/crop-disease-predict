/*
  # Create Crop Disease Detection Tables

  ## New Tables
  
  ### `crop_scans`
  - `id` (uuid, primary key)
  - `user_id` (text) - Reference to user who performed scan
  - `image_data` (text) - Base64 encoded image
  - `is_leaf` (boolean) - Whether image is identified as a leaf
  - `confidence_score` (decimal) - Confidence of leaf detection (0-1)
  - `disease_detected` (text, nullable) - Name of detected disease
  - `disease_confidence` (decimal, nullable) - Confidence of disease detection
  - `severity` (text, nullable) - Disease severity: low, medium, high
  - `analyzed_at` (timestamptz) - When analysis was completed
  - `created_at` (timestamptz) - When scan was created
  
  ### `diseases`
  - `id` (uuid, primary key)
  - `name` (text) - Disease name
  - `crop_types` (text[]) - Affected crop types
  - `symptoms` (text) - Description of symptoms
  - `causes` (text) - What causes this disease
  - `created_at` (timestamptz)
  
  ### `remedies`
  - `id` (uuid, primary key)
  - `disease_id` (uuid) - Foreign key to diseases
  - `treatment_name` (text) - Name of treatment
  - `description` (text) - How to apply treatment
  - `type` (text) - organic, chemical, cultural
  - `effectiveness` (text) - high, medium, low
  - `application_timing` (text) - When to apply
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own scans
  - All users can read disease and remedy data
*/

-- Create crop_scans table
CREATE TABLE IF NOT EXISTS crop_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  image_data text NOT NULL,
  is_leaf boolean DEFAULT false,
  confidence_score decimal(3,2) DEFAULT 0.00,
  disease_detected text,
  disease_confidence decimal(3,2),
  severity text CHECK (severity IN ('low', 'medium', 'high')),
  analyzed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create diseases table
CREATE TABLE IF NOT EXISTS diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  crop_types text[] NOT NULL DEFAULT '{}',
  symptoms text NOT NULL,
  causes text NOT NULL,
  prevention text,
  created_at timestamptz DEFAULT now()
);

-- Create remedies table
CREATE TABLE IF NOT EXISTS remedies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
  treatment_name text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('organic', 'chemical', 'cultural', 'biological')),
  effectiveness text NOT NULL CHECK (effectiveness IN ('high', 'medium', 'low')),
  application_timing text,
  precautions text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE crop_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE remedies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crop_scans
CREATE POLICY "Users can view own scans"
  ON crop_scans
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own scans"
  ON crop_scans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own scans"
  ON crop_scans
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own scans"
  ON crop_scans
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- RLS Policies for diseases (read-only for all authenticated users)
CREATE POLICY "All users can view diseases"
  ON diseases
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for remedies (read-only for all authenticated users)
CREATE POLICY "All users can view remedies"
  ON remedies
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample disease data
INSERT INTO diseases (name, crop_types, symptoms, causes, prevention) VALUES
  ('Leaf Blight', ARRAY['Rice', 'Wheat'], 'Brown spots on leaves, wilting, yellowing', 'Fungal infection, high humidity, poor drainage', 'Proper spacing, crop rotation, resistant varieties'),
  ('Rust Disease', ARRAY['Wheat', 'Corn'], 'Orange-red pustules on leaves, premature leaf drop', 'Fungal spores, wet conditions, temperature 15-20°C', 'Early planting, fungicide application, resistant varieties'),
  ('Bacterial Leaf Spot', ARRAY['Cotton', 'Tomato'], 'Dark water-soaked spots, yellowing', 'Bacteria spread by water, contaminated tools', 'Copper-based sprays, remove infected plants, crop rotation'),
  ('Powdery Mildew', ARRAY['Cotton', 'Wheat', 'Grapes'], 'White powdery coating on leaves', 'Fungal infection, high humidity, poor air circulation', 'Sulfur sprays, proper spacing, resistant varieties'),
  ('Late Blight', ARRAY['Tomato', 'Potato'], 'Dark brown spots, white mold underneath leaves', 'Fungal pathogen, cool wet weather', 'Fungicide, remove infected plants, proper drainage')
ON CONFLICT (name) DO NOTHING;

-- Insert remedies for each disease
DO $$
DECLARE
  disease_record RECORD;
BEGIN
  -- Leaf Blight remedies
  FOR disease_record IN SELECT id FROM diseases WHERE name = 'Leaf Blight' LIMIT 1
  LOOP
    INSERT INTO remedies (disease_id, treatment_name, description, type, effectiveness, application_timing, precautions) VALUES
      (disease_record.id, 'Copper Fungicide', 'Apply copper-based fungicide spray to affected areas', 'chemical', 'high', 'At first sign of infection, repeat every 7-10 days', 'Wear protective equipment, avoid spraying in hot sun'),
      (disease_record.id, 'Neem Oil', 'Spray neem oil solution on leaves', 'organic', 'medium', 'Early morning or evening, weekly application', 'Test on small area first, avoid use during flowering'),
      (disease_record.id, 'Crop Rotation', 'Rotate with non-host crops for 2-3 seasons', 'cultural', 'high', 'Plan for next season', 'Keep records of crop rotation schedule');
  END LOOP;

  -- Rust Disease remedies
  FOR disease_record IN SELECT id FROM diseases WHERE name = 'Rust Disease' LIMIT 1
  LOOP
    INSERT INTO remedies (disease_id, treatment_name, description, type, effectiveness, application_timing, precautions) VALUES
      (disease_record.id, 'Sulfur Fungicide', 'Apply sulfur-based fungicide spray', 'chemical', 'high', 'Before rust appears or at first sign', 'Do not apply when temperature exceeds 32°C'),
      (disease_record.id, 'Resistant Varieties', 'Plant rust-resistant crop varieties', 'cultural', 'high', 'At planting time', 'Source certified disease-free seeds'),
      (disease_record.id, 'Remove Infected Leaves', 'Manually remove and destroy infected plant material', 'cultural', 'medium', 'As soon as detected', 'Burn or bury removed material, do not compost');
  END LOOP;

  -- Bacterial Leaf Spot remedies
  FOR disease_record IN SELECT id FROM diseases WHERE name = 'Bacterial Leaf Spot' LIMIT 1
  LOOP
    INSERT INTO remedies (disease_id, treatment_name, description, type, effectiveness, application_timing, precautions) VALUES
      (disease_record.id, 'Copper Hydroxide Spray', 'Apply copper hydroxide solution', 'chemical', 'high', 'Weekly during wet weather', 'Avoid spraying during rain or high winds'),
      (disease_record.id, 'Sanitize Tools', 'Disinfect all farming tools with bleach solution', 'cultural', 'high', 'After each use, especially between plants', 'Use 1:10 bleach to water ratio'),
      (disease_record.id, 'Drip Irrigation', 'Switch to drip irrigation to reduce leaf wetness', 'cultural', 'medium', 'Install before wet season', 'Maintain system to prevent leaks');
  END LOOP;

  -- Powdery Mildew remedies
  FOR disease_record IN SELECT id FROM diseases WHERE name = 'Powdery Mildew' LIMIT 1
  LOOP
    INSERT INTO remedies (disease_id, treatment_name, description, type, effectiveness, application_timing, precautions) VALUES
      (disease_record.id, 'Sulfur Dust', 'Apply sulfur dust to affected plants', 'chemical', 'high', 'At first sign, reapply every 10-14 days', 'Do not apply in hot weather above 32°C'),
      (disease_record.id, 'Baking Soda Spray', 'Mix baking soda with water and spray on plants', 'organic', 'medium', 'Weekly application', 'Test on small area, can cause leaf burn'),
      (disease_record.id, 'Improve Air Circulation', 'Prune plants and increase spacing', 'cultural', 'medium', 'During growing season', 'Do not over-prune, maintain plant vigor');
  END LOOP;

  -- Late Blight remedies
  FOR disease_record IN SELECT id FROM diseases WHERE name = 'Late Blight' LIMIT 1
  LOOP
    INSERT INTO remedies (disease_id, treatment_name, description, type, effectiveness, application_timing, precautions) VALUES
      (disease_record.id, 'Mancozeb Fungicide', 'Apply mancozeb-based fungicide', 'chemical', 'high', 'Preventive application before infection', 'Follow label instructions, use protective gear'),
      (disease_record.id, 'Remove Infected Plants', 'Immediately remove and destroy infected plants', 'cultural', 'high', 'As soon as detected', 'Remove entire plant including roots'),
      (disease_record.id, 'Copper Fungicide', 'Spray copper-based fungicide on healthy plants', 'chemical', 'high', 'Preventive application in humid weather', 'Apply in early morning or evening');
  END LOOP;
END $$;
