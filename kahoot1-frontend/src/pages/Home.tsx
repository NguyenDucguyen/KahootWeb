import { useNavigate } from 'react-router-dom';
import { Trophy, Users } from 'lucide-react';
import PinEntry from '../components/PinEntry';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 shadow-2xl">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Rung Chuông Vàng
          </h1>
          <p className="text-xl text-white">Trò chơi trắc nghiệm tương tác</p>
        </div>

        <PinEntry />

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 text-white hover:underline font-semibold"
          >
            <Users className="w-5 h-5" />
            Dành cho Giáo viên / Quản trị
          </button>
        </div>
      </div>
    </div>
  );
}
