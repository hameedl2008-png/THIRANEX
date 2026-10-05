import { 
  ItemReport, 
  UserProfile, 
  ParsedNLResult, 
  ImageAnalysisData, 
  MatchResult,
  ReportType 
} from '../types/index.ts';

export async function fetchReports(filters?: {
  type?: ReportType;
  userId?: string;
  category?: string;
  status?: string;
  currentUserId?: string;
}): Promise<ItemReport[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.userId) params.append('userId', filters.userId);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.currentUserId) params.append('currentUserId', filters.currentUserId);

  const res = await fetch(`/api/reports?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchReportById(id: string, currentUserId?: string): Promise<ItemReport> {
  const params = currentUserId ? `?currentUserId=${encodeURIComponent(currentUserId)}` : '';
  const res = await fetch(`/api/reports/${id}${params}`);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

export async function createReport(reportData: Partial<ItemReport>): Promise<ItemReport> {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Your report could not be submitted. Please try again.');
  }
  return res.json();
}

export async function saveProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save profile');
  }
  return res.json();
}

export async function analyzeImage(imageBase64: string, mimeType?: string): Promise<ImageAnalysisData> {
  const res = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  if (!res.ok) {
    throw new Error('We could not analyze this image. Please try another image.');
  }
  return res.json();
}

export async function parseNaturalLanguage(
  text: string, 
  type?: ReportType, 
  currentCategory?: string
): Promise<ParsedNLResult> {
  const res = await fetch('/api/parse-nl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, type, currentCategory }),
  });
  if (!res.ok) {
    throw new Error('AI natural language interpretation failed');
  }
  return res.json();
}

export async function fetchMatches(reportId?: string, currentUserId?: string): Promise<MatchResult[]> {
  const params = new URLSearchParams();
  if (reportId) params.append('reportId', reportId);
  if (currentUserId) params.append('currentUserId', currentUserId);

  const res = await fetch(`/api/matches?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load matches');
  return res.json();
}

export async function requestContact(
  lostReportId: string, 
  foundReportId: string, 
  requestedByUserId: string
): Promise<{ success: boolean; message: string; lostContact: any; foundContact: any }> {
  const res = await fetch('/api/request-contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lostReportId, foundReportId, requestedByUserId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to request contact.');
  }
  return res.json();
}

export async function verifyItemSecret(
  reportId: string, 
  partnerReportId: string, 
  answer: string
): Promise<{ success: boolean; verified: boolean; attemptsLeft?: number; adminReviewRequired?: boolean; error?: string; message?: string }> {
  const res = await fetch('/api/verify-item', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId, partnerReportId, answer }),
  });
  const data = await res.json();
  if (!res.ok && !data.attemptsLeft && data.error && !data.adminReviewRequired) {
    throw new Error(data.error || 'Verification request failed');
  }
  return data;
}

export async function arrangeHandover(
  reportId: string, 
  partnerReportId: string, 
  location: string, 
  date: string, 
  time: string, 
  notes?: string,
  arrangedBy?: string
): Promise<{ success: boolean; handoverDetails: any }> {
  const res = await fetch('/api/handover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId, partnerReportId, location, date, time, notes, arrangedBy }),
  });
  if (!res.ok) throw new Error('Failed to coordinate handover');
  return res.json();
}

export async function confirmReturn(
  reportId: string, 
  partnerReportId?: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/confirm-returned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId, partnerReportId }),
  });
  if (!res.ok) throw new Error('Failed to confirm return');
  return res.json();
}

export async function searchWithAI(query: string): Promise<{ query: string; criteria?: any; reports: ItemReport[] }> {
  const res = await fetch('/api/ai-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}
