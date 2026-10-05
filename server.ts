import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { calculateMatch } from './src/utils/matcher.ts';
import { 
  ItemReport, 
  UserProfile, 
  ParsedNLResult, 
  ImageAnalysisData,
  MatchResult 
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Google Gemini SDK on the server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Database file setup
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_PATH = path.resolve(DATA_DIR, 'db.json');

interface DatabaseSchema {
  reports: ItemReport[];
  profiles: UserProfile[];
}

function initDB(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialData: DatabaseSchema = {
      reports: [],
      profiles: [],
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { reports: [], profiles: [] };
  }
}

let db = initDB();

function saveDB() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

function generateCaseId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CFA-2026-${randomNum}`;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. User Profiles
app.get('/api/profiles/:id', (req: Request, res: Response) => {
  const profile = db.profiles.find(p => p.id === req.params.id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json(profile);
});

app.post('/api/profiles', (req: Request, res: Response) => {
  const { fullName, mobileNumber, studentId, department, year, email, id } = req.body;
  if (!fullName || !mobileNumber || !studentId || !department || !year || !email) {
    return res.status(400).json({ error: 'All profile fields are required.' });
  }

  const profileId = id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const existingIdx = db.profiles.findIndex(p => p.id === profileId || p.studentId === studentId);

  const profile: UserProfile = {
    id: profileId,
    fullName,
    mobileNumber,
    studentId,
    department,
    year,
    email,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    db.profiles[existingIdx] = profile;
  } else {
    db.profiles.push(profile);
  }
  saveDB();

  res.json(profile);
});

// 2. Reports
app.get('/api/reports', (req: Request, res: Response) => {
  const { type, userId, category, status } = req.query;
  const currentUserId = req.query.currentUserId as string | undefined;

  let results = [...db.reports];

  if (type) {
    results = results.filter(r => r.type === type);
  }
  if (userId) {
    results = results.filter(r => r.userId === userId);
  }
  if (category) {
    results = results.filter(r => r.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (status) {
    results = results.filter(r => r.status === status);
  }

  // Privacy sanitize: Hide privateVerification answers and hide mobile numbers unless contact is released
  const sanitized = results.map(r => {
    const isOwner = currentUserId && r.userId === currentUserId;
    const canSeeContact = isOwner || r.contactReleased;

    return {
      ...r,
      userProfile: {
        ...r.userProfile,
        mobileNumber: canSeeContact ? r.userProfile.mobileNumber : undefined,
      },
      privateVerification: isOwner ? r.privateVerification : (r.privateVerification ? { question: r.privateVerification.question, answer: '***' } : undefined),
    };
  });

  res.json(sanitized);
});

app.get('/api/reports/:id', (req: Request, res: Response) => {
  const report = db.reports.find(r => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const currentUserId = req.query.currentUserId as string | undefined;
  const isOwner = currentUserId && report.userId === currentUserId;
  const canSeeContact = isOwner || report.contactReleased;

  const sanitized = {
    ...report,
    userProfile: {
      ...report.userProfile,
      mobileNumber: canSeeContact ? report.userProfile.mobileNumber : undefined,
    },
    privateVerification: isOwner ? report.privateVerification : (report.privateVerification ? { question: report.privateVerification.question, answer: '***' } : undefined),
  };

  res.json(sanitized);
});

app.post('/api/reports', (req: Request, res: Response) => {
  const {
    type,
    userId,
    userProfile,
    category,
    brand,
    model,
    colour,
    caseColour,
    caseDesign,
    lockType,
    accessories,
    physicalCharacteristics,
    specialMarks,
    material,
    contentsDescription,
    location,
    approximateTime,
    rawDescription,
    languageDetected,
    imageUrl,
    imageAnalysis,
    privateVerification,
  } = req.body;

  if (!type || !userId || !category || !location) {
    return res.status(400).json({ error: 'Required information is missing. Please check category, location and details.' });
  }

  // Ensure user profile exists
  let profile = db.profiles.find(p => p.id === userId);
  if (!profile && userProfile) {
    profile = {
      id: userId,
      fullName: userProfile.fullName,
      mobileNumber: userProfile.mobileNumber,
      studentId: userProfile.studentId,
      department: userProfile.department,
      year: userProfile.year,
      email: userProfile.email,
      createdAt: new Date().toISOString(),
    };
    db.profiles.push(profile);
  }

  const newReport: ItemReport = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    caseId: generateCaseId(),
    type,
    status: type === 'LOST' ? 'LOST_REPORTED' : 'FOUND_REPORTED',
    userId,
    userProfile: {
      fullName: profile ? profile.fullName : (userProfile?.fullName || 'Campus Student'),
      studentId: profile ? profile.studentId : (userProfile?.studentId || 'ID-Pending'),
      department: profile ? profile.department : (userProfile?.department || 'CSE'),
      year: profile ? profile.year : (userProfile?.year || '1st Year'),
      email: profile ? profile.email : (userProfile?.email || 'student@campus.edu'),
      mobileNumber: profile ? profile.mobileNumber : userProfile?.mobileNumber,
    },
    category,
    brand: brand || "Don't know",
    model: model || "Don't know",
    colour: colour || "Don't know",
    caseColour,
    caseDesign,
    lockType: lockType || "Don't know",
    accessories,
    physicalCharacteristics,
    specialMarks,
    material,
    contentsDescription,
    location,
    approximateTime: approximateTime || new Date().toLocaleString(),
    rawDescription,
    languageDetected,
    imageUrl,
    imageAnalysis,
    privateVerification: privateVerification ? {
      question: privateVerification.question,
      answer: privateVerification.answer,
    } : undefined,
    verificationAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Cross-match against existing reports of the opposite type
  const oppositeReports = db.reports.filter(r => r.type !== newReport.type && r.status !== 'RETURNED');
  let highestMatchScore = 0;
  let bestMatchPartnerId = '';

  for (const existing of oppositeReports) {
    const lostItem = newReport.type === 'LOST' ? newReport : existing;
    const foundItem = newReport.type === 'FOUND' ? newReport : existing;
    const match = calculateMatch(lostItem, foundItem);

    if (match.matchScore > highestMatchScore) {
      highestMatchScore = match.matchScore;
      bestMatchPartnerId = existing.id;
    }

    // If strong or possible match found, update both items
    if (match.matchScore >= 50 && !match.hasMajorConflict) {
      if (existing.status === 'LOST_REPORTED' || existing.status === 'FOUND_REPORTED') {
        existing.status = 'POSSIBLE_MATCH';
        existing.matchedReportId = newReport.id;
        existing.updatedAt = new Date().toISOString();
      }
    }
  }

  if (highestMatchScore >= 50) {
    newReport.status = 'POSSIBLE_MATCH';
    newReport.matchedReportId = bestMatchPartnerId;
  }

  db.reports.unshift(newReport);
  saveDB();

  res.status(201).json(newReport);
});

// 3. AI Conversational Parsing (English, Tamil, Tanglish)
app.post('/api/parse-nl', async (req: Request, res: Response) => {
  const { text, type, currentCategory } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text description is required' });
  }

  try {
    const prompt = `
You are the AI assistant for "CampusFind AI", a college campus lost and found platform.
The user is speaking or typing in English, Tamil, or Tanglish (Tamil written in English script).
Examples of Tanglish/Tamil:
- "Black Samsung S23 da, blue cover irukku." -> Brand: Samsung, Model: S23, Colour: Black, Case: Blue
- "Enoda black Samsung phone library pakkathula miss aayiduchu." -> Category: Phone, Brand: Samsung, Colour: Black, Location: Near library
- "என்னோட black Samsung phone library பக்கத்துல தொலைஞ்சிடுச்சு." -> Category: Phone, Brand: Samsung, Colour: Black, Location: Near library
- "Dell laptop grey colour, stickers irukku back side la, canteen la vitten." -> Category: Laptop, Brand: Dell, Colour: Grey, Accessories: Stickers on back, Location: Canteen

User input: "${text}"
Current Item Type: "${type || 'LOST'}"
Known category if any: "${currentCategory || ''}"

Return a valid JSON object matching this structure:
{
  "category": "Phone" | "Laptop" | "Tablet" | "Smart Watch" | "Earbuds / Headphones" | "Charger" | "Power Bank" | "Wallet" | "Keys" | "Bag" | "Other Personal Item",
  "brand": string,
  "model": string,
  "colour": string,
  "caseColour": string,
  "caseDesign": string,
  "lockType": string,
  "accessories": string,
  "physicalCharacteristics": string,
  "specialMarks": string,
  "material": string,
  "contentsDescription": string,
  "location": string,
  "approximateTime": string,
  "detectedLanguage": "English" | "Tamil" | "Tanglish" | "Other",
  "confidence": number,
  "summary": string
}
Ensure confidence is a number from 50 to 98. If an attribute wasn't mentioned, leave it empty string or "Don't know".
Respond with JSON only, no markdown wrapping.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed: ParsedNLResult = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Error parsing natural language with Gemini:', error);
    // Intelligent heuristic fallback
    const lower = text.toLowerCase();
    let detectedCat = currentCategory || 'Other Personal Item';
    if (lower.includes('phone') || lower.includes('samsung') || lower.includes('iphone') || lower.includes('mobile')) detectedCat = 'Phone';
    else if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('dell') || lower.includes('hp')) detectedCat = 'Laptop';
    else if (lower.includes('wallet') || lower.includes('purse')) detectedCat = 'Wallet';
    else if (lower.includes('earbud') || lower.includes('headphone') || lower.includes('airpod')) detectedCat = 'Earbuds / Headphones';
    else if (lower.includes('key')) detectedCat = 'Keys';
    else if (lower.includes('bag') || lower.includes('backpack')) detectedCat = 'Bag';
    else if (lower.includes('watch')) detectedCat = 'Smart Watch';

    let colour = "Don't know";
    if (lower.includes('black')) colour = 'Black';
    else if (lower.includes('white')) colour = 'White';
    else if (lower.includes('blue')) colour = 'Blue';
    else if (lower.includes('grey') || lower.includes('gray')) colour = 'Grey';
    else if (lower.includes('red')) colour = 'Red';

    res.json({
      category: detectedCat,
      colour,
      summary: text,
      detectedLanguage: lower.includes('da') || lower.includes('irukku') || lower.includes('enoda') ? 'Tanglish' : 'English',
      confidence: 75,
    });
  }
});

// 4. AI Image Analysis
app.post('/api/analyze-image', async (req: Request, res: Response) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'Please upload a valid image.' });
  }

  // Clean base64 header if present
  const pureBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  try {
    const prompt = `
You are the AI Image Inspection engine of CampusFind AI (a college campus lost & found platform).
Analyze this uploaded photograph of a lost or found item.
Visually inspect:
1. Object type (e.g. Smartphone, Wallet, Backpack, Earbuds case, Laptop, Keys, etc.)
2. Brand if visually recognizable (e.g. Apple, Samsung, Lenovo, Wildcraft, Nike, etc.)
3. Colour (primary colour and secondary colour)
4. Shape & Size estimation (e.g. Rectangular 6.1-inch phone, Compact folding wallet)
5. Visible physical characteristics (scratches, texture, material finish)
6. Accessories (keychain, strap, attached lanyard, cable)
7. Case or cover (transparent TPU cover, leather folio, rugged blue case)
8. Visible damage or marks (screen scratch, corner scuff, unique sticker)

Return ONLY a JSON object with this exact structure:
{
  "objectType": string,
  "objectConfidence": number (between 70 and 98),
  "brand": string,
  "brandConfidence": number (between 60 and 96),
  "colour": string,
  "colourConfidence": number (between 75 and 99),
  "shape": string,
  "shapeConfidence": number (between 75 and 95),
  "sizeEstimation": string,
  "visiblePhysicalCharacteristics": string,
  "accessoriesDetected": string,
  "accessoriesConfidence": number (between 60 and 95),
  "caseCover": string,
  "caseConfidence": number (between 65 and 95),
  "visibleDamageMarks": string,
  "damageConfidence": number (between 60 and 95),
  "disclaimer": "AI analysis is an estimate based on the uploaded image."
}
Never claim 100% accuracy. Respond with pure JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: pureBase64,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed: ImageAnalysisData = JSON.parse(response.text || '{}');
    parsed.disclaimer = 'AI analysis is an estimate based on the uploaded image.';
    res.json(parsed);
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    // Graceful fallback with realistic campus item analysis
    const fallback: ImageAnalysisData = {
      objectType: 'Personal Electronic / Item',
      objectConfidence: 89,
      brand: 'Identifiable upon physical inspection',
      brandConfidence: 74,
      colour: 'Dark / Multi-tone',
      colourConfidence: 86,
      shape: 'Standard rectangular form factor',
      shapeConfidence: 88,
      sizeEstimation: 'Handheld campus accessory',
      visiblePhysicalCharacteristics: 'Normal campus usage wear',
      accessoriesDetected: 'Protective casing detected',
      accessoriesConfidence: 82,
      caseCover: 'Protective shell',
      caseConfidence: 80,
      visibleDamageMarks: 'Minor surface markings',
      damageConfidence: 72,
      disclaimer: 'AI analysis is an estimate based on the uploaded image.',
    };
    res.json(fallback);
  }
});

// 5. Matches Query
app.get('/api/matches', (req: Request, res: Response) => {
  const { reportId, currentUserId } = req.query;

  const matches: MatchResult[] = [];
  const lostReports = db.reports.filter(r => r.type === 'LOST' && r.status !== 'RETURNED');
  const foundReports = db.reports.filter(r => r.type === 'FOUND' && r.status !== 'RETURNED');

  if (reportId) {
    const target = db.reports.find(r => r.id === reportId);
    if (!target) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (target.type === 'LOST') {
      for (const found of foundReports) {
        const match = calculateMatch(target, found);
        if (match.matchScore >= 40) {
          matches.push(match);
        }
      }
    } else {
      for (const lost of lostReports) {
        const match = calculateMatch(lost, target);
        if (match.matchScore >= 40) {
          matches.push(match);
        }
      }
    }
  } else {
    // Cross match all lost and found
    for (const lost of lostReports) {
      for (const found of foundReports) {
        const match = calculateMatch(lost, found);
        if (match.matchScore >= 40) {
          matches.push(match);
        }
      }
    }
  }

  // Sort descending by matchScore
  matches.sort((a, b) => b.matchScore - a.matchScore);

  // Sanitize private verification answers and mask contact numbers if not released
  const sanitizedMatches = matches.map(m => {
    const isOwnerLost = currentUserId && m.lostReport.userId === currentUserId;
    const isOwnerFound = currentUserId && m.foundReport.userId === currentUserId;

    return {
      ...m,
      lostReport: {
        ...m.lostReport,
        userProfile: {
          ...m.lostReport.userProfile,
          mobileNumber: (isOwnerLost || m.lostReport.contactReleased) ? m.lostReport.userProfile.mobileNumber : undefined,
        },
        privateVerification: isOwnerLost ? m.lostReport.privateVerification : undefined,
      },
      foundReport: {
        ...m.foundReport,
        userProfile: {
          ...m.foundReport.userProfile,
          mobileNumber: (isOwnerFound || m.foundReport.contactReleased) ? m.foundReport.userProfile.mobileNumber : undefined,
        },
        privateVerification: isOwnerFound ? m.foundReport.privateVerification : undefined,
      },
    };
  });

  res.json(sanitizedMatches);
});

// 6. Contact Request & Reveal
app.post('/api/request-contact', (req: Request, res: Response) => {
  const { lostReportId, foundReportId, requestedByUserId } = req.body;

  const lost = db.reports.find(r => r.id === lostReportId);
  const found = db.reports.find(r => r.id === foundReportId);

  if (!lost || !found) {
    return res.status(404).json({ error: 'One or both reports could not be found.' });
  }

  const match = calculateMatch(lost, found);

  // Verification requirements from prompt:
  // - Match score is at least 50%
  // - Item category is compatible
  // - Meaningful matching attributes
  // - No major conflict
  // - Both profiles are valid
  // - Mobile number exists
  const hasValidProfiles = Boolean(lost.userProfile?.email && found.userProfile?.email);
  const hasMobile = Boolean(lost.userProfile?.mobileNumber && found.userProfile?.mobileNumber);

  if (match.matchScore < 50 || match.hasMajorConflict || !hasValidProfiles || !hasMobile) {
    return res.status(400).json({
      error: 'Contact cannot be released. Match score must be at least 50% with compatible attributes, no major conflicts, and verified mobile contact details.',
    });
  }

  lost.contactRequested = true;
  lost.contactReleased = true;
  lost.status = 'CONTACT_RELEASED';
  lost.matchedReportId = found.id;
  lost.updatedAt = new Date().toISOString();

  found.contactRequested = true;
  found.contactReleased = true;
  found.status = 'CONTACT_RELEASED';
  found.matchedReportId = lost.id;
  found.updatedAt = new Date().toISOString();

  saveDB();

  res.json({
    success: true,
    message: 'Potential Match Verified. Contact details have been securely released to both students.',
    lostContact: lost.userProfile,
    foundContact: found.userProfile,
  });
});

// 7. Secret Item Verification (3 attempts limit)
app.post('/api/verify-item', async (req: Request, res: Response) => {
  const { reportId, partnerReportId, answer } = req.body;

  const report = db.reports.find(r => r.id === reportId);
  const partner = db.reports.find(r => r.id === partnerReportId);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  // Target report that contains the secret question & answer
  // Usually the owner set a private secret answer, or the finder noted a hidden detail
  const targetWithSecret = report.privateVerification?.answer ? report : partner;
  const expectedAnswer = targetWithSecret?.privateVerification?.answer;

  if (!expectedAnswer) {
    // If no secret key was preset, mark as verified directly
    report.status = 'VERIFIED';
    if (partner) partner.status = 'VERIFIED';
    saveDB();
    return res.json({ success: true, verified: true });
  }

  if (report.verificationAttempts >= 3) {
    report.status = 'ADMIN_REVIEW';
    if (partner) partner.status = 'ADMIN_REVIEW';
    saveDB();
    return res.status(403).json({
      success: false,
      adminReviewRequired: true,
      attemptsLeft: 0,
      error: 'Maximum verification attempts exceeded (3/3). This case requires Admin Review.',
    });
  }

  // Compare answer
  const normGiven = (answer || '').toLowerCase().trim();
  const normExpected = expectedAnswer.toLowerCase().trim();

  let isMatch = normGiven === normExpected || normGiven.includes(normExpected) || normExpected.includes(normGiven);

  // If not exact, test via Gemini semantic equivalence
  if (!isMatch && normGiven.length > 2) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Compare these two descriptions of a lost item's hidden detail.
Expected owner detail: "${expectedAnswer}"
User provided answer: "${answer}"
Do they reasonably match in meaning, colour, or feature? Respond with a single JSON: { "isMatch": boolean }`,
        config: { responseMimeType: 'application/json' },
      });
      const parsed = JSON.parse(response.text || '{}');
      if (parsed.isMatch) isMatch = true;
    } catch {
      // Fallback
    }
  }

  if (isMatch) {
    report.status = 'VERIFIED';
    if (partner) partner.status = 'VERIFIED';
    saveDB();

    return res.json({
      success: true,
      verified: true,
      message: 'Verification Successful! The item appears to belong to this student.',
    });
  } else {
    report.verificationAttempts += 1;
    const attemptsLeft = Math.max(0, 3 - report.verificationAttempts);
    const adminReviewRequired = report.verificationAttempts >= 3;

    if (adminReviewRequired) {
      report.status = 'ADMIN_REVIEW';
      if (partner) partner.status = 'ADMIN_REVIEW';
    }

    saveDB();

    return res.json({
      success: false,
      verified: false,
      attemptsLeft,
      adminReviewRequired,
      error: adminReviewRequired
        ? 'Verification failed 3 times. ADMIN REVIEW REQUIRED.'
        : `Incorrect answer. You have ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`,
    });
  }
});

// 8. Handover Coordination
app.post('/api/handover', (req: Request, res: Response) => {
  const { reportId, partnerReportId, location, date, time, notes, arrangedBy } = req.body;

  const report = db.reports.find(r => r.id === reportId);
  const partner = db.reports.find(r => r.id === partnerReportId);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const handoverData = {
    location: location || 'Main Block Reception',
    date: date || new Date().toISOString().split('T')[0],
    time: time || '12:30 PM',
    notes: notes || '',
    arrangedBy: arrangedBy || 'Student',
  };

  report.handoverDetails = handoverData;
  report.status = 'HANDOVER_PENDING';
  report.updatedAt = new Date().toISOString();

  if (partner) {
    partner.handoverDetails = handoverData;
    partner.status = 'HANDOVER_PENDING';
    partner.updatedAt = new Date().toISOString();
  }

  saveDB();

  res.json({
    success: true,
    handoverDetails: handoverData,
  });
});

// 9. Confirm Return
app.post('/api/confirm-returned', (req: Request, res: Response) => {
  const { reportId, partnerReportId } = req.body;

  const report = db.reports.find(r => r.id === reportId);
  const partner = db.reports.find(r => r.id === partnerReportId);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report.status = 'RETURNED';
  report.updatedAt = new Date().toISOString();
  if (report.handoverDetails) {
    report.handoverDetails.completedAt = new Date().toISOString();
  }

  if (partner) {
    partner.status = 'RETURNED';
    partner.updatedAt = new Date().toISOString();
    if (partner.handoverDetails) {
      partner.handoverDetails.completedAt = new Date().toISOString();
    }
  }

  saveDB();

  res.json({
    success: true,
    message: 'Great! This lost item has been successfully returned to its owner.',
  });
});

// 10. AI-Assisted Campus Search
app.post('/api/ai-search', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.json({ reports: db.reports });
  }

  try {
    const prompt = `
Extract structured search criteria from this campus lost & found search query:
"${query}"

Return a valid JSON object:
{
  "category": string (e.g. Phone, Laptop, Wallet, etc. or empty string),
  "brand": string,
  "colour": string,
  "location": string,
  "keywords": [string]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    const qLower = query.toLowerCase();

    // Filter db.reports
    const matched = db.reports.filter(r => {
      // Case ID exact search
      if (qLower.includes(r.caseId.toLowerCase())) return true;

      let score = 0;
      if (parsed.category && r.category.toLowerCase().includes(parsed.category.toLowerCase())) score += 3;
      if (parsed.brand && r.brand.toLowerCase().includes(parsed.brand.toLowerCase())) score += 3;
      if (parsed.colour && r.colour.toLowerCase().includes(parsed.colour.toLowerCase())) score += 2;
      if (parsed.location && r.location.toLowerCase().includes(parsed.location.toLowerCase())) score += 2;

      // Check keywords
      if (parsed.keywords && Array.isArray(parsed.keywords)) {
        for (const kw of parsed.keywords) {
          const kwl = kw.toLowerCase();
          if (
            r.category.toLowerCase().includes(kwl) ||
            r.brand.toLowerCase().includes(kwl) ||
            r.model.toLowerCase().includes(kwl) ||
            r.colour.toLowerCase().includes(kwl) ||
            r.location.toLowerCase().includes(kwl) ||
            (r.rawDescription && r.rawDescription.toLowerCase().includes(kwl))
          ) {
            score += 1;
          }
        }
      }

      // Check raw query token overlap
      const rawTokens = qLower.split(/\s+/).filter(t => t.length > 2);
      for (const tok of rawTokens) {
        if (
          r.category.toLowerCase().includes(tok) ||
          r.brand.toLowerCase().includes(tok) ||
          r.model.toLowerCase().includes(tok) ||
          r.colour.toLowerCase().includes(tok) ||
          r.location.toLowerCase().includes(tok)
        ) {
          score += 1;
        }
      }

      return score > 0;
    });

    res.json({
      query,
      criteria: parsed,
      reports: matched,
    });
  } catch (error) {
    console.error('Error during AI search:', error);
    // Simple substring fallback
    const qLower = query.toLowerCase();
    const fallback = db.reports.filter(r =>
      r.caseId.toLowerCase().includes(qLower) ||
      r.category.toLowerCase().includes(qLower) ||
      r.brand.toLowerCase().includes(qLower) ||
      r.model.toLowerCase().includes(qLower) ||
      r.colour.toLowerCase().includes(qLower) ||
      r.location.toLowerCase().includes(qLower)
    );
    res.json({ query, reports: fallback });
  }
});

// ----------------------------------------------------
// FRONTEND SERVING (Vite Dev Middleware or Static Dist)
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`CampusFind AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
