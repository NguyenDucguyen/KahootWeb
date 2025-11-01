import { useState, useEffect } from 'react';
import RegistrationForm from '../components/RegistrationForm';
import WaitingRoom from '../components/WaitingRoom';
import QuizGame from '../components/QuizGame';
import { supabase, Quiz, GameSession, Participant, Question } from '../lib/supabase';
import { useParams } from 'react-router-dom';

type FlowState = 'registration' | 'waiting' | 'playing';

export default function PlayerFlow() {
  const { pin } = useParams<{ pin: string }>();
  const [state, setState] = useState<FlowState>('registration');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pin) return;
    loadQuizData();
  }, [pin]);

  const loadQuizData = async () => {
    if (!pin) return;

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('pin', pin)
      .maybeSingle();

    if (quizError || !quizData) {
      setError('Mã PIN không đúng. Vui lòng thử lại.');
      setLoading(false);
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('quiz_id', quizData.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionError || !sessionData) {
      setError('Không tìm thấy phiên chơi. Vui lòng liên hệ người tổ chức.');
      setLoading(false);
      return;
    }

    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizData.id)
      .order('order_index', { ascending: true });

    setQuiz(quizData);
    setGameSession(sessionData);
    setQuestions(questionsData || []);
    setLoading(false);
  };

  const handleRegister = async (data: { name: string; email?: string; phone?: string }) => {
    if (!gameSession) return;

    const { data: participantData, error } = await supabase
      .from('participants')
      .insert({
        game_session_id: gameSession.id,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        score: 0,
      })
      .select()
      .single();

    if (error || !participantData) {
      setError('Không thể đăng ký. Vui lòng thử lại.');
      return;
    }

    setCurrentParticipant(participantData);

    if (gameSession.status === 'active') {
      setState('playing');
    } else {
      setState('waiting');
    }
  };

  const handleGameStart = () => {
    setState('playing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Có lỗi xảy ra</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (state === 'registration' && quiz) {
    return <RegistrationForm quiz={quiz} onRegister={handleRegister} />;
  }

  if (state === 'waiting' && quiz && gameSession && currentParticipant) {
    return (
      <WaitingRoom
        quiz={quiz}
        gameSession={gameSession}
        currentParticipant={currentParticipant}
        onGameStart={handleGameStart}
      />
    );
  }

  if (state === 'playing' && gameSession && currentParticipant && questions.length > 0) {
    return (
      <QuizGame
        gameSession={gameSession}
        currentParticipant={currentParticipant}
        questions={questions}
      />
    );
  }

  return null;
}
