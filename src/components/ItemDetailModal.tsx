import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Phone, 
  Mail, 
  User, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Lock 
} from 'lucide-react';
import { ItemReport, UserProfile } from '../types/index.ts';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ItemReport | null;
  currentUser: UserProfile | null;
  onOpenMatches: (reportId: string) => void;
  onOpenHandover: (reportId: string, partnerReportId: string, existing?: any) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  report,
  currentUser,
  onOpenMatches,
  onOpenHandover,
}) => {
  if (!isOpen || !report) return null;

  const isOwner = currentUser && report.userId === currentUser.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className={`p-6 text-white flex items-center justify-between ${
          report.type === 'LOST'
            ? 'bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950'
            : 'bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/20">
                {report.caseId}
              </span>
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-300">
                {report.type} REPORT
              </span>
            </div>
            <h3 className="text-xl font-extrabold">
              {report.brand !== "Don't know" ? report.brand : ''} {report.model !== "Don't know" ? report.model : ''} {report.category}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Key specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Category</span>
              <span className="font-bold text-slate-900">{report.category}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Brand</span>
              <span className="font-bold text-slate-900">{report.brand}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Model</span>
              <span className="font-bold text-slate-900">{report.model}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Colour</span>
              <span className="font-bold text-slate-900">{report.colour}</span>
            </div>
            {report.caseColour && (
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Case / Cover</span>
                <span className="font-bold text-slate-900">{report.caseColour}</span>
              </div>
            )}
            {report.lockType && (
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Lock Type</span>
                <span className="font-bold text-slate-900">{report.lockType}</span>
              </div>
            )}
            {report.accessories && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Accessories</span>
                <span className="font-bold text-slate-900">{report.accessories}</span>
              </div>
            )}
            {report.specialMarks && (
              <div className="sm:col-span-3">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Special Marks / Wear</span>
                <span className="font-bold text-slate-900">{report.specialMarks}</span>
              </div>
            )}
          </div>

          {/* Location & Time */}
          <div className="flex flex-col sm:flex-row gap-4 p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-indigo-950">
            <div className="flex items-center gap-2 flex-1">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="text-[10px] text-indigo-700 font-semibold uppercase block">Campus Location</span>
                <span className="font-bold">{report.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="text-[10px] text-indigo-700 font-semibold uppercase block">Approximate Time</span>
                <span className="font-bold">{report.approximateTime}</span>
              </div>
            </div>
          </div>

          {/* Raw conversational description if available */}
          {report.rawDescription && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Original Description:</span>
              <p className="italic text-slate-800">"{report.rawDescription}"</p>
            </div>
          )}

          {/* AI Image Analysis if photo was uploaded */}
          {report.imageAnalysis && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>AI Vision Inspection Record</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">Object ({report.imageAnalysis.objectConfidence}%)</span>
                  <span className="font-bold text-slate-900">{report.imageAnalysis.objectType}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">Colour ({report.imageAnalysis.colourConfidence}%)</span>
                  <span className="font-bold text-slate-900">{report.imageAnalysis.colour}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">Cover ({report.imageAnalysis.caseConfidence}%)</span>
                  <span className="font-bold text-slate-900">{report.imageAnalysis.caseCover}</span>
                </div>
              </div>
              <p className="text-[10px] text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{report.imageAnalysis.disclaimer}</span>
              </p>
            </div>
          )}

          {/* Uploaded photo if present */}
          {report.imageUrl && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Attached Photo:</span>
              <img
                src={report.imageUrl}
                alt="Item photo"
                className="max-h-56 mx-auto rounded-xl border border-slate-200 object-contain shadow-xs bg-slate-50"
              />
            </div>
          )}

          {/* Reporter & Contact Info (Safe disclosure) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Reporter Profile:</span>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-bold text-slate-900">{report.userProfile.fullName} ({report.userProfile.department}, {report.userProfile.year})</div>
                <div className="text-slate-500">Student ID: {report.userProfile.studentId}</div>
              </div>

              {report.userProfile.mobileNumber ? (
                <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
                  <Phone className="w-3.5 h-3.5" />
                  <a href={`tel:${report.userProfile.mobileNumber}`} className="underline">
                    {report.userProfile.mobileNumber}
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-500 text-[11px] bg-slate-200/60 px-2 py-1 rounded">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Phone number shielded until &ge;50% match verified</span>
                </div>
              )}
            </div>
          </div>

          {/* Handover Details if scheduled */}
          {report.handoverDetails && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Scheduled Campus Handover</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-900">
                <div><strong>Location:</strong> {report.handoverDetails.location}</div>
                <div><strong>Date & Time:</strong> {report.handoverDetails.date} @ {report.handoverDetails.time}</div>
                {report.handoverDetails.notes && (
                  <div className="col-span-2"><strong>Notes:</strong> {report.handoverDetails.notes}</div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenMatches(report.id);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Find AI Matches</span>
            </button>

            {report.status === 'VERIFIED' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenHandover(report.id, report.matchedReportId || '', report.handoverDetails);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
              >
                Arrange Handover
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
