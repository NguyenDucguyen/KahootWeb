import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Play, SkipForward, Trophy, Copy, CheckCircle, Link as LinkIcon } from 'lucide-react';

// --- DỮ LIỆU GIẢ ---

// Interface cho người chơi giả
interface FakeParticipant {
  id: string;
  name: string;
  score: number;
}

// Danh sách tên ngẫu nhiên để tạo người chơi
const FAKE_NAMES = [
  'Sóc Nhanh Nhẹn', 'Hổ Dũng Mãnh', 'Cáo Tinh Ranh', 'Gấu Thông Thái', 'Đại Bàng Mắt Tinh',
  'Cá Voi Khổng Lồ', 'Sư Tử Oai Vệ', 'Thỏ Tinh Nghịch', 'Rùa Trầm Tính', 'Khỉ Lém Lỉnh'
];

// Tổng số câu hỏi trong quiz giả
const TOTAL_QUESTIONS = 10;


export default function HostControl() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu từ state của router, nếu không có thì dùng giá trị mặc định
  const quizTitle = location.state?.quizTitle || 'Quiz Demo';
  const quizPin = location.state?.pin || '123456';

  // --- STATE ĐỂ QUẢN LÝ TRẠNG THÁI GIẢ ---
  const [gameStatus, setGameStatus] = useState<'waiting' | 'active' | 'completed'>('waiting');
  const [participants, setParticipants] = useState<FakeParticipant[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // State cho UI copy
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // --- USEEFFECT ĐỂ MÔ PHỎNG HOẠT ĐỘNG ---

  // Mô phỏng người chơi tham gia khi đang ở phòng chờ
  useEffect(() => {
    if (gameStatus !== 'waiting') return;

    const addPlayerInterval = setInterval(() => {
      setParticipants(prev => {
        if (prev.length >= FAKE_NAMES.length) {
          clearInterval(addPlayerInterval);
          return prev;
        }
        const newPlayerName = FAKE_NAMES[prev.length];
        const newPlayer: FakeParticipant = {
          id: crypto.randomUUID(),
          name: newPlayerName,
          score: 0,
        };
        return [...prev, newPlayer];
      });
    }, 2000); // Thêm người chơi mới mỗi 2 giây

    return () => clearInterval(addPlayerInterval);
  }, [gameStatus]);

  // Mô phỏng việc cập nhật điểm khi game đang diễn ra
  useEffect(() => {
    if (gameStatus !== 'active') return;

    const updateScoreInterval = setInterval(() => {
      setParticipants(prev => 
        prev.map(p => ({
          ...p,
          // 50% cơ hội người chơi trả lời đúng và nhận điểm
          score: p.score + (Math.random() > 0.5 ? Math.floor(Math.random() * 50 + 50) : 0),
        }))
        // Sắp xếp lại theo điểm số mới
        .sort((a, b) => b.score - a.score)
      );
    }, 3000); // Cập nhật điểm mỗi 3 giây

    return () => clearInterval(updateScoreInterval);
  }, [gameStatus, currentQuestionIndex]); // Chạy lại khi chuyển câu hỏi

  // --- HÀM XỬ LÝ SỰ KIỆN ---

  const copyToClipboard = (text: string, type: 'pin' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'pin') {
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleStartGame = () => {
    if (participants.length > 0) {
      setGameStatus('active');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Đây là câu hỏi cuối cùng, chuyển sang trạng thái kết thúc
      setGameStatus('completed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{quizTitle}</h1>
              {gameStatus !== 'waiting' && (
                <p className="text-gray-600">
                  Câu hỏi {Math.min(currentQuestionIndex + 1, TOTAL_QUESTIONS)} / {TOTAL_QUESTIONS}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 px-4 py-2 rounded-full flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-600">{participants.length}</span>
              </div>
              {gameStatus === 'waiting' && (
                <button
                  onClick={handleStartGame}
                  disabled={participants.length === 0}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                  Bắt đầu
                </button>
              )}
              {gameStatus === 'active' && (
                <button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2"
                >
                  <SkipForward className="w-5 h-5" />
                  {currentQuestionIndex === TOTAL_QUESTIONS - 1 ? 'Kết thúc' : 'Câu tiếp theo'}
                </button>
              )}
            </div>
          </div>

          {gameStatus === 'waiting' && (
            <div className="py-8 animate-fade-in">
              <p className="text-2xl font-bold text-gray-700 mb-6 text-center">
                Đang chờ người chơi tham gia...
              </p>

              <div className="max-w-2xl mx-auto space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Mã tham gia:</p>
                      <p className="text-5xl font-bold text-blue-600 font-mono">{quizPin}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(quizPin, 'pin')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
                    >
                      {copiedPin ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      {copiedPin ? 'Đã copy!' : 'Copy mã'}
                    </button>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <p className="text-sm font-semibold text-gray-600 mb-1">
                        <LinkIcon className="w-4 h-4 inline mr-1" />
                        Link trực tiếp:
                      </p>
                      <p className="text-base text-gray-800 font-mono break-all">
                        {`${window.location.origin}/play/${quizPin}`}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/play/${quizPin}`, 'link')}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      {copiedLink ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      {copiedLink ? 'Đã copy!' : 'Copy link'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {gameStatus === 'completed' && (
            <div className="text-center py-8 animate-fade-in">
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
            <p className="text-gray-600 text-center py-8">Chưa có người chơi nào tham gia</p>
          ) : (
            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 transition-transform duration-500"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{participant.name}</p>
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