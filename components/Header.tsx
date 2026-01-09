import React from 'react';
import { Globe, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200/50 flex-shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-lg font-bold text-gray-900 leading-tight tracking-tight">AI 다국어 번역기</h1>
            <p className="text-[11px] text-gray-500 font-medium leading-none mt-1">AI 기반 다국어 데이터 추출 도구</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-bold border border-indigo-100 shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span>Gemini 3.0 Flash</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;