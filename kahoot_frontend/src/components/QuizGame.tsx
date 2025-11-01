import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Send, Trophy, Users, Clock } from 'lucide-react';
import { supabase, Question, Participant, GameSession } from '../lib/supabase';

interface QuizGameProps {
  gameSession: GameSession;
  currentParticipant: Participant;
  questions: Question[];
}

export default function QuizGame({ gameSession, currentParticipant, questions }: QuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(currentParticipant.score);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answerRank, setAnswerRank] = useState<number | null>(null);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    setTimeLeft(30);
    loadAnswerStats();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!submitted) {
            handleTimeOut();
          } else {
            setSubmitted(true);
            loadAnswerStats();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const channel = supabase
      .channel('game-session-updates')
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

          if (updatedSession.status === 'completed') {
            setGameCompleted(true);
          } else if (updatedSession.current_question_index !== currentQuestionIndex) {
            setCurrentQuestionIndex(updatedSession.current_question_index);
            setSubmitted(false);
            setAnswerLocked(false);
            setSelectedAnswer('');
            setTextAnswer('');
            setIsCorrect(null);
            setCorrectCount(0);
            setIncorrectCount(0);
            setTimeLeft(30);
            setAnswerRank(null);
            setPlayerRank(null);
          }
        }
      )
      .subscribe();

    const answersChannel = supabase
      .channel('answers-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'answers',
          filter: `question_id=eq.${currentQuestion?.id}`,
        },
        () => {
          if (timeLeft === 0 || submitted) {
            loadAnswerStats();
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      channel.unsubscribe();
      answersChannel.unsubscribe();
    };
  }, [gameSession.id, currentQuestionIndex, currentQuestion?.id]);

  const loadAnswerStats = async () => {
    if (!currentQuestion) return;

    const { data: answers } = await supabase
      .from('answers')
      .select('is_correct')
      .eq('question_id', currentQuestion.id);

    if (answers) {
      const correct = answers.filter(a => a.is_correct).length;
      const incorrect = answers.filter(a => !a.is_correct).length;
      setCorrectCount(correct);
      setIncorrectCount(incorrect);
    }

    const { data: allParticipants } = await supabase
      .from('participants')
      .select('id, score')
      .eq('game_session_id', gameSession.id)
      .order('score', { ascending: false });

    if (allParticipants) {
      setTotalPlayers(allParticipants.length);
      const rank = allParticipants.findIndex(p => p.id === currentParticipant.id) + 1;
      setPlayerRank(rank);
    }
  };

  const handleTimeOut = async () => {
    if (submitted) return;

    setIsCorrect(false);

    await supabase.from('answers').insert({
      participant_id: currentParticipant.id,
      question_id: currentQuestion.id,
      answer_text: '',
      is_correct: false,
    });

    setTimeout(() => {
      setSubmitted(true);
      loadAnswerStats();
    }, 100);
  };

  const handleSubmit = async () => {
    if (answerLocked) return;

    const answer = currentQuestion.question_type === 'multiple_choice' ? selectedAnswer : textAnswer;

    if (!answer.trim()) return;

    setAnswerLocked(true);

    const correct = answer.toLowerCase().trim() === currentQuestion.correct_answer.toLowerCase().trim();
    setIsCorrect(correct);

    const newScore = correct ? score + 10 : score;
    setScore(newScore);

    await supabase.from('answers').insert({
      participant_id: currentParticipant.id,
      question_id: currentQuestion.id,
      answer_text: answer,
      is_correct: correct,
    });

    if (correct) {
      await supabase
        .from('participants')
        .update({ score: newScore })
        .eq('id', currentParticipant.id);
    }

    const { data: allAnswers } = await supabase
      .from('answers')
      .select('id, answered_at')
      .eq('question_id', currentQuestion.id)
      .order('answered_at', { ascending: true });

    if (allAnswers) {
      const rank = allAnswers.findIndex((a) => a.id === allAnswers[allAnswers.length - 1]?.id) + 1;
      setAnswerRank(rank);
    }
  };

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Hoàn Thành!
          </h1>
          <p className="text-gray-600 mb-6">Cảm ơn bạn đã tham gia</p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
            <p className="text-gray-700 mb-2">Điểm số của bạn</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {score}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <p className="text-gray-600">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
            <span className="text-sm font-semibold text-gray-700">
              Câu {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
              timeLeft <= 10 ? 'bg-red-100 animate-pulse' : 'bg-orange-100'
            }`}>
              <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-600' : 'text-orange-600'}`} />
              <span className={`font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-orange-600'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-full">
              <span className="text-white font-bold">Điểm: {score}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
          {currentQuestion.question_image && (
            <div className="mb-6 flex justify-center">
              <img
                src={currentQuestion.question_image}
                alt="Question"
                className="max-w-full max-h-96 rounded-xl shadow-lg object-contain"
              />
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            {currentQuestion.question_text}
          </h2>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className={`rounded-3xl p-8 text-center shadow-2xl transform transition-all ${
              isCorrect
                ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-600'
                : 'bg-gradient-to-br from-red-400 via-red-500 to-red-600'
            }`}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
                {isCorrect ? (
                  <CheckCircle className="w-12 h-12 text-green-600" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-600" />
                )}
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">
                {isCorrect ? '🎉 Chính xác!' : timeLeft === 0 ? '⏰ Hết giờ!' : '❌ Sai rồi!'}
              </h3>
              {!isCorrect && (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4">
                  <p className="text-white text-sm mb-1">Đáp án đúng:</p>
                  <p className="text-white font-bold text-xl">{currentQuestion.correct_answer}</p>
                </div>
              )}

              <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-white text-sm mb-1">Điểm của bạn</p>
                <p className="text-5xl font-bold text-white">{score}</p>
              </div>

              {playerRank && (
                <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-300" />
                  <div className="text-white">
                    <span className="text-2xl font-bold">#{playerRank}</span>
                    <span className="text-sm ml-2">/ {totalPlayers} người chơi</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">{correctCount}</p>
                <p className="text-sm text-gray-600">Trả lời đúng</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                  <XCircle className="w-7 h-7 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600 mb-1">{incorrectCount}</p>
                <p className="text-sm text-gray-600">Trả lời sai</p>
              </div>
            </div>

            <p className="text-center text-gray-600 text-sm animate-pulse">Chờ câu hỏi tiếp theo...</p>
          </div>
        ) : timeLeft > 0 ? (
          <div className="space-y-4">
            {answerLocked && answerRank && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">Bạn đã trả lời</p>
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                  <p className="text-4xl font-bold text-yellow-600">#{answerRank}</p>
                </div>
                <p className="text-sm text-gray-600 mt-2">Chờ hết giờ để xem kết quả...</p>
              </div>
            )}

            {currentQuestion.question_type === 'multiple_choice' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !answerLocked && setSelectedAnswer(option)}
                    disabled={answerLocked}
                    className={`p-6 rounded-xl border-2 font-semibold text-lg transition-all ${
                      answerLocked
                        ? 'opacity-50 cursor-not-allowed'
                        : 'transform hover:scale-105'
                    } ${
                      selectedAnswer === option
                        ? 'border-purple-500 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={textAnswer}
                  onChange={(e) => !answerLocked && setTextAnswer(e.target.value)}
                  disabled={answerLocked}
                  placeholder="Nhập câu trả lời của bạn..."
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !answerLocked) {
                      handleSubmit();
                    }
                  }}
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={
                answerLocked ||
                (currentQuestion.question_type === 'multiple_choice'
                  ? !selectedAnswer
                  : !textAnswer.trim())
              }
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-6"
            >
              <Send className="w-5 h-5" />
              Gửi Câu Trả Lời
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-xl text-gray-600 font-semibold">Đang tính kết quả...</p>
          </div>
        )}
      </div>
    </div>
  );
}
