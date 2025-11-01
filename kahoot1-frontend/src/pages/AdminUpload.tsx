import { useState } from 'react';
import { Upload, FileUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BobFile } from '../types/bob';

export default function AdminUpload() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generatePin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.bob') && !file.name.endsWith('.json')) {
      setError('Vui lòng chọn file .bob hoặc .json');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const fileContent = await file.text();
      const bobData: BobFile = JSON.parse(fileContent);

      if (!bobData.quiz || !bobData.quiz.questions || bobData.quiz.questions.length === 0) {
        throw new Error('File không đúng định dạng hoặc không có câu hỏi');
      }

      const pin = generatePin();

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: bobData.quiz.title,
          pin: pin,
          background_image: bobData.quiz.backgroundImage,
          audio_file: bobData.quiz.audioFile,
          default_timer: bobData.quiz.defaultTimer || 30,
          student_count: bobData.quiz.studentCount || 50,
          grid_columns: bobData.quiz.gridColumns || 6,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      const questionsToInsert = bobData.quiz.questions.map((q, index) => ({
        quiz_id: quiz.id,
        question_text: q.question,
        question_type: q.type === 'multiple-choice' ? 'multiple_choice' : 'text_input',
        question_image: q.questionImage,
        options: q.options ? JSON.stringify(q.options) : null,
        correct_answer: q.correctAnswer,
        timer: q.timer || bobData.quiz.defaultTimer || 30,
        order_index: index,
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      setSuccess(`Quiz đã được tạo thành công! PIN: ${pin}`);

      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <FileUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Tải lên Quiz
          </h1>
          <p className="text-gray-600">Tải file .bob để tạo quiz mới</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Lỗi</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800">Thành công!</p>
              <p className="text-green-600">{success}</p>
            </div>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".bob,.json"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {uploading ? 'Đang tải lên...' : 'Chọn file .bob'}
            </p>
            <p className="text-sm text-gray-500">
              Kéo thả file hoặc click để chọn
            </p>
          </label>
        </div>

        <button
          onClick={() => navigate('/admin')}
          className="w-full mt-6 bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}
