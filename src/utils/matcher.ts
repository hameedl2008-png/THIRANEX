import { ItemReport, MatchResult, MatchFactorBreakdown } from '../types/index.ts';

function normalize(str?: string): string {
  return (str || '').toLowerCase().trim();
}

function stringSimilarity(a?: string, b?: string): number {
  const normA = normalize(a);
  const normB = normalize(b);
  if (!normA || !normB) return 0;
  if (normA === "don't know" || normB === "don't know" || normA === "unknown" || normB === "unknown") return 0.3; // neutral
  if (normA === normB) return 1.0;
  if (normA.includes(normB) || normB.includes(normA)) return 0.85;

  // Word token overlap
  const wordsA = new Set(normA.split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set(normB.split(/\s+/).filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let common = 0;
  wordsA.forEach(w => {
    if (wordsB.has(w)) common++;
  });

  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? common / union : 0;
}

export function calculateMatch(lost: ItemReport, found: ItemReport): MatchResult {
  // If categories are strictly different, no match
  const catA = normalize(lost.category);
  const catB = normalize(found.category);

  const isSameCategory = catA === catB || 
    (catA.includes('phone') && catB.includes('phone')) ||
    (catA.includes('earbud') && catB.includes('earbud'));

  if (!isSameCategory) {
    return {
      lostReport: lost,
      foundReport: found,
      matchScore: 0,
      matchLevel: 'Low Match',
      hasMajorConflict: true,
      conflictReason: `Category mismatch (${lost.category} vs ${found.category})`,
      matchReasons: [],
      factors: [],
      canRequestContact: false,
    };
  }

  // Conflict Detection
  let hasMajorConflict = false;
  let conflictReason = '';

  const brandA = normalize(lost.brand);
  const brandB = normalize(found.brand);
  const isBrandMismatch = brandA && brandB && 
    brandA !== "don't know" && brandB !== "don't know" &&
    brandA !== brandB && !brandA.includes(brandB) && !brandB.includes(brandA);

  const modelA = normalize(lost.model);
  const modelB = normalize(found.model);
  const isModelMismatch = modelA && modelB &&
    modelA !== "don't know" && modelB !== "don't know" &&
    modelA !== modelB && !modelA.includes(modelB) && !modelB.includes(modelA);

  const colourA = normalize(lost.colour);
  const colourB = normalize(found.colour);
  const isColourMismatch = colourA && colourB &&
    colourA !== "don't know" && colourB !== "don't know" &&
    colourA !== colourB && !colourA.includes(colourB) && !colourB.includes(colourA);

  if (isBrandMismatch && (isModelMismatch || isColourMismatch)) {
    hasMajorConflict = true;
    conflictReason = `Major conflict: Brand (${lost.brand} vs ${found.brand}) and ${isModelMismatch ? 'model' : 'colour'} conflict`;
  } else if (brandA && brandB && isBrandMismatch && !brandA.includes('other') && !brandB.includes('other')) {
    // Distinct known brands conflicting (e.g. Apple vs Samsung)
    const topBrands = ['apple', 'samsung', 'oneplus', 'xiaomi', 'realme', 'dell', 'hp', 'lenovo', 'asus', 'boat', 'sony'];
    if (topBrands.includes(brandA) && topBrands.includes(brandB) && brandA !== brandB) {
      hasMajorConflict = true;
      conflictReason = `Incompatible brands: ${lost.brand} vs ${found.brand}`;
    }
  }

  const factors: MatchFactorBreakdown[] = [];
  const matchReasons: string[] = [];

  // 1. Category — 10%
  const catScore = isSameCategory ? 1.0 : 0;
  factors.push({
    name: 'Category',
    weight: 10,
    score: catScore * 10,
    matched: catScore >= 0.8,
    reason: isSameCategory ? `Same category (${lost.category})` : 'Different category',
  });
  if (catScore >= 0.8) matchReasons.push('Same category');

  // 2. Brand — 10%
  const brandSim = stringSimilarity(lost.brand, found.brand);
  const brandScore = isBrandMismatch ? 0 : brandSim;
  factors.push({
    name: 'Brand',
    weight: 10,
    score: brandScore * 10,
    matched: brandScore >= 0.7,
    reason: brandScore >= 0.7 ? `Compatible brand (${lost.brand || found.brand})` : 'Brand details differ or unknown',
  });
  if (brandScore >= 0.7) matchReasons.push(`Same brand (${lost.brand})`);

  // 3. Model — 15%
  const modelSim = stringSimilarity(lost.model, found.model);
  const modelScore = isModelMismatch ? 0 : modelSim;
  factors.push({
    name: 'Model',
    weight: 15,
    score: modelScore * 15,
    matched: modelScore >= 0.7,
    reason: modelScore >= 0.7 ? `Matching model (${lost.model || found.model})` : 'Model differs or not specified',
  });
  if (modelScore >= 0.7) matchReasons.push(`Same model (${lost.model})`);

  // 4. Colour — 8%
  const colourSim = stringSimilarity(lost.colour, found.colour);
  const colourScore = isColourMismatch ? 0 : colourSim;
  factors.push({
    name: 'Colour',
    weight: 8,
    score: colourScore * 8,
    matched: colourScore >= 0.7,
    reason: colourScore >= 0.7 ? `Compatible colour (${lost.colour || found.colour})` : 'Colour differs or unconfirmed',
  });
  if (colourScore >= 0.7) matchReasons.push(`Similar colour (${lost.colour})`);

  // 5. Physical Characteristics — 12%
  const physSim = Math.max(
    stringSimilarity(lost.physicalCharacteristics, found.physicalCharacteristics),
    stringSimilarity(lost.specialMarks, found.specialMarks),
    stringSimilarity(lost.rawDescription, found.rawDescription)
  );
  const physScore = physSim > 0.2 ? Math.min(1.0, physSim + 0.2) : 0.3; // baseline compatibility if not contradictory
  factors.push({
    name: 'Physical Characteristics',
    weight: 12,
    score: physScore * 12,
    matched: physScore >= 0.6,
    reason: physScore >= 0.6 ? 'Matching physical markings / condition' : 'Standard condition reported',
  });
  if (physScore >= 0.6) matchReasons.push('Matching physical appearance & markings');

  // 6. Accessories & Case — 8%
  const accSim = Math.max(
    stringSimilarity(lost.accessories, found.accessories),
    stringSimilarity(lost.caseColour, found.caseColour),
    stringSimilarity(lost.caseDesign, found.caseDesign)
  );
  const accScore = accSim > 0.3 ? accSim : (lost.accessories || found.accessories ? 0.3 : 0.5);
  factors.push({
    name: 'Accessories & Case',
    weight: 8,
    score: accScore * 8,
    matched: accScore >= 0.6,
    reason: accScore >= 0.6 ? 'Compatible case or accessories' : 'Accessories neutral / not specified',
  });
  if (accScore >= 0.6) matchReasons.push('Compatible accessories / case');

  // 7. Image Similarity — 15%
  let imageScore = 0.5; // neutral baseline if no image
  if (lost.imageAnalysis && found.imageAnalysis) {
    const objMatch = lost.imageAnalysis.objectType.toLowerCase() === found.imageAnalysis.objectType.toLowerCase() ? 1 : 0.3;
    const colMatch = stringSimilarity(lost.imageAnalysis.colour, found.imageAnalysis.colour);
    imageScore = (objMatch * 0.6) + (colMatch * 0.4);
    if (imageScore >= 0.7) matchReasons.push('Similar visual AI image characteristics');
  } else if (lost.imageUrl || found.imageUrl) {
    imageScore = 0.65;
  }
  factors.push({
    name: 'Image Similarity',
    weight: 15,
    score: imageScore * 15,
    matched: imageScore >= 0.65,
    reason: imageScore >= 0.65 ? 'Visual AI features align' : 'Visual attributes estimated',
  });

  // 8. Location — 10%
  const locSim = stringSimilarity(lost.location, found.location);
  const locScore = locSim > 0.3 ? Math.min(1.0, locSim + 0.3) : 0.2;
  factors.push({
    name: 'Location',
    weight: 10,
    score: locScore * 10,
    matched: locScore >= 0.6,
    reason: locScore >= 0.6 ? `Nearby campus area (${lost.location} ~ ${found.location})` : 'Different campus zones',
  });
  if (locScore >= 0.6) matchReasons.push(`Similar location (${lost.location})`);

  // 9. Time — 7%
  let timeScore = 0.6; // baseline campus timeframe
  if (lost.approximateTime && found.approximateTime) {
    const dateA = new Date(lost.approximateTime).getTime();
    const dateB = new Date(found.approximateTime).getTime();
    if (!isNaN(dateA) && !isNaN(dateB)) {
      const diffHours = Math.abs(dateA - dateB) / (1000 * 60 * 60);
      if (diffHours <= 24) timeScore = 1.0;
      else if (diffHours <= 72) timeScore = 0.8;
      else if (diffHours <= 168) timeScore = 0.5;
      else timeScore = 0.2;
    }
  }
  factors.push({
    name: 'Time',
    weight: 7,
    score: timeScore * 7,
    matched: timeScore >= 0.7,
    reason: timeScore >= 0.7 ? 'Timeline matches within plausible campus window' : 'Timeframe difference noted',
  });
  if (timeScore >= 0.7) matchReasons.push('Close timeframe');

  // 10. Lock Type — 5%
  let lockScore = 0.5;
  if (lost.lockType && found.lockType) {
    const lockA = normalize(lost.lockType);
    const lockB = normalize(found.lockType);
    if (lockA !== "don't know" && lockB !== "don't know") {
      lockScore = lockA === lockB ? 1.0 : 0.1;
      if (lockA === lockB) matchReasons.push(`Matching lock type (${lost.lockType})`);
    }
  }
  factors.push({
    name: 'Lock Type',
    weight: 5,
    score: lockScore * 5,
    matched: lockScore >= 0.8,
    reason: lockScore >= 0.8 ? `Matching lock mechanism (${lost.lockType})` : 'Lock type unverified or not applicable',
  });

  // Calculate sum of factor scores
  let totalScore = factors.reduce((sum, f) => sum + f.score, 0);

  // Requirement: Do not match items only because they have the same category.
  // There should be multiple compatible attributes before showing a high match.
  const matchedNonCategoryCount = factors.filter(f => f.name !== 'Category' && f.matched).length;
  if (matchedNonCategoryCount === 0) {
    totalScore = Math.min(totalScore, 25);
  } else if (matchedNonCategoryCount === 1) {
    totalScore = Math.min(totalScore, 48);
  }

  // If major conflict detected, penalize heavily
  if (hasMajorConflict) {
    totalScore = Math.min(totalScore, 35);
  }

  const roundedScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  let matchLevel: MatchResult['matchLevel'] = 'Low Match';
  if (roundedScore >= 90) matchLevel = 'Strong Match';
  else if (roundedScore >= 75) matchLevel = 'High Match';
  else if (roundedScore >= 60) matchLevel = 'Possible Match';
  else if (roundedScore >= 50) matchLevel = 'Potential Match';

  // Contact reveal rules:
  // - Match score is at least 50%
  // - Item category is compatible
  // - Meaningful matching attributes
  // - No major conflict
  // - Both profiles are valid (checked at request time)
  // - Mobile number exists
  const canRequestContact = 
    roundedScore >= 50 && 
    isSameCategory && 
    matchedNonCategoryCount >= 2 && 
    !hasMajorConflict;

  return {
    lostReport: lost,
    foundReport: found,
    matchScore: roundedScore,
    matchLevel,
    hasMajorConflict,
    conflictReason: hasMajorConflict ? conflictReason : undefined,
    matchReasons,
    factors,
    canRequestContact,
  };
}
