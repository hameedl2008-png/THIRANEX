import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  Filter, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { ItemReport, ItemCategory } from '../types/index.ts';
import { searchWithAI } from '../services/api.ts';

interface SearchViewProps {
  allReports: ItemReport[];
  onSelectReport: (report: ItemReport) => void;
  onOpenReportWizard: (type: 'LOST' | 'FOUND') => void;
}

const CATEGORIES: ItemCategory[] = [
  'Phone',
  'Laptop',
  'Tablet',
  'Smart Watch',
  'Earbuds / Headphones',
  'Charger',
  'Power Bank',
  'Wallet',
  'Keys',
  'Bag',
  'Other Personal Item',
];

export const SearchView: React.FC<SearchViewProps> = ({
  allReports,
  onSelectReport,
  onOpenReportWizard,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<ItemReport[] | null>(null);
  const [aiCriteria, setAiCriteria] = useState<any | null>(null);

  const handleAiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setAiSearchResults(null);
      setAiCriteria(null);
      return;
    }

    try {
      setIsSearchingAI(true);
      const res = await searchWithAI(query.trim());
      setAiSearchResults(res.reports);
      setAiCriteria(res.criteria);
      setIsSearchingAI(false);
    } catch (err: any) {
      setIsSearchingAI(false);
      // Fallback local search
      const q = query.toLowerCase();
      const local = allReports.filter(r =>
        r.caseId.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q) ||
        r.colour.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        (r.rawDescription && r.rawDescription.toLowerCase().includes(q))
      );
      setAiSearchResults(local);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setAiSearchResults(null);
    setAiCriteria(null);
  };

  // Base list to filter
  const baseList = aiSearchResults !== null ? aiSearchResults : allReports;

  // Apply quick dropdown filters
  const filteredReports = baseList.filter(r => {
    if (selectedType !== 'ALL' && r.type !== selectedType) return false;
    if (selectedCategory && r.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Campus Search & AI Lookup
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Find lost and found belongings by case ID, category, location, or full natural language sentences.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleAiSearch} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g. "I found a black Samsung phone near the library yesterday" or "CFA-2026-4891"'
              className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSearchingAI}
            className="px-5 py-3 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-2xl shadow-md shadow-indigo-200 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSearchingAI ? 'AI Searching...' : 'AI Search'}</span>
          </button>
        </form>

        {/* Quick natural language suggestion chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Sample campus queries:</span>
          <button
            type="button"
            onClick={() => {
              setQuery('Black Samsung phone near library');
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors"
          >
            "Black Samsung phone near library"
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('Boat earbuds white colour canteen');
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors"
          >
            "Boat earbuds white colour canteen"
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('Brown leather wallet central block');
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors"
          >
            "Brown leather wallet central block"
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          
          {/* Type filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'LOST', 'FOUND'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  selectedType === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'All Types' : t === 'LOST' ? 'Lost Only' : 'Found Only'}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(selectedCategory || selectedType !== 'ALL' || aiSearchResults !== null) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedType('ALL');
                clearSearch();
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 ml-auto"
            >
              Reset Filters
            </button>
          )}

        </div>

      </div>

      {/* AI Extraction criteria note */}
      {aiCriteria && (
        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs text-indigo-950 flex flex-wrap items-center gap-2">
          <span className="font-bold flex items-center gap-1 text-indigo-700">
            <Sparkles className="w-3.5 h-3.5" />
            AI Query Breakdown:
          </span>
          {aiCriteria.category && <span className="bg-white px-2 py-0.5 rounded border border-indigo-200">Category: <strong>{aiCriteria.category}</strong></span>}
          {aiCriteria.brand && <span className="bg-white px-2 py-0.5 rounded border border-indigo-200">Brand: <strong>{aiCriteria.brand}</strong></span>}
          {aiCriteria.colour && <span className="bg-white px-2 py-0.5 rounded border border-indigo-200">Colour: <strong>{aiCriteria.colour}</strong></span>}
          {aiCriteria.location && <span className="bg-white px-2 py-0.5 rounded border border-indigo-200">Location: <strong>{aiCriteria.location}</strong></span>}
        </div>
      )}

      {/* RESULTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>Found {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}</span>
          <span>Sorted by most recent</span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">No Matching Items Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No reports matched your specific criteria. Try broader keywords or create a new lost/found report.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => onOpenReportWizard('LOST')}
                className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl"
              >
                Report Lost Item
              </button>
              <button
                onClick={() => onOpenReportWizard('FOUND')}
                className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl"
              >
                Report Found Item
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    report.type === 'LOST'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {report.type}
                  </span>

                  <span className="font-mono text-xs font-semibold text-slate-500">
                    {report.caseId}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {report.brand !== "Don't know" ? report.brand : ''} {report.model !== "Don't know" ? report.model : ''} {report.category}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Colour: {report.colour} {report.caseColour ? `• Case: ${report.caseColour}` : ''}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{report.approximateTime}</span>
                  </div>
                </div>

                {report.imageUrl && (
                  <div className="pt-1">
                    <img
                      src={report.imageUrl}
                      alt={report.category}
                      className="h-24 w-full object-contain rounded-lg bg-slate-50 border border-slate-100"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
