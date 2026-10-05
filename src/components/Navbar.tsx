import React from 'react';
import { 
  Compass, 
  Search, 
  Sparkles, 
  UserCheck, 
  Layers, 
  PlusCircle, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { UserProfile } from '../types/index.ts';

interface NavbarProps {
  currentView: 'home' | 'lost-wizard' | 'found-wizard' | 'matches' | 'search' | 'dashboard';
  setCurrentView: (view: 'home' | 'lost-wizard' | 'found-wizard' | 'matches' | 'search' | 'dashboard') => void;
  profile: UserProfile | null;
  onOpenProfile: () => void;
  matchCount?: number;
  activeReportsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  profile,
  onOpenProfile,
  matchCount = 0,
  activeReportsCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentView('home')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 bg-clip-text text-transparent">
                  CampusFind
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/80">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Lost Something? Let AI Find It.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setCurrentView('matches')}
              className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'matches'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Possible Matches</span>
              {matchCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-indigo-600 text-white rounded-full">
                  {matchCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('search')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'search'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Campus Search</span>
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Student Dashboard</span>
              {activeReportsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-slate-200 text-slate-700 rounded-full">
                  {activeReportsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Action & Student Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentView('lost-wizard')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Report Lost
            </button>

            <button
              onClick={() => setCurrentView('found-wizard')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Report Found
            </button>

            {/* Profile trigger */}
            <button
              onClick={onOpenProfile}
              className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                profile
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800 shadow-xs'
              }`}
              title={profile ? `${profile.fullName} (${profile.department})` : 'Set up student profile'}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                profile ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                {profile ? profile.fullName.charAt(0).toUpperCase() : '!'}
              </div>
              <div className="text-left hidden sm:block max-w-[130px] truncate">
                {profile ? (
                  <>
                    <div className="font-semibold text-xs text-slate-900 truncate">{profile.fullName}</div>
                    <div className="text-[10px] text-slate-500 truncate">{profile.department} • {profile.year}</div>
                  </>
                ) : (
                  <span className="font-semibold text-amber-900">Create Profile</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-white px-2 py-2 text-xs">
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center py-1 px-2 font-medium ${
            currentView === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-600'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setCurrentView('matches')}
          className={`flex flex-col items-center py-1 px-2 font-medium ${
            currentView === 'matches' ? 'text-indigo-600 font-bold' : 'text-slate-600'
          }`}
        >
          Matches {matchCount > 0 && `(${matchCount})`}
        </button>
        <button
          onClick={() => setCurrentView('search')}
          className={`flex flex-col items-center py-1 px-2 font-medium ${
            currentView === 'search' ? 'text-indigo-600 font-bold' : 'text-slate-600'
          }`}
        >
          Search
        </button>
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center py-1 px-2 font-medium ${
            currentView === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-600'
          }`}
        >
          Dashboard
        </button>
      </div>
    </header>
  );
};
