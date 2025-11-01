import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function PinEntry() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 6) {
      setError('PIN phải có 6 ký tự');
      return;
    }

    navigate(`/play/${pin}`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
            <Lock className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Tham Gia Quiz
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Nhập mã PIN để bắt đầu
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="Nhập mã PIN"
              maxLength={6}
              className="w-full px-6 py-4 text-2xl font-bold text-center border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all uppercase tracking-widest"
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Tiếp Tục
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Mã PIN gồm 6 ký tự do người tổ chức cung cấp</p>
        </div>
    </div>
  );
}
