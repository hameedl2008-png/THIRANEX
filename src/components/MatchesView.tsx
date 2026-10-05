import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Phone, 
  Mail, 
  User, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Layers
} from 'lucide-react';
import { MatchResult, UserProfile } from '../types/index.ts';
import { requestContact } from '../services/api.ts';

interface MatchesViewProps {
  matches: MatchResult[];
  currentUser: UserProfile | null;
  onOpenVerification: (reportId: string, partnerReportId: string, question?: string) => void;
  onOpenHandover: (reportId: string, partnerReportId: string) => void;
  onRefreshMatches: () => void;
  onOpenReportWizard: (type: 'LOST' | 'FOUND') => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  matches,
  currentUser,
  onOpenVerification,
  onOpenHandover,
  onRefreshMatches,
  onOpenReportWizard,
}) => {
  const [requestingContactId, setRequestingContactId] = useState<string | null>(null);
  const [contactSuccessMessage, setContactSuccessMessage] = useState<string | null>(null);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const handleRequestContact = async (match: MatchResult) => {
    if (!currentUser) return;
    try {
      setRequestingContactId(`${match.lostReport.id}_${match.foundReport.id}`);
      setContactSuccessMessage(null);

      await requestContact(
        match.lostReport.id,
        match.foundReport.id,
        currentUser.id
      );

      setContactSuccessMessage('Contact details released securely! You can now coordinate item verification.');
      setRequestingContactId(null);
      onRefreshMatches();
    } catch (err: any) {
      setRequestingContactId(null);
      alert(err.message || 'Could not request contact information.');
    }
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 90) return 'bg-emerald-500 text-white';
    if (score >= 75) return 'bg-blue-600 text-white';
    if (score >= 60) return 'bg-indigo-600 text-white';
    if (score >= 50) return 'bg-amber-500 text-white';
    return 'bg-slate-400 text-white';
  };

  const getScoreBgGradient = (score: number) => {
    if (score >= 90) return 'from-emerald-50 to-teal-50/50 border-emerald-200';
    if (score >= 75) return 'from-blue-50 to-indigo-50/50 border-blue-200';
    if (score >= 60) return 'from-indigo-50 to-slate-50 border-indigo-200';
    if (score >= 50) return 'from-amber-50 to-orange-50/30 border-amber-200';
    return 'from-slate-50 to-white border-slate-200';
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Possible Matches
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full">
              {matches.length} Detected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Intelligent cross-matching between campus LOST and FOUND reports based on 10 weighted factors.
          </p>
        </div>

        <button
          onClick={onRefreshMatches}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 self-start transition-colors"
        >
          Refresh AI Matches
        </button>
      </div>

      {contactSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{contactSuccessMessage}</span>
          </div>
          <button
            onClick={() => setContactSuccessMessage(null)}
            className="text-emerald-700 font-bold hover:text-emerald-900 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {matches.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-xs space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              No Strong Matches Yet
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Don't worry. Your report is saved. We will show possible matches when a compatible found item is reported.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenReportWizard('LOST')}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
            >
              Report a Lost Item
            </button>
            <button
              onClick={() => onOpenReportWizard('FOUND')}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              Report a Found Item
            </button>
          </div>
        </div>
      ) : (
        /* MATCH CARDS */
        <div className="space-y-6">
          {matches.map((match) => {
            const matchKey = `${match.lostReport.id}_${match.foundReport.id}`;
            const isContactReleased = match.lostReport.contactReleased || match.foundReport.contactReleased;
            const isVerified = match.lostReport.status === 'VERIFIED' || match.foundReport.status === 'VERIFIED';
            const isHandover = match.lostReport.status === 'HANDOVER_PENDING' || match.foundReport.status === 'HANDOVER_PENDING';
            const isReturned = match.lostReport.status === 'RETURNED' || match.foundReport.status === 'RETURNED';
            const isAdminReview = match.lostReport.status === 'ADMIN_REVIEW' || match.foundReport.status === 'ADMIN_REVIEW';

            const isExpanded = expandedMatchId === matchKey;

            return (
              <div
                key={matchKey}
                className={`bg-white rounded-3xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                  match.hasMajorConflict ? 'border-amber-300' : 'border-slate-200'
                }`}
              >
                {/* Header Strip with Match Percentage & Level */}
                <div className={`p-5 sm:p-6 bg-gradient-to-r ${getScoreBgGradient(match.matchScore)} flex flex-wrap items-center justify-between gap-4 border-b`}>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-xl font-black text-sm shadow-xs ${getScoreBadgeClass(match.matchScore)}`}>
                      {match.matchScore}% {match.matchLevel}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                        {match.lostReport.brand !== "Don't know" ? match.lostReport.brand : match.foundReport.brand !== "Don't know" ? match.foundReport.brand : ''} {match.lostReport.model !== "Don't know" ? match.lostReport.model : match.foundReport.model !== "Don't know" ? match.foundReport.model : match.lostReport.category}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <span>Category: <strong>{match.lostReport.category}</strong></span>
                        <span>•</span>
                        <span>Case #{match.lostReport.caseId} & #{match.foundReport.caseId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isReturned ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        RETURNED
                      </span>
                    ) : isHandover ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        HANDOVER PENDING
                      </span>
                    ) : isVerified ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">
                        VERIFIED
                      </span>
                    ) : isAdminReview ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        ADMIN REVIEW REQUIRED
                      </span>
                    ) : isContactReleased ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                        CONTACT RELEASED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        POSSIBLE MATCH
                      </span>
                    )}
                  </div>
                </div>

                {/* Major Conflict Banner if detected */}
                {match.hasMajorConflict && (
                  <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-xs font-semibold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {match.conflictReason || 'Notice: Discrepancies detected between items (e.g. brand or model mismatch).'}
                    </span>
                  </div>
                )}

                {/* Item Comparison Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100">
                  
                  {/* Lost Item Column */}
                  <div className="space-y-3 p-4 bg-rose-50/30 rounded-2xl border border-rose-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                        LOST ITEM
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Case: {match.lostReport.caseId}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div><strong className="text-slate-900">Brand / Model:</strong> {match.lostReport.brand} {match.lostReport.model}</div>
                      <div><strong className="text-slate-900">Colour:</strong> {match.lostReport.colour}</div>
                      {match.lostReport.caseColour && (
                        <div><strong className="text-slate-900">Case:</strong> {match.lostReport.caseColour}</div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{match.lostReport.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Lost around: {match.lostReport.approximateTime}</span>
                      </div>
                    </div>

                    {match.lostReport.imageUrl && (
                      <div className="pt-1">
                        <img
                          src={match.lostReport.imageUrl}
                          alt="Lost item reference"
                          className="h-28 rounded-xl object-contain bg-white border border-slate-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Found Item Column */}
                  <div className="space-y-3 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        FOUND ITEM
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Case: {match.foundReport.caseId}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div><strong className="text-slate-900">Brand / Model:</strong> {match.foundReport.brand} {match.foundReport.model}</div>
                      <div><strong className="text-slate-900">Colour:</strong> {match.foundReport.colour}</div>
                      {match.foundReport.caseColour && (
                        <div><strong className="text-slate-900">Case:</strong> {match.foundReport.caseColour}</div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{match.foundReport.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Found around: {match.foundReport.approximateTime}</span>
                      </div>
                    </div>

                    {match.foundReport.imageUrl && (
                      <div className="pt-1">
                        <img
                          src={match.foundReport.imageUrl}
                          alt="Found item reference"
                          className="h-28 rounded-xl object-contain bg-white border border-slate-200"
                        />
                      </div>
                    )}
                  </div>

                </div>

                {/* Match Reasons List with Checkmarks */}
                <div className="px-6 py-4 bg-slate-50/60 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <span className="font-bold text-slate-700">Possible matching factors:</span>
                  {match.matchReasons.length > 0 ? (
                    match.matchReasons.map((reason, idx) => (
                      <span key={idx} className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{reason}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">Baseline category compatibility</span>
                  )}

                  <button
                    onClick={() => setExpandedMatchId(isExpanded ? null : matchKey)}
                    className="ml-auto text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
                  >
                    {isExpanded ? 'Hide Factor Breakdown' : 'View 10-Factor Weight Breakdown'}
                  </button>
                </div>

                {/* Expanded Factor Breakdown */}
                {isExpanded && (
                  <div className="px-6 py-4 bg-slate-100/70 border-t border-slate-200 text-xs space-y-2 animate-in fade-in">
                    <div className="font-bold text-slate-800 mb-2">10-Factor Weighted Algorithm Analysis:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {match.factors.map((f, i) => (
                        <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] space-y-0.5">
                          <div className="flex justify-between font-semibold">
                            <span>{f.name} ({f.weight}%)</span>
                            <span className={f.matched ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                              {f.score.toFixed(1)} / {f.weight}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{f.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Reveal / Verification / Handover Footer */}
                <div className="p-6 bg-white space-y-4">
                  
                  {/* State 1: Contact Not Released Yet */}
                  {!isContactReleased ? (
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="font-bold text-sm text-indigo-950 flex items-center justify-center sm:justify-start gap-1.5">
                          <Lock className="w-4 h-4 text-indigo-600" />
                          <span>Potential Match Found</span>
                        </h4>
                        <p className="text-xs text-indigo-800 max-w-xl">
                          Some details appear to match. You can request contact with the other student to verify the item.
                        </p>
                      </div>

                      <button
                        onClick={() => handleRequestContact(match)}
                        disabled={!match.canRequestContact || requestingContactId === matchKey}
                        className="w-full sm:w-auto px-6 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md shadow-indigo-200 transition-colors uppercase tracking-wider shrink-0"
                      >
                        {requestingContactId === matchKey ? 'Requesting...' : 'REQUEST CONTACT'}
                      </button>
                    </div>
                  ) : (
                    /* State 2: Contact Released & Next Steps */
                    <div className="space-y-4">
                      
                      {/* Released Contact Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                        {/* Lost Reporter Contact */}
                        <div className="space-y-1 text-xs">
                          <div className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">
                            Lost Item Reporter Contact
                          </div>
                          <div className="font-bold text-slate-900">{match.lostReport.userProfile.fullName} ({match.lostReport.userProfile.department}, {match.lostReport.userProfile.year})</div>
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <a href={`tel:${match.lostReport.userProfile.mobileNumber}`} className="font-semibold underline">
                              {match.lostReport.userProfile.mobileNumber || 'Verified in App'}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{match.lostReport.userProfile.email}</span>
                          </div>
                        </div>

                        {/* Found Reporter Contact */}
                        <div className="space-y-1 text-xs">
                          <div className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">
                            Found Item Reporter Contact
                          </div>
                          <div className="font-bold text-slate-900">{match.foundReport.userProfile.fullName} ({match.foundReport.userProfile.department}, {match.foundReport.userProfile.year})</div>
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <a href={`tel:${match.foundReport.userProfile.mobileNumber}`} className="font-semibold underline">
                              {match.foundReport.userProfile.mobileNumber || 'Verified in App'}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{match.foundReport.userProfile.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Workflow Buttons based on status */}
                      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                        {!isVerified && !isAdminReview && (
                          <button
                            onClick={() => onOpenVerification(
                              match.lostReport.id,
                              match.foundReport.id,
                              match.lostReport.privateVerification?.question || match.foundReport.privateVerification?.question
                            )}
                            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>VERIFY THE ITEM</span>
                          </button>
                        )}

                        {isAdminReview && (
                          <div className="px-4 py-2 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            <span>ADMIN REVIEW REQUIRED (3 Verification Attempts Exceeded)</span>
                          </div>
                        )}

                        {isVerified && !isReturned && (
                          <button
                            onClick={() => onOpenHandover(match.lostReport.id, match.foundReport.id)}
                            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>ARRANGE HANDOVER</span>
                          </button>
                        )}

                        {isReturned && (
                          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-emerald-300">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>Item Returned Successfully</span>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
