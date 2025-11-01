


import { useState, useRef } from 'react'; // ADDED: useRef
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Image as ImageIcon, Music, ArrowLeft, Save, Clock, Award, Upload, Download, FileJson, FileText, FileUp, Play, X } from 'lucide-react'; // ADDED: X icon
import { supabase } from '../lib/supabase';
import { parseBobFile, parseJsonFile, parseCsvFile, exportToBobFile, downloadFile } from '../utils/importExport';

interface Question {
  id: string;
  type: 'multiple_choice' | 'text_input';
  question_text: string;
  question_image?: string;
  options?: string[];
  correct_answer: string;
  timer: number;
  points: number;
}

export default function QuizBuilder() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [audioFile, setAudioFile] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);
  const [showImportMenu, setShowImportMenu] = useState(false);

  // ADDED: Ref for the audio element to control it
  const audioRef = useRef<HTMLAudioElement>(null);

  const generatePin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'multiple_choice',
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: '',
      timer: 30,
      points: 100,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleImageUpload = async (questionId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      updateQuestion(questionId, { question_image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setBackgroundImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAudioFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // ADDED: Function to clear the background image
  const clearBackgroundImage = () => {
    setBackgroundImage('');
    const input = document.getElementById('bg-upload') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  // ADDED: Function to clear the audio file
  const clearAudioFile = () => {
    setAudioFile('');
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
    }
    const input = document.getElementById('audio-upload') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  const handleImportFile = async (file: File, type: 'bob' | 'json' | 'csv') => {
    try {
      const content = await file.text();
      let importedData;

      if (type === 'bob') {
        importedData = parseBobFile(content);
      } else if (type === 'json') {
        importedData = parseJsonFile(content);
      } else {
        importedData = parseCsvFile(content);
      }

      setTitle(importedData.title);
      setBackgroundImage(importedData.backgroundImage || '');
      setAudioFile(importedData.audioFile || '');
      setQuestions(importedData.questions);
      setShowImportMenu(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi import file');
    }
  };

  const handleExportBob = () => {
    if (!title.trim() || questions.length === 0) {
      setError('Vui lòng nhập tiêu đề và thêm câu hỏi trước khi export');
      return;
    }

    const bobContent = exportToBobFile(
      title,
      questions,
      backgroundImage || undefined,
      audioFile || undefined
    );

    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.bob`;
    downloadFile(bobContent, filename, 'application/json');
  };

  const validateQuiz = () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề quiz');
      return false;
    }

    if (questions.length === 0) {
      setError('Vui lòng thêm ít nhất một câu hỏi');
      return false;
    }

    for (const q of questions) {
      if (!q.question_text.trim()) {
        setError('Vui lòng điền đầy đủ nội dung câu hỏi');
        return false;
      }
      if (!q.correct_answer.trim()) {
        setError('Vui lòng điền đáp án đúng cho tất cả câu hỏi');
        return false;
      }
      if (q.type === 'multiple_choice' && q.options?.some(o => !o.trim())) {
        setError('Vui lòng điền đầy đủ các lựa chọn');
        return false;
      }
    }

    return true;
  };

  const saveQuizToDatabase = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Vui lòng đăng nhập để tạo quiz');
    }

    const pin = generatePin();

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title,
        pin,
        background_image: backgroundImage || null,
        audio_file: audioFile || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (quizError) throw quizError;

    const questionsToInsert = questions.map((q, index) => ({
      quiz_id: quiz.id,
      question_text: q.question_text,
      question_type: q.type,
      question_image: q.question_image || null,
      options: q.type === 'multiple_choice' ? JSON.stringify(q.options) : null,
      correct_answer: q.correct_answer,
      timer: q.timer,
      points: q.points,
      order_index: index,
    }));

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert);

    if (questionsError) throw questionsError;

    return quiz;
  };

  const handleSave = async () => {
    if (!validateQuiz()) return;

    setSaving(true);
    setError('');

    try {
      const quiz = await saveQuizToDatabase();
      setSavedQuizId(quiz.id);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndPlay = async () => {
    if (!validateQuiz()) return;

    setSaving(true);
    setError('');

    navigate(`/host/123456`); // TEMPORARY: Directly navigate to a dummy session for testing


    // try {
    //   const quiz = await saveQuizToDatabase();

    //   const { data: session, error: sessionError } = await supabase
    //     .from('game_sessions')
    //     .insert({
    //       quiz_id: quiz.id,
    //       status: 'waiting',
    //     })
    //     .select()
    //     .single();

    //   if (sessionError) throw sessionError;

    //   navigate(`/host/${session.id}`);
    // } catch (err) {
    //   setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    // } finally {
    //   setSaving(false);
    // }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
            Tạo Quiz Mới
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {savedQuizId && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <p className="text-green-800 font-semibold mb-3">Quiz đã được lưu thành công!</p>
              <div className="flex gap-2">
                <button
                  onClick={handleExportBob}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Tải xuống file .bob
                </button>
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Quay về Dashboard
                </button>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="relative">
              <button
                onClick={() => setShowImportMenu(!showImportMenu)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all"
              >
                <Upload className="w-5 h-5" />
                Import câu hỏi từ file
              </button>

              {showImportMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border-2 border-gray-200 p-4 z-10">
                  <p className="text-sm text-gray-600 mb-3">Chọn loại file để import:</p>

                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 cursor-pointer transition-colors">
                      <FileUp className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">File .bob</p>
                        <p className="text-xs text-gray-500">Định dạng BOB chuẩn</p>
                      </div>
                      <input
                        type="file"
                        accept=".bob,.json"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImportFile(e.target.files[0], 'bob')}
                      />
                    </label>

                    <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 cursor-pointer transition-colors">
                      <FileJson className="w-5 h-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">File JSON</p>
                        <p className="text-xs text-gray-500">Định dạng JSON tùy chỉnh</p>
                      </div>
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImportFile(e.target.files[0], 'json')}
                      />
                    </label>

                    <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 cursor-pointer transition-colors">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">File CSV</p>
                        <p className="text-xs text-gray-500">Bảng tính Excel/Google Sheets</p>
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImportFile(e.target.files[0], 'csv')}
                      />
                    </label>
                  </div>

                  <button
                    onClick={() => setShowImportMenu(false)}
                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tiêu đề Quiz
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="Nhập tiêu đề quiz"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ảnh nền (tùy chọn)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleBackgroundImageUpload(e.target.files[0])}
                  className="hidden"
                  id="bg-upload"
                />
                <label
                  htmlFor="bg-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">
                    {backgroundImage ? 'Thay đổi ảnh' : 'Chọn ảnh nền'}
                  </span>
                </label>

                {/* --- ADDED: Background Image Preview --- */}
                {backgroundImage && (
                  <div className="mt-2 relative">
                    <img
                      src={backgroundImage}
                      alt="Xem trước ảnh nền"
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={clearBackgroundImage}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 hover:bg-opacity-75 transition-colors"
                      title="Xóa ảnh nền"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {/* --- END ADDED --- */}

              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nhạc nền (tùy chọn)
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <Music className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">
                    {audioFile ? 'Thay đổi nhạc' : 'Chọn nhạc nền'}
                  </span>
                </label>

                {/* --- ADDED: Audio Player for Preview --- */}
                {audioFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <audio ref={audioRef} src={audioFile} controls className="w-full h-10"></audio>
                    <button
                      onClick={clearAudioFile}
                      className="flex-shrink-0 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      title="Xóa nhạc nền"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {/* --- END ADDED --- */}

              </div>
            </div>
          </div>
        </div>

        {/* The rest of the component remains the same */}

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Câu hỏi {index + 1}</h3>
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loại câu hỏi
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(question.id, {
                      type: e.target.value as 'multiple_choice' | 'text_input',
                      options: e.target.value === 'multiple_choice' ? ['', '', '', ''] : undefined
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="multiple_choice">Trắc nghiệm</option>
                    <option value="text_input">Điền từ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Câu hỏi
                  </label>
                  <textarea
                    value={question.question_text}
                    onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                    rows={2}
                    placeholder="Nhập nội dung câu hỏi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hình ảnh minh họa (tùy chọn)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(question.id, e.target.files[0])}
                    className="hidden"
                    id={`image-upload-${question.id}`}
                  />
                  <label
                    htmlFor={`image-upload-${question.id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">
                      {question.question_image ? 'Đã chọn hình ảnh' : 'Chọn hình ảnh'}
                    </span>
                  </label>
                  {question.question_image && (
                    <img
                      src={question.question_image}
                      alt="Preview"
                      className="mt-2 max-h-40 rounded-lg"
                    />
                  )}
                </div>

                {question.type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Các lựa chọn
                    </label>
                    <div className="space-y-2">
                      {question.options?.map((option, optionIndex) => (
                        <input
                          key={optionIndex}
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                          placeholder={`Lựa chọn ${optionIndex + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Đáp án đúng
                  </label>
                  {question.type === 'multiple_choice' ? (
                    <select
                      value={question.correct_answer}
                      onChange={(e) => updateQuestion(question.id, { correct_answer: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Chọn đáp án đúng</option>
                      {question.options?.map((option, idx) => (
                        <option key={idx} value={option}>{option || `Lựa chọn ${idx + 1}`}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={question.correct_answer}
                      onChange={(e) => updateQuestion(question.id, { correct_answer: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      placeholder="Nhập đáp án đúng"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Thời gian (giây)
                    </label>
                    <input
                      type="number"
                      value={question.timer}
                      onChange={(e) => updateQuestion(question.id, { timer: parseInt(e.target.value) || 30 })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      min="5"
                      max="300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Award className="w-4 h-4 inline mr-1" />
                      Điểm
                    </label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 100 })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      min="10"
                      step="10"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-green-500 hover:to-green-700 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus className="w-6 h-6" />
            Thêm câu hỏi
          </button>

          <div className="space-y-4">
            <button
              onClick={handleExportBob}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-6 h-6" />
              Export file .bob
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Save className="w-6 h-6" />
                {saving ? 'Đang lưu...' : 'Lưu Quiz'}
              </button>

              <button
                onClick={handleSaveAndPlay}
                disabled={saving}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Play className="w-6 h-6" />
                {saving ? 'Đang lưu...' : 'Lưu & Play'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


