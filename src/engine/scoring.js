/**
 * Core Decision & Scoring Engine
 * Layer: src/engine/scoring.js
 * Strictly PURE functions: no React, no DOM, deterministic, unit-tested.
 */

import { APP_CONFIG } from '../config/app.config.js';

/**
 * Clamp a number between min and max
 */
export function clamp(val, min = 0, max = 100) {
  if (Number.isNaN(val) || !Number.isFinite(val)) return min;
  return Math.min(Math.max(val, min), max);
}

/**
 * Format currency with configured symbol
 */
export function formatCurrency(amount, currency = APP_CONFIG.currency.symbol) {
  const num = Number(amount) || 0;
  return `${currency}${Math.round(num)}`;
}

/**
 * Detect safety risks from fault data or user-reported symptoms
 */
export function analyzeSafety(fault, safetyChecks = {}, categoryId = '') {
  const flags = [];
  let isHazardous = false;
  let warning = '';
  let severity = 'none';

  // Rule-based safety flags from fault definition
  if (fault?.safetyFlag) {
    flags.push(fault.safetyFlag);
    isHazardous = true;
    warning = fault.safetyWarning || 'Safety hazard detected. Special precautions required.';
    severity = fault.safetyRisk === 'critical' ? 'critical' : 'high';
  }

  // User observed flags
  if (safetyChecks.sparks) {
    flags.push('USER_OBSERVED_SPARKS_OR_SMOKE');
    isHazardous = true;
    severity = 'critical';
    warning = 'Visible sparks, burning odor, or thermal charring observed. Stop using item immediately.';
  }

  if (safetyChecks.batteryBulge) {
    flags.push('SWOLLEN_LITHIUM_BATTERY');
    isHazardous = true;
    severity = 'critical';
    warning = 'Swollen lithium pouch poses an acute thermal runaway and fire risk. Do not puncture, charge, or compress.';
  }

  if (safetyChecks.waterDamage && (categoryId === 'small_appliances' || categoryId === 'consumer_electronics')) {
    flags.push('LIQUID_INTRUSION_MAINS_RISK');
    isHazardous = true;
    if (severity !== 'critical') severity = 'high';
    warning = warning || 'Liquid contact with internal circuitry can trigger short circuits or corrosion.';
  }

  return {
    isHazardous,
    severity,
    flags,
    warning,
  };
}

/**
 * Evaluate Repair (DIY) Option
 */
export function evaluateRepairDiy(item, fault, input, safety, config = APP_CONFIG) {
  const replacementCost = Math.max(1, input.overrides?.replacementCost ?? input.originalPrice ?? item?.defaultNewPrice ?? 100);
  const partsCost = Math.max(0, input.overrides?.partsCostEstimate ?? fault?.partsCostEstimate ?? 15);
  const diyMinutes = Math.max(5, input.overrides?.diyTimeMinutes ?? fault?.diyTimeMinutes ?? 30);
  const userSkill = Number(input.overrides?.userSkillLevel ?? input.userSkill ?? 2);
  const hasTools = input.overrides?.hasTools ?? input.hasBasicTools ?? true;
  const timeAvailable = input.timeAvailable || 'afternoon';

  // 1. Financial Score (0 - 100)
  // Ratio of repair cost to replacement cost
  const totalDiyCost = partsCost + (hasTools ? 0 : 15); // $15 small tool tax if no basic tools
  const costRatio = totalDiyCost / replacementCost;
  let financialScore = 100;
  if (costRatio <= 0.20) {
    financialScore = 98 - (costRatio * 50);
  } else if (costRatio <= 0.50) {
    financialScore = 88 - ((costRatio - 0.20) * 110);
  } else if (costRatio <= 0.80) {
    financialScore = 55 - ((costRatio - 0.50) * 100);
  } else {
    financialScore = Math.max(10, 25 - ((costRatio - 0.80) * 50));
  }

  // 2. Feasibility Score (0 - 100)
  // Based on user skill vs fault difficulty, tools, and available time
  let skillMatch = 75;
  const diff = fault?.diyDifficulty || 'moderate';
  if (diff === 'easy') {
    skillMatch = userSkill >= 1 ? 95 : 85;
  } else if (diff === 'moderate') {
    skillMatch = userSkill >= 3 ? 95 : userSkill === 2 ? 80 : 50;
  } else if (diff === 'difficult') {
    skillMatch = userSkill >= 3 ? 80 : userSkill === 2 ? 45 : 20;
  }

  const toolBonus = hasTools ? 15 : -20;
  let timeFeasibility = 80;
  if (timeAvailable === 'quick' && diyMinutes > 30) {
    timeFeasibility = 45;
  } else if (timeAvailable === 'afternoon' && diyMinutes > 90) {
    timeFeasibility = 60;
  }

  const feasibilityScore = clamp((skillMatch * 0.5) + (timeFeasibility * 0.3) + toolBonus + 10);

  // 3. Environmental Score (0 - 100)
  const embodiedCo2 = item?.embodiedCo2Kg || 30;
  const carbonSaved = Math.round(embodiedCo2 * 0.90); // 90% of item carbon avoided
  const environmentalScore = clamp(70 + Math.min(28, carbonSaved * 0.4));

  // 4. Longevity Score (0 - 100)
  const expectedYears = Math.max(1, input.overrides?.expectedAddedYears ?? Math.round((item?.typicalLifespanYears || 5) * 0.6));
  const longevityScore = clamp(60 + (expectedYears * 8));

  // Safety Gate: heavy penalty if critical hazard and user is not maker level
  let safetyPenalty = 0;
  if (safety.isHazardous) {
    if (safety.severity === 'critical') {
      safetyPenalty = userSkill === 3 ? 35 : config.thresholds.criticalSafetyPenalty;
    } else {
      safetyPenalty = userSkill === 1 ? 40 : 20;
    }
  }

  const weightedScore = clamp(
    (financialScore * config.weights.financial) +
    (feasibilityScore * config.weights.feasibility) +
    (environmentalScore * config.weights.environmental) +
    (longevityScore * config.weights.longevity) -
    safetyPenalty
  );

  // Plain-English explanation
  let explanation = '';
  if (safetyPenalty >= 50) {
    explanation = `High DIY safety hazard (${safety.warning || 'hazard'}). Professional servicing or safe recycling is strongly advised over home DIY.`;
  } else if (costRatio <= 0.25 && feasibilityScore >= 70) {
    explanation = `High financial payoff. Parts cost is only ${formatCurrency(totalDiyCost)} vs ${formatCurrency(replacementCost)} to replace. Estimated ${diyMinutes} mins of work.`;
  } else if (costRatio <= 0.50) {
    explanation = `Economically sensible fix. You save ${formatCurrency(replacementCost - totalDiyCost)} while keeping ${carbonSaved} kg of CO₂e out of the atmosphere.`;
  } else if (costRatio > 0.70) {
    explanation = `Borderline economic return. Parts and tools (${formatCurrency(totalDiyCost)}) approach replacement cost (${formatCurrency(replacementCost)}). Consider repurposing or recycling.`;
  } else {
    explanation = `Viable DIY project with moderate effort. Extends useful life by an estimated ${expectedYears} years.`;
  }

  return {
    id: 'repair_diy',
    name: 'Repair (DIY)',
    score: Math.round(weightedScore),
    costEstimate: totalDiyCost,
    timeEstimateMinutes: diyMinutes,
    carbonSavedKg: carbonSaved,
    lifespanAddedYears: expectedYears,
    difficulty: diff,
    safetyPenaltyApplied: safetyPenalty > 0,
    verdictSummary: explanation,
    scoreBreakdown: {
      financial: Math.round(clamp(financialScore)),
      feasibility: Math.round(clamp(feasibilityScore - (safetyPenalty * 0.4))),
      environmental: Math.round(clamp(environmentalScore)),
      longevity: Math.round(clamp(longevityScore)),
    },
    pros: [
      `Saves approximately ${formatCurrency(Math.max(0, replacementCost - totalDiyCost))} compared to buying new`,
      `Prevents ${carbonSaved} kg CO₂e greenhouse gas emissions`,
      'Immediate turnaround without waiting on a repair shop queue',
    ],
    cons: [
      `Requires ${diyMinutes} minutes of your own time`,
      diff === 'difficult' ? 'Demands technical dexterity and patience' : 'Requires working with small parts or fasteners',
    ],
  };
}

/**
 * Evaluate Repair (Professional) Option
 */
export function evaluateRepairPro(item, fault, input, safety, config = APP_CONFIG) {
  const replacementCost = Math.max(1, input.overrides?.replacementCost ?? input.originalPrice ?? item?.defaultNewPrice ?? 100);
  const partsCost = Math.max(0, input.overrides?.partsCostEstimate ?? fault?.partsCostEstimate ?? 20);
  const laborHours = fault?.proLaborHours ?? 0.75;
  const proHourlyRate = Math.max(20, input.overrides?.proLaborHourly ?? config.baselines.proHourlyRateEstimate);
  const estimatedProCost = Math.round(partsCost + (laborHours * proHourlyRate));
  const costRatio = estimatedProCost / replacementCost;

  // 1. Financial Score (0 - 100)
  let financialScore = 80;
  if (costRatio <= 0.30) {
    financialScore = 90 - (costRatio * 40);
  } else if (costRatio <= 0.60) {
    financialScore = 78 - ((costRatio - 0.30) * 80);
  } else if (costRatio <= 0.90) {
    financialScore = 54 - ((costRatio - 0.60) * 90);
  } else {
    financialScore = Math.max(5, 25 - ((costRatio - 0.90) * 80));
  }

  // 2. Feasibility Score: very high because a certified tech does it
  let feasibilityScore = 90;
  if (fault?.severity === 'critical' && safety.isHazardous) {
    // Professional is the ONLY safe repair route
    feasibilityScore = 95;
  }
  if (costRatio > 0.85) {
    feasibilityScore -= 20; // Shop might decline or deem beyond economical repair
  }

  // 3. Environmental Score
  const embodiedCo2 = item?.embodiedCo2Kg || 30;
  const carbonSaved = Math.round(embodiedCo2 * 0.92);
  const environmentalScore = clamp(70 + Math.min(28, carbonSaved * 0.4));

  // 4. Longevity Score
  const expectedYears = Math.max(1, input.overrides?.expectedAddedYears ?? Math.round((item?.typicalLifespanYears || 5) * 0.7));
  const longevityScore = clamp(65 + (expectedYears * 8));

  const weightedScore = clamp(
    (financialScore * config.weights.financial) +
    (feasibilityScore * config.weights.feasibility) +
    (environmentalScore * config.weights.environmental) +
    (longevityScore * config.weights.longevity)
  );

  let explanation = '';
  if (costRatio <= 0.45) {
    explanation = `High professional value (${formatCurrency(estimatedProCost)} estimate). Certified repair saves ${formatCurrency(replacementCost - estimatedProCost)} with no personal labor needed.`;
  } else if (costRatio <= 0.70) {
    explanation = `Moderate viability. Bench cost (${formatCurrency(estimatedProCost)}) is ${Math.round(costRatio * 100)}% of replacement price. Worth doing if the item holds sentimental value or high build quality.`;
  } else {
    explanation = `Uneconomical bench repair. Shop estimate (${formatCurrency(estimatedProCost)}) approaches replacement price (${formatCurrency(replacementCost)}).`;
  }

  return {
    id: 'repair_pro',
    name: 'Repair (Professional)',
    score: Math.round(weightedScore),
    costEstimate: estimatedProCost,
    timeEstimateMinutes: 45, // User drop-off / pickup time
    carbonSavedKg: carbonSaved,
    lifespanAddedYears: expectedYears,
    verdictSummary: explanation,
    scoreBreakdown: {
      financial: Math.round(clamp(financialScore)),
      feasibility: Math.round(clamp(feasibilityScore)),
      environmental: Math.round(clamp(environmentalScore)),
      longevity: Math.round(clamp(longevityScore)),
    },
    pros: [
      'Zero personal tools or mechanical skill required',
      'Certified repair often includes 60-90 day parts and labor warranty',
      'Safest route for high-voltage and delicate micro-electronics',
    ],
    cons: [
      `Labor rate (${formatCurrency(proHourlyRate)}/hr) elevates cost vs DIY`,
      'Turnaround time typically 2 to 7 days depending on shop backlog',
    ],
  };
}

/**
 * Evaluate Reuse / Pass Along Option
 */
export function evaluateReuse(item, fault, input, safety, config = APP_CONFIG) {
  const replacementCost = Math.max(1, input.overrides?.replacementCost ?? input.originalPrice ?? item?.defaultNewPrice ?? 100);
  const severity = fault?.severity || input.severity || 'moderate';

  // If critical safety hazard, cannot safely pass along to someone else!
  if (safety.isHazardous && safety.severity === 'critical') {
    return {
      id: 'reuse',
      name: 'Reuse / Pass Along',
      score: 12,
      costEstimate: 0,
      timeEstimateMinutes: 5,
      carbonSavedKg: 0,
      lifespanAddedYears: 0,
      verdictSummary: `Unsafe for direct reuse. Item presents active hazard (${safety.warning || 'safety risk'}). Must be repaired first or decommissioned.`,
      scoreBreakdown: { financial: 10, feasibility: 15, environmental: 20, longevity: 5 },
      pros: ['Zero financial expense'],
      cons: ['Severe safety risk prevents re-homing without professional fix'],
    };
  }

  // Viability drops if fault is severe
  let viability = 65;
  if (severity === 'mild') viability = 88;
  if (severity === 'moderate') viability = 60;
  if (severity === 'high') viability = 30;

  const embodiedCo2 = item?.embodiedCo2Kg || 30;
  const carbonSaved = Math.round(embodiedCo2 * 0.85);

  const financialScore = 90; // $0 spent
  const feasibilityScore = viability;
  const environmentalScore = clamp(75 + (carbonSaved * 0.3));
  const longevityScore = severity === 'mild' ? 75 : 40;

  const weightedScore = clamp(
    (financialScore * config.weights.financial) +
    (feasibilityScore * config.weights.feasibility) +
    (environmentalScore * config.weights.environmental) +
    (longevityScore * config.weights.longevity)
  );

  let explanation = '';
  if (severity === 'mild') {
    explanation = `Outstanding low-friction option. The fault is cosmetic or minor. Item can be used as-is, donated to a maker space, or handed down.`;
  } else if (severity === 'moderate') {
    explanation = `Secondary use feasible. Usable for backup tasks (e.g. secondary monitor, garage kettle) or as a donor for someone with identical unit.`;
  } else {
    explanation = `Low viability as-is. Item requires repair before another person can safely utilize its core function.`;
  }

  return {
    id: 'reuse',
    name: 'Reuse / Pass Along',
    score: Math.round(weightedScore),
    costEstimate: 0,
    timeEstimateMinutes: 15,
    carbonSavedKg: carbonSaved,
    lifespanAddedYears: severity === 'mild' ? 3 : 1,
    verdictSummary: explanation,
    scoreBreakdown: {
      financial: Math.round(financialScore),
      feasibility: Math.round(feasibilityScore),
      environmental: Math.round(environmentalScore),
      longevity: Math.round(longevityScore),
    },
    pros: [
      '$0 out-of-pocket cost',
      'Instantly extends utility without shopping or parts delivery',
      'Donation to charity or tool library provides social value',
    ],
    cons: [
      severity === 'mild' ? 'Requires living with minor cosmetic or secondary defect' : 'May not satisfy full original use requirements',
    ],
  };
}

/**
 * Evaluate Repurpose / Upcycle Option
 */
export function evaluateRepurpose(item, fault, input, safety, upcycleCatalog = [], config = APP_CONFIG) {
  const categoryId = input.category || 'small_appliances';
  const categoryIdeas = upcycleCatalog[categoryId] || [];
  const primaryIdea = categoryIdeas[0] || {
    title: 'Upcycle Materials into Workshop Organizers',
    description: 'Disassemble housing and repurpose raw chassis, fasteners, or motors for DIY garage projects.',
    difficulty: 'Easy',
    timeMinutes: 30,
  };

  // Upcycling is especially high-scoring when repair is uneconomical but materials are sturdy
  let upcycleViability = 68;
  if (input.category === 'furniture_home' || input.category === 'apparel_footwear') {
    upcycleViability = 82; // Wood and textiles are prime upcycling materials
  } else if (input.category === 'consumer_electronics') {
    upcycleViability = 74; // Old phones/tablets make great smart home screens
  }

  const embodiedCo2 = item?.embodiedCo2Kg || 30;
  const carbonSaved = Math.round(embodiedCo2 * 0.70); // 70% material diverted

  const financialScore = 85; // $5-15 in crafts/hardware
  const feasibilityScore = clamp(upcycleViability);
  const environmentalScore = clamp(70 + (carbonSaved * 0.35));
  const longevityScore = 70; // creates a new object lasting 3-5+ years

  const weightedScore = clamp(
    (financialScore * config.weights.financial) +
    (feasibilityScore * config.weights.feasibility) +
    (environmentalScore * config.weights.environmental) +
    (longevityScore * config.weights.longevity)
  );

  return {
    id: 'repurpose',
    name: 'Repurpose / Upcycle',
    score: Math.round(weightedScore),
    costEstimate: 10, // Small crafting supplies
    timeEstimateMinutes: primaryIdea.timeMinutes || 35,
    carbonSavedKg: carbonSaved,
    lifespanAddedYears: 4,
    featuredIdea: primaryIdea,
    ideas: categoryIdeas,
    verdictSummary: `Transform into "${primaryIdea.title}". Gives durable materials a productive second life while saving ${carbonSaved} kg of CO₂e.`,
    scoreBreakdown: {
      financial: Math.round(financialScore),
      feasibility: Math.round(feasibilityScore),
      environmental: Math.round(environmentalScore),
      longevity: Math.round(longevityScore),
    },
    pros: [
      'Gives durable materials a creative second life',
      `Prevents ${carbonSaved} kg CO₂e from ending in landfill`,
      'High creative satisfaction and unique bespoke outcome',
    ],
    cons: [
      `Original function (${item?.name || 'item'}) is transformed into a different utility`,
      `Requires ${primaryIdea.timeMinutes || 35} minutes of hands-on crafting`,
    ],
  };
}

/**
 * Evaluate Replace (Buy New) Option
 * We evaluate Replace fairly and honestly:
 * - When an item is old, hazardous, and repair exceeds replacement cost, Replace wins!
 * - When repair is trivial and cheap, Replace gets a realistic lower score (highlighting wasteful consumption).
 */
export function evaluateReplace(item, fault, input, safety, config = APP_CONFIG) {
  const replacementCost = Math.max(1, input.overrides?.replacementCost ?? input.originalPrice ?? item?.defaultNewPrice ?? 100);
  const partsCost = Math.max(0, input.overrides?.partsCostEstimate ?? fault?.partsCostEstimate ?? 20);
  const costRatio = partsCost / replacementCost;
  const itemAge = Number(input.itemAgeYears || 2);
  const expectedTotalLife = item?.typicalLifespanYears || 5;
  const ageRatio = itemAge / expectedTotalLife;

  // Financial Score: Buying brand new is the most expensive route
  let financialScore = 30;
  if (costRatio >= 0.70 || ageRatio >= 1.2) {
    // If repair is expensive and item is ancient, buying new is more justifiable
    financialScore = 65;
  } else if (costRatio <= 0.15) {
    // Replacement is terrible financial value when a $5 fix restores it
    financialScore = 15;
  }

  // Feasibility Score: Extremely easy to order online / buy in store
  const feasibilityScore = 95;

  // Environmental Score: Producing a brand-new item incurs 100% new embodied carbon!
  const embodiedCo2 = item?.embodiedCo2Kg || 35;
  let environmentalScore = Math.max(5, 45 - (embodiedCo2 * 0.35));

  // Longevity Score: New item comes with fresh factory lifespan and warranty
  const longevityScore = 92;

  // If safety risk is critical and cannot be repaired, Replace gets a boost
  let safetyBoost = 0;
  if (safety.isHazardous && safety.severity === 'critical' && fault?.safetyRisk === 'critical') {
    safetyBoost = 25;
  }

  const weightedScore = clamp(
    (financialScore * config.weights.financial) +
    (feasibilityScore * config.weights.feasibility) +
    (environmentalScore * config.weights.environmental) +
    (longevityScore * config.weights.longevity) +
    safetyBoost
  );

  let explanation = '';
  if (safetyBoost > 0) {
    explanation = `Justified upgrade. Due to critical safety degradation (${safety.warning || 'hazard'}), a modern replacement with fresh safety compliance is warranted.`;
  } else if (costRatio <= 0.25) {
    explanation = `High environmental & financial cost. Buying new costs ${formatCurrency(replacementCost)} and generates ${embodiedCo2} kg fresh CO₂e when a simple fix solves the problem.`;
  } else if (costRatio >= 0.75) {
    explanation = `Viable option. Repair estimate is close to a new item. Buying new grants a fresh warranty and modern efficiency.`;
  } else {
    explanation = `Convenient but costly. You spend ${formatCurrency(replacementCost)} and retire an item that still has usable lifespan left.`;
  }

  return {
    id: 'replace',
    name: 'Replace (Buy New)',
    score: Math.round(weightedScore),
    costEstimate: replacementCost,
    timeEstimateMinutes: 30, // shopping time
    carbonSavedKg: 0,
    newEmbodiedCarbonKg: embodiedCo2,
    lifespanAddedYears: expectedTotalLife,
    verdictSummary: explanation,
    scoreBreakdown: {
      financial: Math.round(financialScore),
      feasibility: Math.round(feasibilityScore),
      environmental: Math.round(clamp(environmentalScore)),
      longevity: Math.round(longevityScore),
    },
    pros: [
      'Brand-new unit with full manufacturer warranty (1-2 years)',
      'Zero diagnostic labor or repair uncertainty',
      'May feature improved energy efficiency or modern connectivity',
    ],
    cons: [
      `Highest cash expense: ${formatCurrency(replacementCost)} out of pocket`,
      `Generates ${embodiedCo2} kg CO₂e in new supply chain manufacturing footprint`,
      'Contributes to planetary resource depletion and packaging waste',
    ],
  };
}

/**
 * Evaluate Recycle / Discard Option
 */
export function evaluateRecycle(item, fault, input, safety, config = APP_CONFIG) {
  const severity = fault?.severity || input.severity || 'moderate';
  const itemAge = Number(input.itemAgeYears || 2);
  const expectedTotalLife = item?.typicalLifespanYears || 5;

  // Recycling is appropriate when an item has reached end-of-life or cannot be made safe
  let appropriateness = 45;
  if (itemAge >= expectedTotalLife) appropriateness += 20;
  if (safety.isHazardous) appropriateness += 25;
  if (severity === 'critical') appropriateness += 20;

  const embodiedCo2 = item?.embodiedCo2Kg || 30;
  const carbonRecycled = Math.round(embodiedCo2 * 0.35); // 35% materials recovered via metallurgical recycling

  const financialScore = 80; // $0 cost
  const feasibilityScore = 85; // Drop off at depot
  const environmentalScore = clamp(50 + (carbonRecycled * 0.5));
  const longevityScore = 10; // Item is retired

  const weightedScore = clamp(
    (financialScore * config.weights.financial) +
    (feasibilityScore * config.weights.feasibility) +
    (environmentalScore * config.weights.environmental) +
    (longevityScore * config.weights.longevity) +
    (appropriateness > 75 ? 15 : 0)
  );

  let explanation = '';
  if (safety.isHazardous && safety.severity === 'critical') {
    explanation = `Recommended decommissioning. Safe e-waste drop-off prevents toxic chemical or fire hazards while recovering copper, steel, and precious metals.`;
  } else if (itemAge >= expectedTotalLife && severity === 'high') {
    explanation = `Dignified end-of-life. Item has served its expected ${itemAge}-year lifespan; recycling reclaims raw materials.`;
  } else {
    explanation = `Premature retirement. While recycling prevents landfill dump, keeping the item in use via repair or reuse preserves 3x more embodied energy.`;
  }

  return {
    id: 'recycle',
    name: 'Recycle / E-Waste Discard',
    score: Math.round(weightedScore),
    costEstimate: 0,
    timeEstimateMinutes: 20,
    carbonSavedKg: carbonRecycled,
    lifespanAddedYears: 0,
    verdictSummary: explanation,
    scoreBreakdown: {
      financial: Math.round(financialScore),
      feasibility: Math.round(feasibilityScore),
      environmental: Math.round(environmentalScore),
      longevity: Math.round(longevityScore),
    },
    pros: [
      'Reclaims raw aluminum, copper, steel, and rare-earth elements',
      'Keeps heavy metals and microplastics out of municipal landfills',
      '$0 out-of-pocket disposal cost at certified civic drop-offs',
    ],
    cons: [
      'Destroys 65% of the embodied manufacturing energy already invested in the product',
      'Requires dropping off at specialized electronics / hazardous waste facility',
    ],
  };
}

/**
 * Master Decision Function
 * Pure function: takes input, rules data, and configuration, returns full evaluated matrix.
 */
export function calculateDecision(input, rules, config = APP_CONFIG) {
  // 1. Resolve category & item
  const category = rules?.categories?.find(c => c.id === input.category) || rules?.categories?.[0];
  let item = category?.items?.find(i => i.id === input.itemId);
  if (!item && input.customItemName) {
    // Custom item fallback
    item = {
      id: 'custom_item',
      name: input.customItemName,
      defaultNewPrice: input.originalPrice || 80,
      embodiedCo2Kg: category?.embodiedCo2Kg || 30,
      typicalLifespanYears: category?.averageLifespanYears || 6,
    };
  }

  // 2. Resolve fault
  let fault = rules?.faults?.[input.faultId];
  if (!fault && input.customFault) {
    // Synthesize reasonable parameters for custom fault
    fault = {
      id: 'custom_fault',
      name: input.customFault,
      severity: input.severity || 'moderate',
      diyDifficulty: input.severity === 'critical' ? 'difficult' : input.severity === 'high' ? 'moderate' : 'easy',
      diyTimeMinutes: input.severity === 'high' ? 60 : 30,
      proLaborHours: 0.75,
      partsCostEstimate: Math.round((input.originalPrice || 80) * 0.20),
      toolsRequired: ['Hand tools', 'Cleaning kit'],
      safetyRisk: input.severity === 'critical' ? 'high' : 'low',
      description: input.customFault,
      diySteps: [
        'Unplug and disconnect all power sources.',
        'Carefully open outer casing and inspect for loose connections or mechanical obstruction.',
        'Clean dust and debris with soft brush.',
        'Order replacement component from verified supplier.',
      ],
      proCostEstimate: Math.round((input.originalPrice || 80) * 0.45),
    };
  }

  // 3. Safety Analysis
  const safety = analyzeSafety(fault, input.safetyChecks, category?.id);

  // 4. Evaluate all 5 options
  const optDiy = evaluateRepairDiy(item, fault, input, safety, config);
  const optPro = evaluateRepairPro(item, fault, input, safety, config);
  const optReuse = evaluateReuse(item, fault, input, safety, config);
  const optRepurpose = evaluateRepurpose(item, fault, input, safety, rules?.upcycleIdeas, config);
  const optReplace = evaluateReplace(item, fault, input, safety, config);
  const optRecycle = evaluateRecycle(item, fault, input, safety, config);

  const allOptions = [optDiy, optPro, optReuse, optRepurpose, optReplace, optRecycle];

  // Sort options by score descending
  allOptions.sort((a, b) => b.score - a.score);

  // Top winner
  const winner = allOptions[0];

  // Economic analysis
  const replacementCost = Math.max(1, input.overrides?.replacementCost ?? input.originalPrice ?? item?.defaultNewPrice ?? 100);
  const bestRepairCost = Math.min(optDiy.costEstimate, optPro.costEstimate);
  const netSavings = Math.max(0, replacementCost - bestRepairCost);
  const repairToReplaceRatio = Number((bestRepairCost / replacementCost).toFixed(2));

  return {
    timestamp: new Date().toISOString(),
    input,
    item,
    category,
    fault,
    safety,
    options: allOptions,
    winner,
    analytics: {
      replacementCost,
      bestRepairCost,
      netSavings,
      repairToReplaceRatio,
      embodiedCo2Kg: item?.embodiedCo2Kg || 30,
      carbonSavedBestKg: winner.carbonSavedKg || 0,
      hoursNeededBest: (winner.timeEstimateMinutes / 60).toFixed(1),
    },
  };
}
