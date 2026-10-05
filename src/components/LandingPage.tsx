import React from 'react';
import { 
  Search, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  ArrowRight, 
  Zap, 
  Lock, 
  Eye, 
  MapPin, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

interface LandingPageProps {
  onStartLost: () => void;
  onStartFound: () => void;
  onQuickSearch: () => void;
  activeReportsCount: number;
  matchesCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartLost,
  onStartFound,
  onQuickSearch,
  activeReportsCount,
  matchesCount,
}) => {
  return (
    <div className="space-y-16 py-6 sm:py-10">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white p-8 sm:p-14 lg:p-16 shadow-2xl border border-indigo-900/50">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b12_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-200 text-xs font-semibold tracking-wide backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Intelligent Campus Lost & Found System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
            CampusFind <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">AI</span>
          </h1>

          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-100 tracking-tight">
            Lost Something? Let AI Find It.
          </p>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
            CampusFind AI helps students find lost belongings inside the campus using intelligent matching. Report what you lost or found, and our AI will help identify possible matches.
          </p>

          {/* TWO LARGE PRIMARY BUTTONS */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={onStartLost}
              className="w-full sm:w-auto px-8 py-4 text-base font-extrabold text-white bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 rounded-2xl shadow-lg shadow-rose-950/50 hover:shadow-rose-600/30 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-3 group border border-rose-400/30"
            >
              <HelpCircle className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
              <span>I LOST SOMETHING</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onStartFound}
              className="w-full sm:w-auto px-8 py-4 text-base font-extrabold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-2xl shadow-lg shadow-emerald-950/50 hover:shadow-emerald-600/30 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-3 group border border-emerald-400/30"
            >
              <CheckCircle2 className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <span>I FOUND SOMETHING</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick campus status summary */}
          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>AI Matching Active</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors" onClick={onQuickSearch}>
              <Search className="w-3.5 h-3.5" />
              <span>Search Campus Database</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW CAMPUSFIND AI WORKS */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            System Workflow
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How CampusFind AI Works
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            From lost item report to verified return in seven simple, secure steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Step 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative group">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center mb-3">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Create Your Profile
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete your student profile with Mobile, Department, and Year once. We connect it automatically.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative group">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center mb-3">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Report a Lost or Found Item
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select category or describe naturally in English, Tamil, or Tanglish without rigid forms.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative group">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center mb-3">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Answer Simple AI Questions
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dynamically adapted questions for phones, wallets, bags, etc. Select "I don't know" whenever unsure.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative group">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center mb-3">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              AI Analyzes the Details
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload a photo for visual feature extraction with confidence estimations and damage detection.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative group">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center mb-3">
              5
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Find Possible Matches
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              10-factor weighted scoring algorithm cross-checks Brand, Model, Location, and flags major conflicts.
            </p>
          </div>

          {/* Step 6 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative group">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center mb-3">
              6
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Contact the Matched Person
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Contact numbers are kept private until a genuine match score of &ge;50% is verified.
            </p>
          </div>

          {/* Step 7 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative group md:col-span-2 lg:col-span-2 xl:col-span-2 bg-gradient-to-r from-indigo-50/50 to-emerald-50/50 border-indigo-200">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-3 shadow-xs">
              7
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Verify and Return the Item
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Answer the owner's private verification questions (3 attempts max). Coordinate safe campus handover at Library, Cafeteria, or Security Office!
            </p>
          </div>

        </div>
      </section>

      {/* WHY CAMPUSFIND AI? */}
      <section className="max-w-5xl mx-auto bg-slate-50/80 rounded-3xl p-8 sm:p-10 border border-slate-200">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            Key Advantages
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why CampusFind AI?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Built specifically to solve college campus lost belongings with intelligence, privacy, and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">AI-Powered Matching</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multi-factor 100-point algorithm compares category, model, colour, location, lock type, and rules out contradictions.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Easy Reporting</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conversational prompts that accept English, Tamil, and Tanglish phrases and adapt dynamically to what was lost.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Campus-Focused</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Designed around college blocks, libraries, labs, and authorized handover zones like the Security Office.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Secure Contact Sharing</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No public exposure of student phone numbers or private answers until high-compatibility match criteria is satisfied.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Smart Image Analysis</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multimodal vision models identify item type, brand, accessories, casing, and visible scratches with confidence metrics.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Faster Item Recovery</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated notifications, 3-step verification, and pre-arranged campus handovers return items within hours.
            </p>
          </div>

        </div>
      </section>

      {/* Campus Privacy Commitment */}
      <section className="max-w-5xl mx-auto bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-600">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900">Student Privacy Protected</h4>
          <p>
            CampusFind AI strictly protects confidential details. Serial numbers, IMEIs, passwords, and private verification questions are never publicly shown. Contact details are only unlocked after match score conditions are met.
          </p>
        </div>
      </section>

    </div>
  );
};
