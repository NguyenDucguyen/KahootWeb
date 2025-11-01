import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Quiz {
  id: string;
  title: string;
  pin: string;
  required_fields: {
    name: boolean;
    email: boolean;
    phone: boolean;
  };
  created_at: string;
}

export interface GameSession {
  id: string;
  quiz_id: string;
  status: 'waiting' | 'active' | 'completed';
  current_question_index: number;
  started_at: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'text_input';
  options: string[] | null;
  correct_answer: string;
  order_index: number;
  created_at: string;
}

export interface Participant {
  id: string;
  game_session_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  score: number;
  joined_at: string;
}

export interface Answer {
  id: string;
  participant_id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  answered_at: string;
}
