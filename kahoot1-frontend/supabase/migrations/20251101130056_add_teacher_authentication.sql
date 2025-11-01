/*
  # Add Teacher Authentication System

  1. New Tables
    - `teachers`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `full_name` (text, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Modifications
    - Add `created_by` column to `quizzes` table to track which teacher created each quiz
  
  3. Security
    - Enable RLS on `teachers` table
    - Add policies for teachers to read their own data
    - Add policies for teachers to manage their own quizzes
    - Update quiz policies to allow teachers to create/edit their own quizzes
*/

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add created_by to quizzes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quizzes' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN created_by uuid REFERENCES teachers(id);
  END IF;
END $$;

-- Enable RLS on teachers table
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Policies for teachers table
CREATE POLICY "Teachers can read own data"
  ON teachers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Teachers can update own data"
  ON teachers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update quiz policies for teachers
CREATE POLICY "Teachers can create quizzes"
  ON quizzes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = auth.uid()
    )
  );

CREATE POLICY "Teachers can read own quizzes"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR created_by IS NULL
  );

CREATE POLICY "Teachers can update own quizzes"
  ON quizzes
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Teachers can delete own quizzes"
  ON quizzes
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Update questions policies for teachers
CREATE POLICY "Teachers can create questions for own quizzes"
  ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );

CREATE POLICY "Teachers can read questions for own quizzes"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND (quizzes.created_by = auth.uid() OR quizzes.created_by IS NULL)
    )
  );

CREATE POLICY "Teachers can update questions for own quizzes"
  ON questions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND quizzes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete questions for own quizzes"
  ON questions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );

-- Function to create teacher profile on signup
CREATE OR REPLACE FUNCTION create_teacher_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO teachers (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create teacher profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_teacher_profile();