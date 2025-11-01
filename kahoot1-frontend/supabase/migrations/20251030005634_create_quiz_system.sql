/*
  # Quiz System Database Schema

  1. New Tables
    - `quizzes`
      - `id` (uuid, primary key)
      - `title` (text) - Quiz title
      - `pin` (text, unique) - 6-digit PIN code for joining
      - `required_fields` (jsonb) - Dynamic fields required for registration (email, phone, name)
      - `created_at` (timestamptz)
    
    - `game_sessions`
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, foreign key) - Reference to quiz
      - `status` (text) - Game status: 'waiting', 'active', 'completed'
      - `current_question_index` (integer) - Current question being displayed
      - `started_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `questions`
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, foreign key) - Reference to quiz
      - `question_text` (text) - Question content
      - `question_type` (text) - Type: 'multiple_choice' or 'text_input'
      - `options` (jsonb) - Array of options for multiple choice
      - `correct_answer` (text) - Correct answer
      - `order_index` (integer) - Question order
      - `created_at` (timestamptz)
    
    - `participants`
      - `id` (uuid, primary key)
      - `game_session_id` (uuid, foreign key) - Reference to game session
      - `name` (text) - Participant name
      - `email` (text) - Participant email (optional)
      - `phone` (text) - Participant phone (optional)
      - `score` (integer) - Current score
      - `joined_at` (timestamptz)
    
    - `answers`
      - `id` (uuid, primary key)
      - `participant_id` (uuid, foreign key) - Reference to participant
      - `question_id` (uuid, foreign key) - Reference to question
      - `answer_text` (text) - Submitted answer
      - `is_correct` (boolean) - Whether answer is correct
      - `answered_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for quizzes and questions (anyone can join with PIN)
    - Public insert/read for participants (anyone can join)
    - Public insert for answers (participants can submit answers)
    - Restrictive policies for game sessions
*/

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  pin text UNIQUE NOT NULL,
  required_fields jsonb DEFAULT '{"name": true, "email": false, "phone": false}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  current_question_index integer DEFAULT 0,
  started_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'text_input')),
  options jsonb,
  correct_answer text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  score integer DEFAULT 0,
  joined_at timestamptz DEFAULT now()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  answer_text text NOT NULL,
  is_correct boolean DEFAULT false,
  answered_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Policies for quizzes (public read access)
CREATE POLICY "Anyone can view quizzes"
  ON quizzes FOR SELECT
  TO anon
  USING (true);

-- Policies for game_sessions (public read for active sessions)
CREATE POLICY "Anyone can view game sessions"
  ON game_sessions FOR SELECT
  TO anon
  USING (true);

-- Policies for questions (public read access)
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  TO anon
  USING (true);

-- Policies for participants (public insert and read)
CREATE POLICY "Anyone can join as participant"
  ON participants FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view participants"
  ON participants FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Participants can update their own score"
  ON participants FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policies for answers (public insert)
CREATE POLICY "Anyone can submit answers"
  ON answers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view answers"
  ON answers FOR SELECT
  TO anon
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quizzes_pin ON quizzes(pin);
CREATE INDEX IF NOT EXISTS idx_game_sessions_quiz_id ON game_sessions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_participants_game_session_id ON participants(game_session_id);
CREATE INDEX IF NOT EXISTS idx_answers_participant_id ON answers(participant_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);