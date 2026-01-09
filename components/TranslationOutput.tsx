import React, { useState } from 'react';
import { Copy, Check, FileJson, Table, Download, Languages, Key } from 'lucide-react';
import { TranslationData, LANGUAGE_KEYS } from '../types';

interface TranslationOutputProps {
  data: TranslationData[] | null;
}

const TranslationOutput: React.FC<TranslationOutputProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'table' | 'json'>('table');
  const [copied, setCopied] = useState(false);

  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 via-white to-indigo-50/30 opacity-50" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-8 ring-white">
            <Languages className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">번역 준비 완료</h3>
          <p className="text-gray-500 max-w-sm leading-relaxed">
            왼쪽에 한국어 텍스트를 입력하세요. 21개 언어로 즉시 번역하여 엑셀용 데이터로 변환해 드립니다.
          </p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    const textToCopy = activeTab === 'json' 
      ? JSON.stringify(data, null, 2)
      : data.map(row => {
          const keyPart = row.key;
          const langParts = LANGUAGE_KEYS.map(key => row[key]).join('\t');
          return `${keyPart}\t${langParts}`;
        }).join('\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-gray-100 bg-white flex flex-wrap justify-between items-center gap-3">
        <div className="flex gap-1 p-1 bg-gray-100/80 rounded-lg">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'table' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Table className="w-4 h-4" />
            표 (Table)
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'json' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
        </div>

        <div className="flex gap-2">
           <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">JSON 내보내기</span>
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
              copied 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-200'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '복사됨!' : '클립보드에 복사'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative">
        {activeTab === 'json' ? (
          <div className="bg-[#1e1e1e] min-h-full p-6">
            <pre className="text-sm font-mono text-blue-300 whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-full bg-white">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/90 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold border-b border-gray-200 min-w-[60px] text-center bg-gray-50/90">#</th>
                  {/* Sticky Key Column */}
                  <th className="px-6 py-4 font-bold text-gray-800 border-b border-gray-200 min-w-[200px] sticky left-0 z-30 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] bg-gray-50/95 backdrop-blur-sm border-r border-gray-200 flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-gray-400" />
                    String Key
                  </th>
                  {/* Language Columns */}
                  {LANGUAGE_KEYS.map((lang) => (
                    <th key={lang} className={`px-6 py-4 font-medium border-b border-gray-200 min-w-[180px] whitespace-nowrap hover:bg-gray-100 transition-colors cursor-default ${lang === 'Korean' ? 'text-indigo-700 bg-indigo-50/50' : ''}`}>
                      {lang === 'Korean' ? '한국어 (원본)' : lang.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {data.map((row, index) => (
                  <tr key={index} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs text-center group-hover:text-indigo-400">{index + 1}</td>
                    {/* Key Value */}
                    <td className="px-6 py-4 font-mono text-xs text-indigo-600 sticky left-0 bg-white z-10 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] border-r border-gray-100 group-hover:bg-indigo-50/30 group-hover:shadow-[4px_0_12px_-4px_rgba(79,70,229,0.1)] transition-colors">
                      {row.key}
                    </td>
                    {/* Language Values */}
                    {LANGUAGE_KEYS.map((lang) => (
                      <td key={lang} className={`px-6 py-4 text-gray-600 group-hover:text-gray-900 transition-colors selection:bg-indigo-100 ${lang === 'Korean' ? 'font-medium text-gray-900 bg-indigo-50/10' : ''}`}>
                        {row[lang]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationOutput;