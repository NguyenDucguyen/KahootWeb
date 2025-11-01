/*
  # Add BOB file support fields to quizzes table

  1. Changes to Tables
    - `quizzes`
      - Add `background_image` (text) - Base64 encoded background image
      - Add `audio_file` (text) - Base64 encoded audio file
      - Add `default_timer` (integer) - Default timer for questions
      - Add `student_count` (integer) - Maximum number of students
      - Add `grid_columns` (integer) - Grid layout columns
    
    - `questions`
      - Add `question_image` (text) - Base64 encoded question image
      - Add `timer` (integer) - Individual question timer

  2. Notes
    - These fields support the .bob file format
    - All fields are optional to maintain backward compatibility
*/

-- Add fields to quizzes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quizzes' AND column_name = 'background_image'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN background_image text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quizzes' AND column_name = 'audio_file'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN audio_file text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quizzes' AND column_name = 'default_timer'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN default_timer integer DEFAULT 30;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quizzes' AND column_name = 'student_count'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN student_count integer DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quizzes' AND column_name = 'grid_columns'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN grid_columns integer DEFAULT 6;
  END IF;
END $$;

-- Add fields to questions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'question_image'
  ) THEN
    ALTER TABLE questions ADD COLUMN question_image text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'timer'
  ) THEN
    ALTER TABLE questions ADD COLUMN timer integer DEFAULT 30;
  END IF;
END $$;
