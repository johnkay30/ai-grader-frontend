import React, { useState } from 'react';
import { Send, Camera, Loader2, BookOpen, User } from 'lucide-react';
import { transcribeImage } from '../services/geminiService';

interface DashboardProps {
  onGrade: (model: string, student: string) => void;
  isLoading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ onGrade, isLoading }) => {
  const [modelAnswer, setModelAnswer] = useState('');
  const [studentResponse, setStudentResponse] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Handle Image Upload & OCR
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const text = await transcribeImage(base64);
      setStudentResponse(text);
      setIsTranscribing(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Model Answer Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 font-semibold uppercase tracking-wider text-sm">
          <BookOpen className="w-4 h-4" />
          <span>Marking Scheme / Model Answer</span>
        </div>
        <textarea
          value={modelAnswer}
          onChange={(e) => setModelAnswer(e.target.value)}
          placeholder="Paste the correct answer here..."
          className="w-full h-64 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-700 leading-relaxed"
        />
      </div>

      {/* Student Response Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold uppercase tracking-wider text-sm">
            <User className="w-4 h-4" />
            <span>Student Submission</span>
          </div>
          
          {/* OCR Upload Button */}
          <label className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors text-xs font-bold">
            {isTranscribing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            {isTranscribing ? "READING SCRIPT..." : "UPLOAD HANDWRITTEN PHOTO"}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        <textarea
          value={studentResponse}
          onChange={(e) => setStudentResponse(e.target.value)}
          placeholder="Enter student's response or upload a photo..."
          className="w-full h-64 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-700 leading-relaxed"
        />
      </div>

      {/* Action Button */}
      <div className="lg:col-span-2 flex justify-center pt-4">
        <button
          onClick={() => onGrade(modelAnswer, studentResponse)}
          disabled={isLoading || !modelAnswer || !studentResponse}
          className="group relative flex items-center gap-3 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
          {isLoading ? "CALCULATING SBERT SCORE..." : "EVALUATE SUBMISSION"}
        </button>
      </div>
    </div>
  );
};