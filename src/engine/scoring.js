/**
 * Decision & Scoring Engine
 * Layer: src/engine/scoring.js
 * Pure JS: deterministic, unit-tested, no DOM / React dependencies.
 */

import defaultRules from '../data/rules.json';
import { APP_CONFIG } from '../config/app.config.js';
import { COPY } from '../copy/en.js';

/**
 * Clamp a number between min and max
 */
export function clamp(val, min = 0, max = 100) {
  if (Number.isNaN(val) || !Number.isFinite(val)) return min;
  return Math.min(Math.max(val, min), max);
}

/**
 * Format currency with configured symbol (defaults to APP_CONFIG or ₹)
 */
export function formatCurrency(amount, currency = APP_CONFIG?.currency?.symbol || '₹') {
  const num = Number(amount) || 0;
  return `${currency}${Math.round(num)}`;
}

/**
 * Normalize and detect safety hazards from input, fault, or flags
 */
export function analyzeSafety(fault, safetyChecks = {}, categoryId = '', explicitFlags = []) {
  const flags = new Set();
  let isHazardous = false;
  let severity = 'none';
  let warning = '';

  // 1. Explicit flags passed in input
  if (Array.isArray(explicitFlags)) {
    explicitFlags.forEach(f => {
      if (typeof f === 'string') flags.add(f.trim());
      else if (f?.id) flags.add(String(f.id).trim());
    });
  }

  // 2. Fault-level safety definition
  if (fault?.safetyFlag) {
    flags.add(String(fault.safetyFlag).trim());
    isHazardous = true;
    severity = fault.safetyRisk === 'critical' ? 'critical' : 'high';
    warning = fault.safetyWarning || 'Safety hazard detected. Special precautions required.';
  }

  if (Array.isArray(fault?.safetyFlags)) {
    fault.safetyFlags.forEach(f => flags.add(String(f).trim()));
  }

  // 3. User observed checks (backwards compatibility)
  if (safetyChecks.sparks) {
    flags.add('burning_smell');
    flags.add('USER_OBSERVED_SPARKS_OR_SMOKE');
    isHazardous = true;
    severity = 'critical';
    warning = 'Visible sparks, burning odor, or thermal charring observed. Stop using item immediately.';
  }

  if (safetyChecks.batteryBulge) {
    flags.add('swollen_battery');
    flags.add('SWOLLEN_LITHIUM_BATTERY');
    isHazardous = true;
    severity = 'critical';
    warning = 'Swollen lithium battery poses an acute thermal runaway and fire risk. Do not puncture or charge.';
  }

  if (safetyChecks.waterDamage && (categoryId === 'kitchen_appliance' || categoryId === 'small_appliances' || categoryId === 'consumer_electronics' || categoryId === 'phone_or_laptop')) {
    flags.add('water_ingress');
    flags.add('LIQUID_INTRUSION_MAINS_RISK');
    isHazardous = true;
    if (severity !== 'critical') severity = 'high';
    warning = warning || 'Liquid contact with internal circuitry can trigger short circuits or corrosion.';
  }

  // Check for critical safety flags
  const flagArray = Array.from(flags);
  const isCritical = flagArray.some(f => {
    const s = f.toLowerCase();
    return (
      s.includes('swollen') ||
      (s.includes('battery') && s.includes('bulge')) ||
      s.includes('burning') ||
      s.includes('sparks') ||
      s.includes('exposed_mains') ||
      s.includes('exposed mains') ||
      s.includes('frayed_cord')
    );
  });

  if (isCritical) {
    isHazardous = true;
    severity = 'critical';
    warning = warning || 'Critical safety hazard detected (thermal, chemical, or mains voltage).';
  } else if (flags.size > 0 && !isHazardous) {
    isHazardous = true;
    severity = 'moderate';
  }

  return {
    isHazardous,
    isCritical,
    severity,
    flags: flagArray,
    warning,
  };
}

/**
 * Calculate dynamic factor weights based on priorities.
 * Priorities shift weights:
 * - money -> cost
 * - waste -> environment + remainingLife
 * - effort -> effort
 * Safety weight is strictly LOCKED at 10.
 * Weights ALWAYS sum to exactly 100.
 */
export function calculateWeights(priorities = {}, rules = defaultRules) {
  const heuristics = rules?.heuristics || {};
  const defaults = heuristics.defaultWeights || {
    cost: 30,
    practicality: 20,
    remainingLife: 15,
    environment: 15,
    safety: 10,
    effort: 10,
  };

  const safetyWeight = heuristics.safetyWeightLocked ?? 10;
  const targetNonSafetySum = 100 - safetyWeight; // 90

  const pMoney = priorities?.money;
  const pWaste = priorities?.waste;
  const pEffort = priorities?.effort;

  const hasPriorities = pMoney !== undefined || pWaste !== undefined || pEffort !== undefined;

  if (!hasPriorities) {
    return {
      cost: defaults.cost,
      practicality: defaults.practicality,
      remainingLife: defaults.remainingLife,
      environment: defaults.environment,
      safety: safetyWeight,
      effort: defaults.effort,
    };
  }

  // Smooth linear multiplier: at 0 -> 0.2, at 50 -> 1.0, at 100 -> 1.8
  const getMultiplier = (val) => {
    if (val === undefined || val === null || Number.isNaN(Number(val))) return 1.0;
    const clamped = Math.min(Math.max(Number(val), 0), 100);
    return 0.2 + (clamped / 50) * 0.8;
  };

  const mMoney = getMultiplier(pMoney);
  const mWaste = getMultiplier(pWaste);
  const mEffort = getMultiplier(pEffort);

  // Apply shifts
  const rawCost = defaults.cost * mMoney;
  const rawPracticality = defaults.practicality;
  const rawRemainingLife = defaults.remainingLife * mWaste;
  const rawEnvironment = defaults.environment * mWaste;
  const rawEffort = defaults.effort * mEffort;

  const rawSum = rawCost + rawPracticality + rawRemainingLife + rawEnvironment + rawEffort;
  const scale = targetNonSafetySum / rawSum;

  // Scale and round to 2 decimals
  let cost = Math.round(rawCost * scale * 100) / 100;
  let practicality = Math.round(rawPracticality * scale * 100) / 100;
  let remainingLife = Math.round(rawRemainingLife * scale * 100) / 100;
  let environment = Math.round(rawEnvironment * scale * 100) / 100;
  let effort = Math.round(rawEffort * scale * 100) / 100;

  // Guarantee exact sum of 90 for non-safety so total is exactly 100
  const currentNonSafetySum = cost + practicality + remainingLife + environment + effort;
  const diff = Math.round((targetNonSafetySum - currentNonSafetySum) * 100) / 100;
  cost = Math.round((cost + diff) * 100) / 100;

  return {
    cost,
    practicality,
    remainingLife,
    environment,
    safety: safetyWeight, // LOCKED at 10
    effort,
  };
}

/**
 * Resolve category from ID, slug, or alias
 */
export function resolveCategory(catInput, rules = defaultRules) {
  if (!catInput) return rules?.categories?.[0];
  const query = String(catInput).toLowerCase().trim().replace(/[\s-]+/g, '_');

  const match = rules?.categories?.find(c => {
    if (c.id === catInput || c.id === query) return true;
    if (c.slug?.toLowerCase() === catInput.toLowerCase()) return true;
    if (c.name?.toLowerCase() === catInput.toLowerCase()) return true;
    if (c.aliases?.some(a => a.toLowerCase() === query || a.toLowerCase() === catInput.toLowerCase())) return true;
    return false;
  });

  return match || rules?.categories?.[0];
}

/**
 * Resolve fault from ID or category
 */
export function resolveFault(faultId, category, rules = defaultRules) {
  if (!faultId) return category?.commonFaults?.[0] || null;

  // Check direct lookup
  if (rules?.faults?.[faultId]) return rules.faults[faultId];

  // Check category faults
  const inCat = category?.commonFaults?.find(f => f.id === faultId || f.label === faultId || f.name === faultId);
  if (inCat) return inCat;

  // Search all categories
  for (const cat of rules?.categories || []) {
    const f = cat.commonFaults?.find(cf => cf.id === faultId || cf.label === faultId || cf.name === faultId);
    if (f) return f;
  }

  return null;
}

/**
 * Generate 2-3 plain language reasons for an option using en.js templates
 */
function generateReasons(optionId, ratings, input, normalized, category, fault, isGated) {
  const templates = COPY.reasons?.[optionId] || {};
  const reasons = [];

  const repairCost = Math.round(normalized.repairCost);
  const replaceCost = Math.round(normalized.replaceCost);
  const expectedLifespanYears = category?.expectedLifespanYears || 5;
  const remainingYears = Math.max(0, expectedLifespanYears - normalized.ageYears);
  const flagsStr = normalized.safetyFlags.join(', ') || 'hazard';

  if (optionId === 'repair') {
    if (isGated) {
      const t = templates.safetyGated || 'CRITICAL HAZARD DETECTED ({flags}): Do not attempt DIY repair. Consult a certified technician.';
      reasons.push(t.replace('{flags}', flagsStr));
    } else {
      if (ratings.cost >= 6) {
        const t = templates.costHigh || 'Repairing for ₹{repairCost} is highly economical compared to buying a replacement for ₹{replaceCost}.';
        reasons.push(t.replace('{repairCost}', repairCost).replace('{replaceCost}', replaceCost));
      } else {
        const t = templates.costLow || 'Repair cost of ₹{repairCost} is relatively steep compared to a ₹{replaceCost} replacement.';
        reasons.push(t.replace('{repairCost}', repairCost).replace('{replaceCost}', replaceCost));
      }

      if (ratings.practicality >= 7) {
        reasons.push(templates.practicalityHigh || 'Moderate fault severity and readily available spare parts make this repair practical.');
      } else if (ratings.practicality < 5) {
        reasons.push(templates.practicalityLow || 'High fault severity or hard-to-find components may complicate the repair.');
      }

      if (ratings.remainingLife >= 5) {
        const t = templates.remainingLifeHigh || 'With substantial remaining lifespan, restoring this item offers outstanding return on investment.';
        reasons.push(t.replace('{remainingYears}', remainingYears));
      } else {
        const t = templates.remainingLifeLow || 'The item is nearing the end of its expected lifespan, limiting remaining service duration.';
        reasons.push(t.replace('{expectedLifespanYears}', expectedLifespanYears));
      }
    }
  } else if (optionId === 'reuse') {
    if (isGated) {
      reasons.push('Direct reuse is restricted until critical safety conditions are inspected by a professional.');
    } else {
      reasons.push(templates.zeroCost || 'Reusing or passing the item along incurs ₹0 in parts or labor costs.');
      if (normalized.restCondition === 'good') {
        reasons.push(templates.conditionGood || 'Physical condition is well-preserved for continued secondary use or donation.');
      } else {
        reasons.push(templates.environment || 'Direct reuse keeps 100% of embodied resources intact with zero waste.');
      }
    }
  } else if (optionId === 'repurpose') {
    if (isGated) {
      reasons.push('Disassembly or DIY repurposing is restricted due to acute electrical or battery hazards.');
    } else {
      reasons.push(templates.creativeUtility || 'Upcycling breathes new life into components for practical household or workshop roles.');
      reasons.push(templates.materialsSaved || 'Transforms chassis and hardware instead of sending them to the scrap heap.');
    }
  } else if (optionId === 'replace') {
    if (normalized.repairCost / normalized.replaceCost > 0.6) {
      const t = templates.uneconomicalRepair || 'When repair costs (₹{repairCost}) approach replacement value (₹{replaceCost}), a new purchase is more sensible.';
      reasons.push(t.replace('{repairCost}', repairCost).replace('{replaceCost}', replaceCost));
    } else {
      reasons.push(templates.freshWarranty || 'Replacing resets product age to 0 years with updated technology and manufacturer warranty.');
    }
    reasons.push(templates.energyEfficiency || 'Modern replacement units offer superior energy efficiency and improved safety standards.');
  } else if (optionId === 'recycle') {
    reasons.push(templates.responsibleDisposal || 'Certified recycling reclaims critical copper, aluminium, and rare materials safely.');
    if (isGated) {
      reasons.push(templates.safeHazardHandling || 'Safely neutralizes potential electronic and chemical contaminants.');
    } else {
      reasons.push(templates.landfillDiversion || 'Keeps non-biodegradable waste out of municipal landfills.');
    }
  }

  // Ensure 2-3 reasons
  return reasons.slice(0, 3);
}

/**
 * Calculate Confidence level based on how many inputs were explicitly provided
 */
function calculateConfidence(input) {
  let providedCount = 0;

  if (input.category) providedCount++;
  if (input.ageYears !== undefined || input.itemAgeYears !== undefined) providedCount++;
  if (input.faultId) providedCount++;
  if (input.severity !== undefined) providedCount++;
  if (input.repairCost !== undefined || input.partsCostEstimate !== undefined) providedCount++;
  if (input.replaceCost !== undefined || input.originalPrice !== undefined) providedCount++;
  if (input.restCondition || input.itemCondition) providedCount++;
  if (input.diyDifficulty) providedCount++;
  if (input.problemText || input.customFault) providedCount++;
  if (Array.isArray(input.safetyFlags) && input.safetyFlags.length > 0) providedCount++;
  else if (input.safetyChecks && Object.values(input.safetyChecks).some(Boolean)) providedCount++;

  if (providedCount >= 7) return 'high';
  if (providedCount >= 4) return 'medium';
  return 'low';
}

/**
 * Master Decision & Scoring Function
 * Pure function: takes input, rules data, and configuration, returns full evaluated matrix.
 */
export function calculateDecision(input = {}, rules = defaultRules, config = APP_CONFIG) {
  // 1. Resolve Category
  const category = resolveCategory(input.category, rules);
  const expectedLifespan = Number(category?.expectedLifespanYears || 5);
  const defaultReplace = Number(category?.replaceCost?.default || 3500);

  // 2. Resolve Fault
  const fault = resolveFault(input.faultId, category, rules);

  // 3. Normalize Inputs with sensible defaults
  const ageYears = Math.max(0, Number(input.ageYears ?? input.itemAgeYears ?? 2));
  const replaceCost = Math.max(
    1,
    Number(input.replaceCost ?? input.originalPrice ?? input.overrides?.replacementCost ?? defaultReplace)
  );
  const defaultRepair = Number(fault?.repairCost?.default ?? fault?.partsCostEstimate ?? Math.round(replaceCost * 0.2));
  const repairCost = Math.max(
    0,
    Number(input.repairCost ?? input.overrides?.partsCostEstimate ?? defaultRepair)
  );

  // Severity 1-5
  let severity = 2;
  if (input.severity !== undefined && input.severity !== null) {
    if (typeof input.severity === 'number') severity = input.severity;
    else if (input.severity === 'mild') severity = 1;
    else if (input.severity === 'moderate') severity = 3;
    else if (input.severity === 'high') severity = 4;
    else if (input.severity === 'critical') severity = 5;
    else severity = Number(input.severity) || 2;
  } else if (fault?.severity) {
    severity = typeof fault.severity === 'number' ? fault.severity : 2;
  }
  severity = clamp(severity, 1, 5);

  // DIY difficulty: 'easy' | 'medium' | 'hard'
  let diyDifficulty = input.diyDifficulty || fault?.diyDifficulty || 'medium';
  if (typeof diyDifficulty === 'string') {
    diyDifficulty = diyDifficulty.toLowerCase();
    if (diyDifficulty === 'difficult') diyDifficulty = 'hard';
  } else {
    diyDifficulty = 'medium';
  }

  // Parts commonality
  const partsCommon = input.partsCommon ?? fault?.partsCommon ?? true;

  // Condition: 'good' | 'fair' | 'poor'
  let restCondition = input.restCondition || input.itemCondition || 'fair';
  if (restCondition === 'like_new') restCondition = 'good';
  if (restCondition === 'worn') restCondition = 'poor';

  // Safety Analysis
  const explicitFlags = Array.isArray(input.safetyFlags) ? input.safetyFlags : [];
  const safety = analyzeSafety(fault, input.safetyChecks || {}, category?.id, explicitFlags);
  const isGated = safety.isCritical;

  // 4. Calculate Factor Weights (Safety is LOCKED at 10, total is ALWAYS 100)
  const weights = calculateWeights(input.priorities, rules);

  // 5. Heuristic Calculations (Constants in rules.json)
  const heuristics = rules?.heuristics || {};

  // Remaining lifespan ratio [0, 1]
  const remaining = clamp(1 - (ageYears / expectedLifespan), 0, 1);

  // --- FACTOR RATINGS (0-10) per Option ---

  // Cost ratings
  const costRatio = replaceCost > 0 ? repairCost / replaceCost : 1;
  const costRatings = {
    repair: clamp(10 * (1 - costRatio), 0, 10),
    replace: clamp(8 * costRatio, 0, 10),
    repurpose: heuristics.cost?.repurpose ?? 6,
    reuse: heuristics.cost?.reuse ?? 7,
    recycle: heuristics.cost?.recycle ?? 3,
  };

  // Practicality ratings
  let repairPracticality = 10 - 1.5 * severity;
  if (diyDifficulty === 'hard') repairPracticality -= 1;
  if (partsCommon) repairPracticality += 1;
  repairPracticality = clamp(repairPracticality, 0, 10);

  const repurposeIdeasCount = category?.repurposeIdeas?.length || 0;
  const practicalityRatings = {
    repair: repairPracticality,
    replace: heuristics.practicality?.replace ?? 9,
    repurpose: repurposeIdeasCount > 0 ? (heuristics.practicality?.repurposeWithIdeas ?? 6) : 1,
    reuse: restCondition === 'good' ? 8 : restCondition === 'poor' ? 1 : 4,
    recycle: heuristics.practicality?.recycle ?? 8,
  };

  // Remaining Life ratings
  let repairLife = 10 * remaining;
  if (restCondition === 'good') repairLife += 1;
  repairLife = clamp(repairLife, 0, 10);

  const lifeRatings = {
    repair: repairLife,
    replace: clamp(10 * (1 - remaining), 0, 10),
    repurpose: heuristics.remainingLife?.repurpose ?? 5,
    reuse: clamp(6 * remaining, 0, 10),
    recycle: clamp(7 * (1 - remaining), 0, 10),
  };

  // Environment ratings
  const isElectronics = category?.isElectronics ?? true;
  const envRatings = {
    repair: heuristics.environment?.repair ?? 9,
    reuse: heuristics.environment?.reuse ?? 8,
    repurpose: heuristics.environment?.repurpose ?? 7,
    recycle: heuristics.environment?.recycle ?? 5,
    replace: isElectronics ? (heuristics.environment?.replaceElectronics ?? 1) : (heuristics.environment?.replaceDefault ?? 2),
  };

  // Safety ratings
  let safetyRatings = {
    repair: heuristics.safety?.repair ?? 9,
    reuse: heuristics.safety?.reuse ?? 8,
    repurpose: heuristics.safety?.repurpose ?? 7,
    replace: heuristics.safety?.replace ?? 9,
    recycle: heuristics.safety?.recycle ?? 8,
  };

  // CRITICAL FLAG GATES REPAIR, REUSE, REPURPOSE TO 0
  if (isGated) {
    safetyRatings.repair = 0;
    safetyRatings.reuse = 0;
    safetyRatings.repurpose = 0;
  }

  // Effort ratings
  let repairEffort = 5;
  if (diyDifficulty === 'easy') repairEffort = heuristics.effort?.repairByDifficulty?.easy ?? 7;
  else if (diyDifficulty === 'hard') repairEffort = heuristics.effort?.repairByDifficulty?.hard ?? 3;
  else repairEffort = heuristics.effort?.repairByDifficulty?.medium ?? 5;

  const effortRatings = {
    repair: repairEffort,
    replace: heuristics.effort?.replace ?? 8,
    repurpose: heuristics.effort?.repurpose ?? 4,
    reuse: heuristics.effort?.reuse ?? 7,
    recycle: heuristics.effort?.recycle ?? 9,
  };

  // 6. Build Option Objects with Score = Σ(weight × rating) on 0-100 scale
  const optionIds = ['repair', 'reuse', 'repurpose', 'replace', 'recycle'];

  const normalizedInput = {
    category: category?.id,
    ageYears,
    faultId: fault?.id,
    severity,
    problemText: input.problemText || input.customFault || '',
    repairCost,
    replaceCost,
    restCondition,
    diyDifficulty,
    partsCommon,
    safetyFlags: safety.flags,
    priorities: input.priorities || {},
  };

  const evaluatedOptions = optionIds.map(optId => {
    const fRatings = {
      cost: clamp(costRatings[optId], 0, 10),
      practicality: clamp(practicalityRatings[optId], 0, 10),
      remainingLife: clamp(lifeRatings[optId], 0, 10),
      environment: clamp(envRatings[optId], 0, 10),
      safety: clamp(safetyRatings[optId], 0, 10),
      effort: clamp(effortRatings[optId], 0, 10),
    };

    // Points per factor = (weight * rating) / 10
    // Total score = Σ points (0-100 scale)
    const factorBreakdown = {};
    let totalPoints = 0;

    for (const [factorKey, ratingVal] of Object.entries(fRatings)) {
      const w = weights[factorKey];
      const points = (w * ratingVal) / 10;
      totalPoints += points;
      factorBreakdown[factorKey] = {
        rating: Math.round(ratingVal * 100) / 100,
        weight: Math.round(w * 100) / 100,
        points: Math.round(points * 100) / 100,
      };
    }

    const finalScore = Math.round(totalPoints * 10) / 10;

    // Generate plain-language reasons
    const reasons = generateReasons(
      optId,
      fRatings,
      input,
      normalizedInput,
      category,
      fault,
      isGated
    );

    // Option metadata & copy
    const optCopy = COPY.verdict?.options?.[optId] || {};
    const optName = optCopy.name || (optId.charAt(0).toUpperCase() + optId.slice(1));

    // Approximate cost and metrics for UI backwards compatibility
    let costEst = 0;
    if (optId === 'repair') costEst = repairCost;
    else if (optId === 'replace') costEst = replaceCost;
    else if (optId === 'repurpose') costEst = Math.round(repairCost * 0.3);
    else costEst = 0;

    const carbonSavedKg = optId === 'repair' || optId === 'reuse'
      ? (category?.embodiedCo2Kg || 30)
      : optId === 'repurpose'
      ? Math.round((category?.embodiedCo2Kg || 30) * 0.8)
      : optId === 'recycle'
      ? Math.round((category?.embodiedCo2Kg || 30) * 0.35)
      : 0;

    const lifespanAddedYears = optId === 'repair'
      ? Math.max(1, Math.round(expectedLifespan * (remaining * 0.8 + 0.3)))
      : optId === 'replace'
      ? expectedLifespan
      : optId === 'reuse'
      ? Math.max(1, Math.round(expectedLifespan * remaining))
      : optId === 'repurpose'
      ? 3
      : 0;

    return {
      id: optId,
      name: optName,
      score: finalScore,
      rawScore: totalPoints,
      factors: factorBreakdown,
      reasons,
      verdictSummary: reasons[0] || optCopy.tagline || optName,
      pros: reasons,
      costEstimate: costEst,
      carbonSavedKg,
      lifespanAddedYears,
      timeEstimateMinutes: optId === 'repair' ? 45 : optId === 'repurpose' ? 60 : 15,
      scoreBreakdown: {
        financial: Math.round((factorBreakdown.cost.rating / 10) * 100),
        feasibility: Math.round((factorBreakdown.practicality.rating / 10) * 100),
        environmental: Math.round((factorBreakdown.environment.rating / 10) * 100),
        longevity: Math.round((factorBreakdown.remainingLife.rating / 10) * 100),
      },
    };
  });

  // Sort descending by score
  evaluatedOptions.sort((a, b) => b.score - a.score || b.rawScore - a.rawScore);

  const winner = evaluatedOptions[0];
  const confidence = calculateConfidence(input);

  // Economic analysis
  const netSavings = Math.max(0, replaceCost - repairCost);
  const repairToReplaceRatio = Number((repairCost / replaceCost).toFixed(2));

  return {
    timestamp: new Date().toISOString(),
    input: normalizedInput,
    category,
    item: {
      id: input.itemId || 'item',
      name: fault?.label ? `${category?.name || 'Item'} (${fault.label})` : category?.name || 'Evaluated Item',
      defaultNewPrice: replaceCost,
      embodiedCo2Kg: category?.embodiedCo2Kg || 30,
    },
    fault: fault || {
      id: input.faultId || 'custom_fault',
      name: input.problemText || input.customFault || 'Diagnosed issue',
      severity,
    },
    safety,
    weights,
    options: evaluatedOptions,
    winner,
    confidence,
    gated: isGated,
    gatedRecommendation: isGated
      ? 'A critical safety hazard was detected. We recommend a certified professional or safe e-waste disposal, never DIY.'
      : null,
    analytics: {
      replacementCost: replaceCost,
      bestRepairCost: repairCost,
      netSavings,
      repairToReplaceRatio,
      embodiedCo2Kg: category?.embodiedCo2Kg || 30,
      carbonSavedBestKg: winner.carbonSavedKg || 0,
      hoursNeededBest: (winner.timeEstimateMinutes / 60).toFixed(1),
    },
  };
}

/**
 * SIGNATURE FEATURE — Tipping Point:
 * Finds the smallest repairCost above the current one at which the top-ranked option changes,
 * and returns { currentWinner, newWinner, thresholdRupees }
 * (or null if it never changes within 3× replaceCost).
 * Also returns a one-line "What would change this verdict" sentence.
 */
export function tippingPoint(input = {}, rules = defaultRules, config = APP_CONFIG) {
  const baseResult = calculateDecision(input, rules, config);
  const currentWinner = baseResult.winner.id;
  const currentRepairCost = Number(input.repairCost ?? baseResult.winner.costEstimate ?? 0);
  const replaceCost = Number(input.replaceCost ?? baseResult.analytics?.replacementCost ?? 3500);

  const maxCost = Math.ceil(3 * replaceCost);
  const startCost = Math.floor(currentRepairCost) + 1;

  if (startCost > maxCost) {
    return null;
  }

  // Check if at maxCost the winner changes
  const atMax = calculateDecision({ ...input, repairCost: maxCost }, rules, config);
  if (atMax.winner.id === currentWinner) {
    return null;
  }

  // Binary search for the smallest integer repairCost above currentRepairCost where winner changes
  let low = startCost;
  let high = maxCost;
  let thresholdRupees = null;
  let newWinner = null;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const evalMid = calculateDecision({ ...input, repairCost: mid }, rules, config);
    if (evalMid.winner.id !== currentWinner) {
      thresholdRupees = mid;
      newWinner = evalMid.winner.id;
      // Search for potentially smaller threshold
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  if (thresholdRupees === null) {
    return null;
  }

  const formattedThreshold = `₹${thresholdRupees.toLocaleString('en-IN')}`;
  const sentence = `If repair cost exceeds ${formattedThreshold}, switching to ${newWinner} becomes the higher-ranked verdict.`;

  return {
    currentWinner,
    newWinner,
    thresholdRupees,
    sentence,
    explanation: sentence,
  };
}
