import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Play, SkipForward, Trophy } from 'lucide-react';
import { supabase, GameSession, Participant, Question } from '../lib/supabase';

export default function HostControl() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    loadGameData();

    const channel = supabase
      .channel('host-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'participants',
          filter: `game_session_id=eq.${sessionId}`,
        },
        () => {
          loadParticipants();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [sessionId]);

  const loadGameData = async () => {
    if (!sessionId) return;

    const { data: session } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (session) {
      setGameSession(session);

      const { data: quiz } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', session.quiz_id)
        .single();

      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', session.quiz_id)
        .order('order_index');

      if (questionsData) setQuestions(questionsData);
    }

    await loadParticipants();
    setLoading(false);
  };

  const loadParticipants = async () => {
    if (!sessionId) return;

    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('game_session_id', sessionId)
      .order('score', { ascending: false });

    if (data) setParticipants(data);
  };

  const handleStartGame = async () => {
    if (!sessionId) return;

    await supabase
      .from('game_sessions')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    setGameSession((prev) => prev ? { ...prev, status: 'active' } : null);
  };

  const handleNextQuestion = async () => {
    if (!sessionId || !gameSession) return;

    const nextIndex = gameSession.current_question_index + 1;

    if (nextIndex >= questions.length) {
      await supabase
        .from('game_sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId);

      setGameSession((prev) => prev ? { ...prev, status: 'completed' } : null);
    } else {
      await supabase
        .from('game_sessions')
        .update({ current_question_index: nextIndex })
        .eq('id', sessionId);

      setGameSession((prev) =>
        prev ? { ...prev, current_question_index: nextIndex } : null
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <p className="text-white text-xl">Đang tải...</p>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <p className="text-white text-xl">Không tìm thấy phiên chơi</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Điều khiển trò chơi</h1>
              <p className="text-gray-600">
                Câu hỏi {gameSession.current_question_index + 1} / {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 px-4 py-2 rounded-full flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-600">{participants.length}</span>
              </div>
              {gameSession.status === 'waiting' && (
                <button
                  onClick={handleStartGame}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Bắt đầu
                </button>
              )}
              {gameSession.status === 'active' && (
                <button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2"
                >
                  <SkipForward className="w-5 h-5" />
                  Câu tiếp theo
                </button>
              )}
            </div>
          </div>

          {gameSession.status === 'waiting' && (
            <div className="text-center py-8">
              <p className="text-2xl font-bold text-gray-700 mb-2">
                Đang chờ người chơi tham gia...
              </p>
              <p className="text-gray-600">Người chơi sử dụng PIN để tham gia</p>
            </div>
          )}

          {gameSession.status === 'completed' && (
            <div className="text-center py-8">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              <p className="text-2xl font-bold text-gray-700 mb-4">Trò chơi đã kết thúc!</p>
              <button
                onClick={() => navigate('/admin')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Quay lại Dashboard
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Bảng xếp hạng</h2>
          {participants.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Chưa có người chơi nào</p>
          ) : (
            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                          ? 'bg-gray-400'
                          : index === 2
                          ? 'bg-orange-600'
                          : 'bg-blue-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{participant.name}</p>
                      {participant.email && (
                        <p className="text-sm text-gray-600">{participant.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {participant.score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
