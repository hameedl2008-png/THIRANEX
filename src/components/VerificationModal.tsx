import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { verifyItemSecret } from '../services/api.ts';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  partnerReportId: string;
  question?: string;
  onSuccessVerified: () => void;
  onOpenHandover: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  reportId,
  partnerReportId,
  question,
  onSuccessVerified,
  onOpenHandover,
}) => {
  const [answer, setAnswer] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [adminReview, setAdminReview] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const promptQuestion = question || 'What unique private marking, sticker, or secret wallpaper is on this item?';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    try {
      setIsChecking(true);
      setErrorMsg(null);

      const res = await verifyItemSecret(reportId, partnerReportId, answer.trim());
      setIsChecking(false);

      if (res.verified) {
        setIsSuccess(true);
        onSuccessVerified();
      } else {
        if (res.adminReviewRequired) {
          setAdminReview(true);
          setErrorMsg('ADMIN REVIEW REQUIRED: 3 failed verification attempts reached. Case escalated to Campus Security.');
        } else {
          setAttemptsRemaining(res.attemptsLeft ?? 2);
          setErrorMsg(res.error || `Incorrect verification answer. ${res.attemptsLeft} attempt(s) remaining.`);
        }
      }
    } catch (err: any) {
      setIsChecking(false);
      setErrorMsg(err.message || 'Verification attempt failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-base">Verify the Item</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {isSuccess ? (
            /* SUCCESS STATE */
            <div className="text-center space-y-4 py-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-slate-900">
                  Verification Successful
                </h4>
                <p className="text-xs text-slate-600">
                  The item appears to belong to this student.
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => {
                    onClose();
                    onOpenHandover();
                  }}
                  className="w-full py-3 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-200 transition-colors flex items-center justify-center gap-2"
                >
                  <span>ARRANGE HANDOVER</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : adminReview ? (
            /* ADMIN REVIEW REQUIRED STATE */
            <div className="text-center space-y-4 py-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                <AlertCircle className="w-9 h-9" />
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-rose-700">
                  ADMIN REVIEW REQUIRED
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Maximum verification attempts exceeded (3/3). For student security, an authorized campus administrator or Security Office supervisor must manually inspect the item.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left">
                <strong>Next Step:</strong> Bring your Student ID card to the <strong>Campus Security Office (Gate 1)</strong> between 9:00 AM and 5:00 PM for manual verification.
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            /* VERIFICATION FORM */
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Unpublished Secret Question:</span>
                </div>
                <p className="text-xs font-semibold text-indigo-900">
                  "{promptQuestion}"
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Owner's Answer *
                </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type the secret answer or description..."
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                  required
                  autoFocus
                />
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                  <span>Maximum 3 verification attempts allowed.</span>
                  {attemptsRemaining !== null && (
                    <span className="font-bold text-amber-700">
                      {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining
                    </span>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChecking || !answer.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl shadow-md shadow-indigo-200 transition-colors"
                >
                  {isChecking ? 'Verifying Answer...' : 'Submit Verification'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
