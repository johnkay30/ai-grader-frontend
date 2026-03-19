import { useState, useEffect } from 'react';
import { GraduationCap, AlertCircle, RefreshCw, Download, FileText, Users } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ResultsCard } from './components/ResultsCard';
import { HistoryTable } from './components/HistoryTable';
import { getFeedback } from './services/geminiService';
import { saveToHistory, getHistory, GradingResult } from './services/historyService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<GradingResult | null>(null);
  const [history, setHistory] = useState<GradingResult[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // FEATURE 1: EXPORT TO PDF
  const downloadPDF = async () => {
    const element = document.getElementById('results-area');
    if (!element) return;
    
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const componentWidth = pdf.internal.pageSize.getWidth();
    const componentHeight = (canvas.height * componentWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, componentWidth, componentHeight);
    pdf.save(`Grading_Report_${Date.now()}.pdf`);
  };

  const handleGrade = async (modelAnswer: string, studentResponse: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get SBERT Score
      const scoreResponse = await fetch('http://localhost:5000/get-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_answer: modelAnswer, student_answer: studentResponse }),
      });

      if (!scoreResponse.ok) throw new Error('Backend Unreachable');
      const { score } = await scoreResponse.json();

      // 2. Get Gemini Feedback
      const feedback = await getFeedback(modelAnswer, studentResponse, score);

      const result: GradingResult = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        modelAnswer,
        studentResponse,
        score,
        feedback,
      };

      setCurrentResult(result);
      saveToHistory(result);
      setHistory(getHistory());
    } catch (err) {
      setError('Connection failed. Ensure Python server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
       <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 uppercase">AI Exam Grader PRO</h1>
          </div>
          
          <div className="flex gap-4">
            {currentResult && (
              <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all">
                <Download className="w-4 h-4" /> Export PDF
              </button>
            )}
            <button onClick={() => setCurrentResult(null)} className="p-2 text-slate-400 hover:text-indigo-600"><RefreshCw className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

     <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-12 space-y-6 md:space-y-8">
        {/* NEW FEATURE: Batch Info Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileText /></div>
            <div><p className="text-xs text-slate-500 uppercase font-bold">Mode</p><p className="font-semibold text-slate-900">Standard Grading</p></div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 opacity-50 cursor-not-allowed">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Users /></div>
            <div><p className="text-xs text-slate-500 uppercase font-bold">Batch</p><p className="font-semibold text-slate-900">Upload CSV (Locked)</p></div>
          </div>
        </div>

        {!currentResult ? (
          <Dashboard onGrade={handleGrade} isLoading={isLoading} />
        ) : (
          <div id="results-area" className="animate-in fade-in zoom-in-95 duration-500">
            <ResultsCard score={currentResult.score} feedback={currentResult.feedback} />
          </div>
        )}

        <div className="pt-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Assessment History</h3>
          <HistoryTable history={history} onSelect={(res) => setCurrentResult(res)} />
        </div>
      </main>
    </div>
  );
}