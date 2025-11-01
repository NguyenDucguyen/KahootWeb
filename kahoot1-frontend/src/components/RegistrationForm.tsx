import { useState } from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { Quiz } from '../lib/supabase';

interface RegistrationFormProps {
  quiz: Quiz;
  onRegister: (data: { name: string; email?: string; phone?: string }) => void;
}

export default function RegistrationForm({ quiz, onRegister }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (quiz.required_fields.name && !formData.name.trim()) {
      newErrors.name = 'Họ tên là bắt buộc';
    }

    if (quiz.required_fields.email && !formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (quiz.required_fields.email && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (quiz.required_fields.phone && !formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (quiz.required_fields.phone && formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const submitData: { name: string; email?: string; phone?: string } = {
        name: formData.name,
      };

      if (quiz.required_fields.email && formData.email) {
        submitData.email = formData.email;
      }

      if (quiz.required_fields.phone && formData.phone) {
        submitData.phone = formData.phone;
      }

      onRegister(submitData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {quiz.title}
          </h1>
          <p className="text-gray-600">Vui lòng điền thông tin để tham gia</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {quiz.required_fields.name && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên {quiz.required_fields.name && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: '' });
                  }}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          )}

          {quiz.required_fields.email && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email {quiz.required_fields.email && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors({ ...errors, email: '' });
                  }}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="example@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          )}

          {quiz.required_fields.phone && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số điện thoại {quiz.required_fields.phone && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setErrors({ ...errors, phone: '' });
                  }}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  placeholder="0912345678"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg mt-6"
          >
            Tham Gia
          </button>
        </form>
      </div>
    </div>
  );
}
