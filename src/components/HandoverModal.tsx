import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { arrangeHandover, confirmReturn } from '../services/api.ts';

interface HandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  partnerReportId: string;
  existingHandover?: any;
  onSuccess: () => void;
}

const RECOMMENDED_LOCATIONS = [
  'Main Block',
  'Library',
  'Cafeteria',
  'Reception',
  'Security Office',
];

export const HandoverModal: React.FC<HandoverModalProps> = ({
  isOpen,
  onClose,
  reportId,
  partnerReportId,
  existingHandover,
  onSuccess,
}) => {
  const [location, setLocation] = useState(existingHandover?.location || 'Library');
  const [date, setDate] = useState(
    existingHandover?.date || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(existingHandover?.time || '01:30 PM');
  const [notes, setNotes] = useState(existingHandover?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingReturn, setIsConfirmingReturn] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await arrangeHandover(reportId, partnerReportId, location, date, time, notes);
      setIsSaving(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSaving(false);
      alert(err.message || 'Could not save handover details.');
    }
  };

  const handleMarkReturned = async () => {
    try {
      setIsConfirmingReturn(true);
      await confirmReturn(reportId, partnerReportId);
      setIsConfirmingReturn(false);
      setReturnSuccess(true);
      onSuccess();
    } catch (err: any) {
      setIsConfirmingReturn(false);
      alert(err.message || 'Could not confirm return.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base">Arrange Handover</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {returnSuccess ? (
            /* RETURNED SUCCESS CARD */
            <div className="text-center space-y-4 py-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  RETURNED
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 pt-2">
                  Item Returned Successfully
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Great! This lost item has been successfully returned to its owner.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Close & View in Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveHandover} className="space-y-4">
              
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Campus Handover Safe Zones</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Always meet in well-lit public campus locations. Recommended: Library, Reception, or Security Office.
                </p>
              </div>

              {/* Campus Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Handover Location *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {RECOMMENDED_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                        location === loc
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Or enter specific spot (e.g. Library 2nd Floor counter)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  required
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Time *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="e.g. 01:30 PM (lunch break)"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Special Notes / Meeting Landmark
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Waiting near the librarian desk holding the red backpack"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder-slate-400"
                />
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-xl shadow-md shadow-emerald-200 transition-colors"
                  >
                    {isSaving ? 'Scheduling...' : 'Save Handover Schedule'}
                  </button>
                </div>
              </div>

              {/* Secondary action: Mark Returned if meeting already completed */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Handover already happened?</span>
                <button
                  type="button"
                  onClick={handleMarkReturned}
                  disabled={isConfirmingReturn}
                  className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as RETURNED</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
