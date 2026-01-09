import React, { useState } from 'react';
import Header from './components/Header';
import TranslationInput from './components/TranslationInput';
import TranslationOutput from './components/TranslationOutput';
import { translateText } from './services/geminiService';
import { TranslationData } from './types';
import { AlertTriangle, X } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TranslationData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async (items: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await translateText(items);
      setData(result);
    } catch (err: any) {
      setError(err.message || "번역 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">번역 실패</h3>
                <p className="text-sm text-red-600 mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Workspace - Use flex-row on larger screens */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
          {/* Input Section - Fixed width on large screens */}
          <div className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 flex flex-col h-[500px] lg:h-[700px] transition-all">
            <TranslationInput onTranslate={handleTranslate} isLoading={isLoading} />
          </div>

          {/* Output Section - Flexible width */}
          <div className="flex-1 flex flex-col h-[600px] lg:h-[700px] min-w-0 transition-all">
            <TranslationOutput data={data} />
          </div>
        </div>
      </main>

       <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
        </div>
      </footer>
    </div>
  );
};

export default App;