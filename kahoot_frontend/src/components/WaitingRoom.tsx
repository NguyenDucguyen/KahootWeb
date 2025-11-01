import { useEffect, useState } from 'react';
import { Users, Clock } from 'lucide-react';
import { supabase, Participant, GameSession, Quiz } from '../lib/supabase';

interface WaitingRoomProps {
  quiz: Quiz;
  gameSession: GameSession;
  currentParticipant: Participant;
  onGameStart: () => void;
}

export default function WaitingRoom({ quiz, gameSession, currentParticipant, onGameStart }: WaitingRoomProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    loadParticipants();

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          onGameStart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const channel = supabase
      .channel('participants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `game_session_id=eq.${gameSession.id}`,
        },
        () => {
          loadParticipants();
        }
      )
      .subscribe();

    const sessionChannel = supabase
      .channel('session-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${gameSession.id}`,
        },
        (payload) => {
          const updatedSession = payload.new as GameSession;
          if (updatedSession.status === 'active') {
            clearInterval(countdownInterval);
            onGameStart();
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(countdownInterval);
      channel.unsubscribe();
      sessionChannel.unsubscribe();
    };
  }, [gameSession.id]);

  const loadParticipants = async () => {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('game_session_id', gameSession.id)
      .order('joined_at', { ascending: true });

    if (!error && data) {
      setParticipants(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 relative">
            <span className="text-5xl font-bold text-white">{countdown}</span>
            <div className="absolute inset-0 rounded-full border-4 border-white opacity-20 animate-ping"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {quiz.title}
          </h1>
          <p className="text-xl text-gray-600">Trò chơi bắt đầu sau {countdown} giây...</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-semibold text-gray-700">
                Người chơi đã tham gia
              </span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {participants.length}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all duration-300 ${
                  participant.id === currentParticipant.id
                    ? 'border-purple-500 ring-4 ring-purple-100'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {participant.name}
                      {participant.id === currentParticipant.id && (
                        <span className="ml-2 text-xs text-purple-600">(Bạn)</span>
                      )}
                    </p>
                    {participant.email && (
                      <p className="text-sm text-gray-500 truncate">{participant.email}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {participants.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p>Chưa có người chơi nào tham gia</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">Tự động bắt đầu sau {countdown} giây</span>
          </div>
        </div>
      </div>
    </div>
  );
}
