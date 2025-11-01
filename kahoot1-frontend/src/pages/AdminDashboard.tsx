import { useEffect, useState } from 'react';
import { Plus, Trash2, Play, Copy, CheckCircle, LogOut, FileUp, PenSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Quiz {
  id: string;
  title: string;
  pin: string;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadQuizzes();
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (teacher) {
        setUserName(teacher.full_name);
      }
    }
  };

  const loadQuizzes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quizzes')
      .select('id, title, pin, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setQuizzes(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quiz này?')) return;

    const { error } = await supabase.from('quizzes').delete().eq('id', quizId);

    if (!error) {
      setQuizzes(quizzes.filter((q) => q.id !== quizId));
    }
  };

  const handleStartGame = async (quizId: string) => {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        quiz_id: quizId,
        status: 'waiting',
      })
      .select()
      .single();

    if (!error && data) {
      navigate(`/host/${data.id}`);
    }
  };

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Quản lý Quiz
              </h1>
              <p className="text-gray-600">Chào mừng, {userName || 'Giáo viên'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => navigate('/admin/quiz/new')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <PenSquare className="w-5 h-5" />
              Tạo Quiz Mới
            </button>
            <button
              onClick={() => navigate('/admin/upload')}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <FileUp className="w-5 h-5" />
              Tải file .bob
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Chưa có quiz nào</p>
              <p className="text-sm text-gray-500">Tạo quiz mới hoặc tải file .bob để bắt đầu</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600">PIN:</span>
                    <span className="font-mono font-bold text-lg text-blue-600">
                      {quiz.pin}
                    </span>
                    <button
                      onClick={() => copyPin(quiz.pin)}
                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                      title="Copy PIN"
                    >
                      {copiedPin === quiz.pin ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Tạo ngày: {new Date(quiz.created_at).toLocaleDateString('vi-VN')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartGame(quiz.id)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Bắt đầu
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="bg-red-100 text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-200 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:underline"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
