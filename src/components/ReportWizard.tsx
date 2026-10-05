import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Upload, 
  Check, 
  HelpCircle, 
  Camera, 
  AlertCircle, 
  Send, 
  Languages, 
  CheckCircle2, 
  ShieldAlert, 
  Lock, 
  MapPin, 
  Clock, 
  Tag, 
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { 
  ItemCategory, 
  ReportType, 
  UserProfile, 
  ImageAnalysisData, 
  ParsedNLResult 
} from '../types/index.ts';
import { parseNaturalLanguage, analyzeImage, createReport } from '../services/api.ts';

interface ReportWizardProps {
  type: ReportType; // 'LOST' or 'FOUND'
  profile: UserProfile;
  onCancel: () => void;
  onSuccess: (reportId: string, caseId: string) => void;
}

const CATEGORIES: { label: ItemCategory; icon: string }[] = [
  { label: 'Phone', icon: '📱' },
  { label: 'Laptop', icon: '💻' },
  { label: 'Tablet', icon: '📟' },
  { label: 'Smart Watch', icon: '⌚' },
  { label: 'Earbuds / Headphones', icon: '🎧' },
  { label: 'Charger', icon: '🔌' },
  { label: 'Power Bank', icon: '🔋' },
  { label: 'Wallet', icon: '👛' },
  { label: 'Keys', icon: '🔑' },
  { label: 'Bag', icon: '🎒' },
  { label: 'Other Personal Item', icon: '📦' },
];

const CAMPUS_LOCATIONS = [
  'Central Library (Ground Floor)',
  'Central Library (2nd Floor Reading Room)',
  'Main Block Auditorium',
  'Main Block Reception',
  'Main Cafeteria / Food Court',
  'CSE / AI Computer Lab 3',
  'ECE Electronics Lab',
  'Sports Complex / Grounds',
  'Campus Security Gate 1',
  'Campus Security Gate 2',
  'Bus Bay / Parking Area',
  'Hostel Mess Block',
];

export const ReportWizard: React.FC<ReportWizardProps> = ({
  type,
  profile,
  onCancel,
  onSuccess,
}) => {
  // Conversational step tracking
  // Step 1: Category & Natural language speech/typing input (English / Tamil / Tanglish)
  // Step 2: Dynamic Category Questions
  // Step 3: Photo upload & AI image analysis
  // Step 4: Private verification question setup (secret key for recovery)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [category, setCategory] = useState<ItemCategory>('Phone');
  const [rawText, setRawText] = useState('');
  const [isParsingNL, setIsParsingNL] = useState(false);
  const [nlFeedback, setNlFeedback] = useState<string | null>(null);

  // Dynamic fields
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [colour, setColour] = useState('');
  const [caseColour, setCaseColour] = useState('');
  const [caseDesign, setCaseDesign] = useState('');
  const [lockType, setLockType] = useState('');
  const [accessories, setAccessories] = useState('');
  const [physicalCharacteristics, setPhysicalCharacteristics] = useState('');
  const [specialMarks, setSpecialMarks] = useState('');
  const [material, setMaterial] = useState('');
  const [contentsDescription, setContentsDescription] = useState('');
  const [location, setLocation] = useState('');
  const [approximateTime, setApproximateTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today'
  );

  // Image & AI Analysis
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysisData | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Private Verification Key
  const [secretQuestion, setSecretQuestion] = useState(
    type === 'LOST' 
      ? 'What specific wallpaper or private sticker is on this item?'
      : 'What unmentioned secret marking or card is inside/on the item?'
  );
  const [secretAnswer, setSecretAnswer] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Natural Language Interpreter
  const handleParseNL = async () => {
    if (!rawText.trim()) return;
    try {
      setIsParsingNL(true);
      setNlFeedback(null);
      const parsed: ParsedNLResult = await parseNaturalLanguage(rawText, type, category);

      if (parsed.category) setCategory(parsed.category);
      if (parsed.brand && parsed.brand !== "Don't know") setBrand(parsed.brand);
      if (parsed.model && parsed.model !== "Don't know") setModel(parsed.model);
      if (parsed.colour && parsed.colour !== "Don't know") setColour(parsed.colour);
      if (parsed.caseColour && parsed.caseColour !== "Don't know") setCaseColour(parsed.caseColour);
      if (parsed.caseDesign && parsed.caseDesign !== "Don't know") setCaseDesign(parsed.caseDesign);
      if (parsed.lockType && parsed.lockType !== "Don't know") setLockType(parsed.lockType);
      if (parsed.accessories && parsed.accessories !== "Don't know") setAccessories(parsed.accessories);
      if (parsed.physicalCharacteristics && parsed.physicalCharacteristics !== "Don't know") setPhysicalCharacteristics(parsed.physicalCharacteristics);
      if (parsed.specialMarks && parsed.specialMarks !== "Don't know") setSpecialMarks(parsed.specialMarks);
      if (parsed.material && parsed.material !== "Don't know") setMaterial(parsed.material);
      if (parsed.contentsDescription && parsed.contentsDescription !== "Don't know") setContentsDescription(parsed.contentsDescription);
      if (parsed.location && parsed.location !== "Don't know") setLocation(parsed.location);

      const langNotice = parsed.detectedLanguage ? `[${parsed.detectedLanguage} detected]` : '';
      setNlFeedback(`AI understood your description ${langNotice}: Extracted ${parsed.category || ''} details!`);
      setIsParsingNL(false);
    } catch (err: any) {
      setIsParsingNL(false);
      setNlFeedback('AI could not fully extract structured details, but you can refine the answers below.');
    }
  };

  // Image Upload & AI analysis
  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    setImageError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      try {
        setIsAnalyzingImage(true);
        const analysis = await analyzeImage(base64, file.type);
        setImageAnalysis(analysis);
        setIsAnalyzingImage(false);

        // Pre-fill fields if user hasn't specified them yet
        if (!colour && analysis.colour) setColour(analysis.colour);
        if (!brand && analysis.brand && !analysis.brand.includes('Unbranded')) setBrand(analysis.brand);
        if (!caseColour && analysis.caseCover && !analysis.caseCover.includes('None')) setCaseColour(analysis.caseCover);
      } catch (err: any) {
        setIsAnalyzingImage(false);
        setImageError('We could not analyze this image. Please try another image.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    if (!location.trim()) {
      setSubmitError('Please enter where the item was lost or found.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const reportPayload = {
        type,
        userId: profile.id,
        userProfile: {
          fullName: profile.fullName,
          studentId: profile.studentId,
          department: profile.department,
          year: profile.year,
          email: profile.email,
          mobileNumber: profile.mobileNumber, // Automatically attached, never re-requested!
        },
        category,
        brand: brand.trim() || "Don't know",
        model: model.trim() || "Don't know",
        colour: colour.trim() || "Don't know",
        caseColour: caseColour.trim() || undefined,
        caseDesign: caseDesign.trim() || undefined,
        lockType: lockType.trim() || undefined,
        accessories: accessories.trim() || undefined,
        physicalCharacteristics: physicalCharacteristics.trim() || undefined,
        specialMarks: specialMarks.trim() || undefined,
        material: material.trim() || undefined,
        contentsDescription: contentsDescription.trim() || undefined,
        location: location.trim(),
        approximateTime,
        rawDescription: rawText.trim() || undefined,
        imageUrl: imagePreview || undefined,
        imageAnalysis: imageAnalysis || undefined,
        privateVerification: secretAnswer.trim() ? {
          question: secretQuestion.trim(),
          answer: secretAnswer.trim(),
        } : undefined,
      };

      const result = await createReport(reportPayload);
      setIsSubmitting(false);
      onSuccess(result.id, result.caseId);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err?.message || 'Your report could not be submitted. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((stepIdx) => (
            <div
              key={stepIdx}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === stepIdx
                  ? 'w-8 bg-indigo-600'
                  : step > stepIdx
                  ? 'w-4 bg-emerald-500'
                  : 'w-4 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <span className="text-xs font-bold text-slate-400">
          Step {step} of 4
        </span>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Title Banner */}
        <div className={`p-6 sm:p-8 text-white ${
          type === 'LOST'
            ? 'bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950'
            : 'bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
            <span className={`w-2 h-2 rounded-full ${type === 'LOST' ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
            <span>{type === 'LOST' ? 'Lost Item Reporting' : 'Found Item Reporting'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {type === 'LOST' ? 'Tell Us What You Lost' : 'Tell Us What You Found'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Student profile: <span className="font-semibold text-white">{profile.fullName}</span> ({profile.studentId}, {profile.department})
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* STEP 1: Conversational Selection & English/Tamil/Tanglish description */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Question: What did you lose/find? */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-800">
                  {type === 'LOST' ? 'What did you lose?' : 'What did you find?'}
                </label>
                <p className="text-xs text-slate-500">
                  Select an item category or type a natural description below:
                </p>

                {/* Category Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => setCategory(cat.label)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        category === cat.label
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50/80'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-xs leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversational input with multilingual support (English, Tamil, Tanglish) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Languages className="w-4 h-4 text-indigo-600" />
                    <span>Describe in English, Tamil, or Tanglish</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    AI Auto-Extraction
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder='Type or speak freely, e.g.: "Black Samsung S23 da, blue cover irukku, library la vitten" or "White boat earbuds found in canteen"'
                    className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleParseNL}
                    disabled={isParsingNL || !rawText.trim()}
                    className="absolute right-2 bottom-3 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isParsingNL ? 'AI Parsing...' : 'AI Interpret'}
                  </button>
                </div>

                {/* Example chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-600">Try quick phrases:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRawText('Black Samsung S23 da, blue cover irukku, library canteen pakkathula miss aachu.');
                    }}
                    className="px-2 py-0.5 rounded-full bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    "Black Samsung S23 da..." (Tanglish)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRawText('Dell laptop grey colour, with tech stickers on lid, left in Central Library.');
                    }}
                    className="px-2 py-0.5 rounded-full bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    "Dell laptop grey colour..." (English)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRawText('என்னோட black Samsung phone library பக்கத்துல தொலைஞ்சிடுச்சு.');
                    }}
                    className="px-2 py-0.5 rounded-full bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    "என்னோட black Samsung phone..." (Tamil)
                  </button>
                </div>

                {nlFeedback && (
                  <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{nlFeedback}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-colors"
                >
                  Continue to Item Questions &rarr;
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: Dynamic Category Questions with "I don't know" */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Dynamic Questions for {category}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Answer as much as you recall. Select "I don't know" if uncertain.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {category}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Brand */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Brand
                    </label>
                    <button
                      type="button"
                      onClick={() => setBrand("I don't know")}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      I don't know
                    </button>
                  </div>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Samsung, Apple, Dell, Boat"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Model */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Model / Sub-series
                    </label>
                    <button
                      type="button"
                      onClick={() => setModel("I don't know")}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      I don't know
                    </button>
                  </div>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Galaxy S23, iPhone 14, Inspiron 15"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Colour */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Primary Colour
                    </label>
                    <button
                      type="button"
                      onClick={() => setColour("I don't know")}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      I don't know
                    </button>
                  </div>
                  <input
                    type="text"
                    value={colour}
                    onChange={(e) => setColour(e.target.value)}
                    placeholder="e.g. Black, Silver, Navy Blue"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Category specific fields */}
                {category === 'Phone' && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Case Colour & Design
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setCaseColour("I don't know");
                            setCaseDesign("No case");
                          }}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          I don't know
                        </button>
                      </div>
                      <input
                        type="text"
                        value={caseColour}
                        onChange={(e) => setCaseColour(e.target.value)}
                        placeholder="e.g. Blue matte cover, Transparent case"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Lock Type
                        </label>
                        <button
                          type="button"
                          onClick={() => setLockType("I don't know")}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          I don't know
                        </button>
                      </div>
                      <select
                        value={lockType}
                        onChange={(e) => setLockType(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">Select Lock Mechanism</option>
                        <option value="PIN / Numeric Code">PIN / Numeric Code</option>
                        <option value="Pattern Lock">Pattern Lock</option>
                        <option value="Fingerprint / Biometric">Fingerprint / Biometric</option>
                        <option value="Face Unlock">Face Unlock</option>
                        <option value="No Lock Screen">No Lock Screen</option>
                        <option value="I don't know">I don't know</option>
                      </select>
                    </div>
                  </>
                )}

                {category === 'Wallet' && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Material & Size
                        </label>
                        <button
                          type="button"
                          onClick={() => setMaterial("I don't know")}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          I don't know
                        </button>
                      </div>
                      <input
                        type="text"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        placeholder="e.g. Brown leather bi-fold, Canvas slim"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Contents Category
                        </label>
                        <button
                          type="button"
                          onClick={() => setContentsDescription("I don't know")}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          I don't know
                        </button>
                      </div>
                      <input
                        type="text"
                        value={contentsDescription}
                        onChange={(e) => setContentsDescription(e.target.value)}
                        placeholder="e.g. College ID card, transit pass (no sensitive pin!)"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}

                {/* Common: Accessories & Special Marks */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Accessories & Attachments
                    </label>
                    <button
                      type="button"
                      onClick={() => setAccessories("I don't know")}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      I don't know
                    </button>
                  </div>
                  <input
                    type="text"
                    value={accessories}
                    onChange={(e) => setAccessories(e.target.value)}
                    placeholder="e.g. Keyring charm, red charging cable, lanyard"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Special Marks / Scratches
                    </label>
                    <button
                      type="button"
                      onClick={() => setSpecialMarks("I don't know")}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      I don't know
                    </button>
                  </div>
                  <input
                    type="text"
                    value={specialMarks}
                    onChange={(e) => setSpecialMarks(e.target.value)}
                    placeholder="e.g. Scratch on top corner, anime sticker"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Location */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {type === 'LOST' ? 'Last Known Location on Campus *' : 'Where Did You Find It? *'}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Central Library 2nd floor, Main Cafeteria table 12"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  {/* Campus quick chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {CAMPUS_LOCATIONS.slice(0, 6).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(loc)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Approximate Time */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Approximate Time {type === 'LOST' ? 'Lost' : 'Found'} *
                  </label>
                  <input
                    type="text"
                    value={approximateTime}
                    onChange={(e) => setApproximateTime(e.target.value)}
                    placeholder="e.g. Today around 10:30 AM"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-colors"
                >
                  Next: Photo & AI Analysis &rarr;
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Photo Upload & AI Image Analysis */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">
                  Upload Photo of Item
                </h3>
                <p className="text-xs text-slate-500">
                  {type === 'FOUND' 
                    ? 'Upload an image of the found item. Our AI will analyze visible characteristics and estimate confidence.'
                    : 'Optional: Upload a photo of your lost item or similar model photo for visual matching.'}
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="Uploaded item"
                      className="max-h-48 rounded-xl object-contain shadow-sm border border-slate-200"
                    />
                    <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold">
                      <Camera className="w-4 h-4" />
                      <span>Click to choose another photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-700">
                      Click or drag image to upload
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Supports JPG, PNG, WebP (camera photos from phone work great)
                    </p>
                  </div>
                )}
              </div>

              {imageError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{imageError}</span>
                </div>
              )}

              {/* AI Image Analysis Display */}
              {isAnalyzingImage && (
                <div className="p-6 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col items-center justify-center space-y-3">
                  <Sparkles className="w-6 h-6 text-indigo-600 animate-spin" />
                  <div className="text-center">
                    <div className="font-bold text-xs text-indigo-950">AI Image Analysis in progress...</div>
                    <p className="text-[11px] text-indigo-700">Extracting visual features, color tones, and visible markings</p>
                  </div>
                </div>
              )}

              {imageAnalysis && !isAnalyzingImage && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">AI Image Analysis</h4>
                        <p className="text-[10px] text-slate-500">Visual attributes detected with confidence ratings</p>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    
                    {/* Object Type */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Object</span>
                        <span className="font-bold text-indigo-600">{imageAnalysis.objectConfidence}%</span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {imageAnalysis.objectType}
                      </div>
                    </div>

                    {/* Colour */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Colour</span>
                        <span className="font-bold text-emerald-600">{imageAnalysis.colourConfidence}%</span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {imageAnalysis.colour}
                      </div>
                    </div>

                    {/* Brand if detected */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Brand</span>
                        <span className="font-bold text-blue-600">{imageAnalysis.brandConfidence}%</span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {imageAnalysis.brand}
                      </div>
                    </div>

                    {/* Case / Cover */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Case / Cover</span>
                        <span className="font-bold text-amber-600">{imageAnalysis.caseConfidence}%</span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {imageAnalysis.caseCover}
                      </div>
                    </div>

                    {/* Shape / Size */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Form Factor</span>
                        <span className="font-bold text-purple-600">{imageAnalysis.shapeConfidence}%</span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {imageAnalysis.shape}
                      </div>
                    </div>

                    {/* Damage / Marks */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Wear / Marks</span>
                        <span className="font-bold text-slate-600">{imageAnalysis.damageConfidence}%</span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {imageAnalysis.visibleDamageMarks}
                      </div>
                    </div>

                  </div>

                  {/* MANDATORY DISCLAIMER */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{imageAnalysis.disclaimer || 'AI analysis is an estimate based on the uploaded image.'}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-colors"
                >
                  Next: Private Verification &rarr;
                </button>
              </div>

            </div>
          )}

          {/* STEP 4: Private Verification Key (Kept strictly private) */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-5 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Secure Item Ownership Verification</span>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  To prevent fraudulent claims, set a hidden question and answer that will <strong>NEVER</strong> be displayed publicly. When potential matches are found, the claiming student must correctly answer this question (max 3 attempts).
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Secret Verification Question
                  </label>
                  <input
                    type="text"
                    value={secretQuestion}
                    onChange={(e) => setSecretQuestion(e.target.value)}
                    placeholder="e.g. What specific wallpaper or hidden card is inside?"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setSecretQuestion('What sticker or scratch is on the back lid?')}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-slate-600"
                    >
                      "Sticker or scratch on back lid"
                    </button>
                    <button
                      type="button"
                      onClick={() => setSecretQuestion('What is the wallpaper image on the lockscreen?')}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-slate-600"
                    >
                      "Lockscreen wallpaper image"
                    </button>
                    <button
                      type="button"
                      onClick={() => setSecretQuestion('What unique keychain or charm is attached?')}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-slate-600"
                    >
                      "Unique keychain or charm"
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Secret Answer (Private to you)
                  </label>
                  <input
                    type="text"
                    value={secretAnswer}
                    onChange={(e) => setSecretAnswer(e.target.value)}
                    placeholder="e.g. Marvel Iron Man sticker, Black cat wallpaper"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    This answer is never shared with anyone. Used strictly to verify legitimate ownership.
                  </p>
                </div>
              </div>

              {/* Summary recap before submit */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-900">Submission Summary:</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="font-semibold">Type:</span> {type}</div>
                  <div><span className="font-semibold">Category:</span> {category}</div>
                  <div><span className="font-semibold">Brand / Model:</span> {brand || "Don't know"} {model || ''}</div>
                  <div><span className="font-semibold">Colour:</span> {colour || "Don't know"}</div>
                  <div><span className="font-semibold">Location:</span> {location || 'Campus'}</div>
                  <div><span className="font-semibold">Image:</span> {imagePreview ? 'Photo attached' : 'No photo'}</div>
                </div>
              </div>

              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className={`px-8 py-3 text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 ${
                    type === 'LOST'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Submitting & Running AI Matching...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit {type === 'LOST' ? 'Lost Report' : 'Found Report'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
