export type Department = 
  | 'AI&DS'
  | 'CSE'
  | 'AI&ML'
  | 'ECE'
  | 'Mechatronics'
  | 'Bio Tech'
  | 'Agri';

export type AcademicYear = 
  | '1st Year'
  | '2nd Year'
  | '3rd Year'
  | '4th Year';

export interface UserProfile {
  id: string;
  fullName: string;
  mobileNumber: string;
  studentId: string;
  department: Department;
  year: AcademicYear;
  email: string;
  createdAt: string;
}

export type ItemCategory = 
  | 'Phone'
  | 'Laptop'
  | 'Tablet'
  | 'Smart Watch'
  | 'Earbuds / Headphones'
  | 'Charger'
  | 'Power Bank'
  | 'Wallet'
  | 'Keys'
  | 'Bag'
  | 'Other Personal Item';

export type ReportType = 'LOST' | 'FOUND';

export type ReportStatus = 
  | 'LOST_REPORTED'
  | 'FOUND_REPORTED'
  | 'POSSIBLE_MATCH'
  | 'CONTACT_RELEASED'
  | 'VERIFIED'
  | 'HANDOVER_PENDING'
  | 'RETURNED'
  | 'DISPUTED'
  | 'ADMIN_REVIEW';

export interface ImageAnalysisData {
  objectType: string;
  objectConfidence: number;
  brand: string;
  brandConfidence: number;
  colour: string;
  colourConfidence: number;
  shape: string;
  shapeConfidence: number;
  sizeEstimation: string;
  visiblePhysicalCharacteristics: string;
  accessoriesDetected: string;
  accessoriesConfidence: number;
  caseCover: string;
  caseConfidence: number;
  visibleDamageMarks: string;
  damageConfidence: number;
  disclaimer: string;
}

export interface PrivateVerification {
  question: string;
  answer: string;
}

export interface HandoverDetails {
  location: string;
  date: string;
  time: string;
  notes?: string;
  arrangedBy?: string;
  completedAt?: string;
}

export interface ItemReport {
  id: string;
  caseId: string; // e.g. CFA-2026-4892
  type: ReportType;
  status: ReportStatus;
  userId: string;
  userProfile: {
    fullName: string;
    studentId: string;
    department: Department;
    year: AcademicYear;
    email: string;
    mobileNumber?: string; // Only populated when contact released
  };
  category: ItemCategory;
  brand: string;
  model: string;
  colour: string;
  caseColour?: string;
  caseDesign?: string;
  lockType?: string;
  accessories?: string;
  physicalCharacteristics?: string;
  specialMarks?: string;
  material?: string;
  contentsDescription?: string;
  location: string;
  approximateTime: string;
  rawDescription?: string;
  languageDetected?: string;
  imageUrl?: string;
  imageAnalysis?: ImageAnalysisData;
  privateVerification?: PrivateVerification;
  verificationAttempts: number;
  matchedReportId?: string;
  contactRequested?: boolean;
  contactReleased?: boolean;
  handoverDetails?: HandoverDetails;
  createdAt: string;
  updatedAt: string;
}

export interface MatchFactorBreakdown {
  name: string;
  weight: number;
  score: number;
  matched: boolean;
  reason: string;
}

export interface MatchResult {
  lostReport: ItemReport;
  foundReport: ItemReport;
  matchScore: number;
  matchLevel: 'Strong Match' | 'High Match' | 'Possible Match' | 'Potential Match' | 'Low Match';
  hasMajorConflict: boolean;
  conflictReason?: string;
  matchReasons: string[];
  factors: MatchFactorBreakdown[];
  canRequestContact: boolean;
}

export interface ParsedNLResult {
  category?: ItemCategory;
  brand?: string;
  model?: string;
  colour?: string;
  caseColour?: string;
  caseDesign?: string;
  lockType?: string;
  accessories?: string;
  physicalCharacteristics?: string;
  specialMarks?: string;
  material?: string;
  contentsDescription?: string;
  location?: string;
  approximateTime?: string;
  detectedLanguage?: 'English' | 'Tamil' | 'Tanglish' | 'Other';
  confidence: number;
  summary: string;
}
