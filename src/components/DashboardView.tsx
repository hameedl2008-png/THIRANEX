import React, { useState } from 'react';
import { 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  PlusCircle, 
  Search, 
  ArrowRight 
} from 'lucide-react';
import { ItemReport, ReportStatus, UserProfile } from '../types/index.ts';

interface DashboardViewProps {
  reports: ItemReport[];
  currentUser: UserProfile | null;
  onOpenReportWizard: (type: 'LOST' | 'FOUND') => void;
  onOpenMatches: (reportId?: string) => void;
  onOpenVerification: (reportId: string, partnerReportId: string, question?: string) => void;
  onOpenHandover: (reportId: string, partnerReportId: string, existing?: any) => void;
  onSelectReport: (report: ItemReport) => void;
}

type DashboardTab = 
  | 'LOST'
  | 'FOUND'
  | 'MATCHES'
  | 'CONTACTS'
  | 'HANDOVER'
  | 'RETURNED';

export const DashboardView: React.FC<DashboardViewProps> = ({
  reports,
  currentUser,
  onOpenReportWizard,
  onOpenMatches,
  onOpenVerification,
  onOpenHandover,
  onSelectReport,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('LOST');

  // Filter based on tab
  const myReports = currentUser 
    ? reports.filter(r => r.userId === currentUser.id)
    : reports;

  const lostReports = myReports.filter(r => r.type === 'LOST' && r.status !== 'RETURNED');
  const foundReports = myReports.filter(r => r.type === 'FOUND' && r.status !== 'RETURNED');
  const possibleMatchReports = myReports.filter(r => r.status === 'POSSIBLE_MATCH');
  const contactReports = myReports.filter(r => r.contactReleased || r.status === 'CONTACT_RELEASED' || r.status === 'VERIFIED');
  const handoverReports = myReports.filter(r => r.status === 'HANDOVER_PENDING');
  const returnedReports = myReports.filter(r => r.status === 'RETURNED');

  const getDisplayedReports = () => {
    switch (activeTab) {
      case 'LOST': return lostReports;
      case 'FOUND': return foundReports;
      case 'MATCHES': return possibleMatchReports;
      case 'CONTACTS': return contactReports;
      case 'HANDOVER': return handoverReports;
      case 'RETURNED': return returnedReports;
      default: return myReports;
    }
  };

  const currentTabReports = getDisplayedReports();

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'LOST_REPORTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Lost Reported</span>;
      case 'FOUND_REPORTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Found Reported</span>;
      case 'POSSIBLE_MATCH':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Possible Match</span>;
      case 'CONTACT_RELEASED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Contact Released</span>;
      case 'VERIFIED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified</span>;
      case 'HANDOVER_PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Handover Pending</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white flex items-center gap-1"><Check className="w-3 h-3" /> RETURNED</span>;
      case 'ADMIN_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white">ADMIN REVIEW</span>;
      case 'DISPUTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-600 text-white">Disputed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your lost & found cases, AI match alerts, contact sharing, and handover schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReportWizard('LOST')}
            className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Lost</span>
          </button>
          <button
            onClick={() => onOpenReportWizard('FOUND')}
            className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Found</span>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 text-xs font-bold">
        
        <button
          onClick={() => setActiveTab('LOST')}
          className={`px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'LOST'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>My Lost Reports</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'LOST' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {lostReports.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('FOUND')}
          className={`px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'FOUND'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>My Found Reports</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'FOUND' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {foundReports.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('MATCHES')}
          className={`px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'MATCHES'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Possible Matches</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'MATCHES' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {possibleMatchReports.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('CONTACTS')}
          className={`px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'CONTACTS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Contact Requests</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'CONTACTS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {contactReports.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('HANDOVER')}
          className={`px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'HANDOVER'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Handover</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'HANDOVER' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {handoverReports.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('RETURNED')}
          className={`px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'RETURNED'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Returned Items</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'RETURNED' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {returnedReports.length}
          </span>
        </button>

      </div>

      {/* LIST OR EMPTY STATE */}
      {currentTabReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-xs space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              No Reports Yet
            </h3>
            <p className="text-xs text-slate-500">
              Your lost and found reports will appear here.
            </p>
          </div>
          <button
            onClick={() => onOpenReportWizard('LOST')}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            Create Your First Report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentTabReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              
              {/* Row 1: Case ID, Title, Status */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                    {report.caseId}
                  </span>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {report.brand !== "Don't know" ? report.brand : ''} {report.model !== "Don't know" ? report.model : ''} {report.category}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>Category: {report.category}</span>
                      <span>•</span>
                      <span>Colour: {report.colour}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(report.status)}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Case Progress Timeline:
                </div>
                <div className="flex items-center justify-between text-[11px] relative">
                  
                  {/* Step 1: Reported */}
                  <div className="flex flex-col items-center z-10">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                    <span className="mt-1 text-[10px] font-semibold text-slate-700">Reported</span>
                  </div>

                  {/* Line 1 */}
                  <div className={`h-0.5 flex-1 mx-1 ${
                    report.status !== 'LOST_REPORTED' && report.status !== 'FOUND_REPORTED'
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`} />

                  {/* Step 2: Possible Match */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      report.status !== 'LOST_REPORTED' && report.status !== 'FOUND_REPORTED'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {report.status !== 'LOST_REPORTED' && report.status !== 'FOUND_REPORTED' ? '✓' : '2'}
                    </div>
                    <span className="mt-1 text-[10px] font-semibold text-slate-700">Match Alert</span>
                  </div>

                  {/* Line 2 */}
                  <div className={`h-0.5 flex-1 mx-1 ${
                    ['CONTACT_RELEASED', 'VERIFIED', 'HANDOVER_PENDING', 'RETURNED'].includes(report.status)
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`} />

                  {/* Step 3: Contact */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      ['CONTACT_RELEASED', 'VERIFIED', 'HANDOVER_PENDING', 'RETURNED'].includes(report.status)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {['CONTACT_RELEASED', 'VERIFIED', 'HANDOVER_PENDING', 'RETURNED'].includes(report.status) ? '✓' : '3'}
                    </div>
                    <span className="mt-1 text-[10px] font-semibold text-slate-700">Contact</span>
                  </div>

                  {/* Line 3 */}
                  <div className={`h-0.5 flex-1 mx-1 ${
                    ['VERIFIED', 'HANDOVER_PENDING', 'RETURNED'].includes(report.status)
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`} />

                  {/* Step 4: Verified */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      ['VERIFIED', 'HANDOVER_PENDING', 'RETURNED'].includes(report.status)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {['VERIFIED', 'HANDOVER_PENDING', 'RETURNED'].includes(report.status) ? '✓' : '4'}
                    </div>
                    <span className="mt-1 text-[10px] font-semibold text-slate-700">Verified</span>
                  </div>

                  {/* Line 4 */}
                  <div className={`h-0.5 flex-1 mx-1 ${
                    ['HANDOVER_PENDING', 'RETURNED'].includes(report.status)
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`} />

                  {/* Step 5: Handover */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      ['HANDOVER_PENDING', 'RETURNED'].includes(report.status)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {['HANDOVER_PENDING', 'RETURNED'].includes(report.status) ? '✓' : '5'}
                    </div>
                    <span className="mt-1 text-[10px] font-semibold text-slate-700">Handover</span>
                  </div>

                  {/* Line 5 */}
                  <div className={`h-0.5 flex-1 mx-1 ${
                    report.status === 'RETURNED'
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`} />

                  {/* Step 6: Returned */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      report.status === 'RETURNED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {report.status === 'RETURNED' ? '✓' : '6'}
                    </div>
                    <span className="mt-1 text-[10px] font-semibold text-slate-700">Returned</span>
                  </div>

                </div>
              </div>

              {/* Details & Location Row */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3 pt-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{report.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectReport(report)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => onOpenMatches(report.id)}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Check AI Matches</span>
                  </button>

                  {report.status === 'VERIFIED' && (
                    <button
                      onClick={() => onOpenHandover(report.id, report.matchedReportId || '')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                      Arrange Handover
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
