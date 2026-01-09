import React, { useState, useRef } from 'react';
import { ArrowRight, Loader2, Sparkles, Trash2, Plus, GripVertical, X, AlertCircle } from 'lucide-react';

interface TranslationInputProps {
  onTranslate: (items: string[]) => void;
  isLoading: boolean;
}

const MAX_ITEMS = 15;

const TranslationInput: React.FC<TranslationInputProps> = ({ onTranslate, isLoading }) => {
  const [items, setItems] = useState<string[]>(['']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Filter empty items for count
  const validItemCount = items.filter(i => i.trim() !== '').length;

  const handleChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (items.length >= MAX_ITEMS) {
        return;
      }
      // Add new item below
      const newItems = [...items];
      newItems.splice(index + 1, 0, '');
      setItems(newItems);
      // Focus will be handled by useEffect or we can manually focus after render
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
    } else if (e.key === 'Backspace' && items[index] === '' && items.length > 1) {
      e.preventDefault();
      handleRemove(index);
      // Focus previous item
      setTimeout(() => inputRefs.current[index - 1]?.focus(), 0);
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSubmit();
    }
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length ? newItems : ['']);
  };

  const handleAdd = () => {
    if (items.length >= MAX_ITEMS) return;
    setItems([...items, '']);
    setTimeout(() => inputRefs.current[items.length]?.focus(), 0);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const lines = pastedData.split(/\r\n|\r|\n/).filter(line => line.trim() !== '');
    
    if (lines.length > 0) {
      const remainingSlots = MAX_ITEMS - items.length;
      // We take 1 line for the current slot, and up to remainingSlots for new items
      const linesToInsert = lines.slice(0, 1 + remainingSlots);
      
      const newItems = [...items];
      // Replace current item with first line
      newItems[index] = linesToInsert[0];
      // Insert remaining lines
      if (linesToInsert.length > 1) {
        newItems.splice(index + 1, 0, ...linesToInsert.slice(1));
      }
      setItems(newItems);
      // Focus the last added item
      setTimeout(() => inputRefs.current[index + linesToInsert.length - 1]?.focus(), 0);
    }
  };

  const handleClear = () => {
    setItems(['']);
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const validItems = items.filter(item => item.trim() !== '');
    if (validItems.length > 0 && !isLoading) {
      onTranslate(validItems);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-white flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <GripVertical className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 text-sm">원본 목록</h2>
            <p className="text-xs text-gray-500">배열 입력 (최대 {MAX_ITEMS}개)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-md border transition-colors ${
            items.length >= MAX_ITEMS 
              ? 'bg-amber-50 text-amber-600 border-amber-100' 
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}>
            {items.length}/{MAX_ITEMS}
          </span>
          {(items.length > 1 || items.some(i => i.trim() !== '')) && (
            <button 
              onClick={handleClear}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="전체 초기화"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50">
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div key={index} className="group relative flex items-center gap-2 bg-white p-1 pr-2 rounded-xl border border-transparent hover:border-indigo-100 hover:shadow-sm transition-all focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50/50">
              <div className="w-8 flex-shrink-0 flex justify-center select-none">
                <span className="text-[10px] font-mono text-gray-400 group-hover:text-indigo-400">{index + 1}</span>
              </div>
              <input
                ref={el => inputRefs.current[index] = el}
                type="text"
                value={item}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={(e) => handlePaste(e, index)}
                placeholder="텍스트 입력"
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-300 py-2"
                autoComplete="off"
              />
              <button
                onClick={() => handleRemove(index)}
                disabled={items.length === 1 && item === ''}
                className={`p-1.5 rounded-md transition-all ${
                  items.length === 1 && item === '' 
                    ? 'text-transparent cursor-default' 
                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
                }`}
                tabIndex={-1}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {items.length < MAX_ITEMS ? (
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 py-3 border border-dashed border-gray-300 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-sm font-medium mt-1"
            >
              <Plus className="w-4 h-4" />
              항목 추가
            </button>
          ) : (
             <div className="flex items-center justify-center gap-2 py-3 border border-dashed border-amber-200 bg-amber-50/50 rounded-xl text-amber-600 text-xs font-medium mt-1 cursor-not-allowed select-none">
              <AlertCircle className="w-3.5 h-3.5" />
              최대 {MAX_ITEMS}개까지 입력 가능합니다
            </div>
          )}
        </div>
      </div>
      
      {/* Footer / Actions */}
      <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0 z-10">
        <button
          onClick={handleSubmit}
          disabled={validItemCount === 0 || isLoading}
          className={`
            w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98]
            ${validItemCount === 0 || isLoading 
              ? 'bg-gray-300 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>처리 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{validItemCount}개 항목 번역 시작</span>
              <ArrowRight className="w-4 h-4 opacity-80" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TranslationInput;