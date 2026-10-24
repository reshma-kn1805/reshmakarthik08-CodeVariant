/**
 * User-Facing Copy Dictionary (en)
 * Layer: src/copy/en.js
 * Rule: ALL user-facing text lives here. No inline hardcoded strings in UI.
 */

export const COPY = {
  common: {
    appName: 'Fix It First',
    tagline: 'Decide with clarity: Repair, Reuse, Repurpose, or Replace.',
    estimateBadge: 'Estimate',
    estimateDisclaimer: 'Costs, lifespans, and carbon figures are illustrative estimates. You can edit every value in your assessment.',
    skipToContent: 'Skip to primary content',
    back: 'Back',
    continue: 'Continue',
    reset: 'Start Over',
    editNumbers: 'Tinker with Estimates',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Calculating options...',
    viewDetails: 'View Details',
    carbonSavedUnit: 'kg CO₂e avoided',
    dollarsSavedUnit: 'saved vs buying new',
    hoursNeededUnit: 'est. time',
    allRightsReserved: 'Fix It First — Code Variant Build 01 (Problem Statement 01)',
  },

  nav: {
    home: 'Home',
    assess: 'New Decision',
    explore: 'Repair Catalog',
    about: 'How It Works',
    quickDemos: 'Judge Demos (30s test)',
  },

  hero: {
    eyebrow: 'Code Variant Build 01 • 12-Hour Live Round',
    title: 'Before you discard or replace, find out if it is truly worth fixing.',
    subtitle: 'Every year, 53 million tons of items are thrown away when a 20-minute fix or simple repurpose would keep them working. Enter any broken item and get a transparent, unbiased comparison across 5 paths.',
    ctaPrimary: 'Start Item Assessment',
    ctaSecondary: 'Try a 30-Second Judge Demo',
    badge: 'Zero Sponsored Nudges • 100% Unbiased Logic',
    stats: [
      { value: '5-Way', label: 'Evaluation matrix (Repair, Reuse, Repurpose, Replace, Recycle)' },
      { value: '100%', label: 'Editable cost & lifespan estimates' },
      { value: '0 sec', label: 'No login, zero tracking, works offline in browser' },
    ],
  },

  judgeDemosModal: {
    title: '30-Second Judge Quick Test',
    subtitle: 'Select any pre-configured scenario to see the complete decision engine, safety warnings, and cost calculations instantly:',
    buttonLoad: 'Load Scenario',
  },

  steps: {
    step1: {
      number: '1',
      title: 'Item & Value',
      shortTitle: 'Item',
      description: 'What item do you have and what was its original value?',
    },
    step2: {
      number: '2',
      title: 'Fault Diagnosis',
      shortTitle: 'Diagnosis',
      description: 'What is wrong with it and are there safety hazards?',
    },
    step3: {
      number: '3',
      title: 'Tools & Skills',
      shortTitle: 'Capability',
      description: 'Your comfort level with hand tools and repair time.',
    },
    step4: {
      number: '4',
      title: 'The Decision Matrix',
      shortTitle: 'Verdict',
      description: 'Unbiased ranked evaluation of all 5 paths.',
    },
  },

  step1Form: {
    categoryLabel: 'Select Category',
    itemSelectLabel: 'Specific Item Type',
    customItemPlaceholder: 'Or enter custom item name (e.g., Ceramic Mug, Vintage Fan)',
    customItemHint: 'Can\'t find your exact model? Type it above and pick the closest category.',
    ageLabel: 'How old is this item? (Years)',
    ageHint: 'Used to calculate remaining lifespan and depreciation.',
    conditionLabel: 'Overall Physical Condition (excluding the fault)',
    conditionOptions: {
      like_new: 'Like New (well cared for, clean)',
      good: 'Good (minor cosmetic scuffs)',
      fair: 'Fair (visible wear and tear)',
      worn: 'Heavily Worn (scratched, dinged, but intact)',
    },
    originalPriceLabel: 'Original Purchase Price (or estimate)',
    originalPriceHint: 'What would a comparable replacement cost brand new today?',
    nextButton: 'Proceed to Diagnosis',
  },

  step2Form: {
    title: 'What went wrong?',
    subtitle: 'Select the primary symptom. We will calculate repair parts cost, difficulty, and check for safety red lines.',
    symptomLabel: 'Observed Symptom / Fault',
    customFaultLabel: 'Or describe custom fault in plain words',
    customFaultPlaceholder: 'e.g., handle snapped off, power button sticking',
    severityLabel: 'How severe is the issue?',
    severities: {
      mild: 'Mild — item still partially works or fault is non-critical',
      moderate: 'Moderate — core function impaired, annoying or incomplete',
      high: 'High — completely non-functional',
      critical: 'Critical — potential safety hazard (sparks, heat, structural crack)',
    },
    safetyQuestionsTitle: 'Critical Safety Checklist',
    safetyQuestionsSubtitle: 'Items with electrical shorts or battery damage require caution.',
    safetyChecklist: [
      { id: 'sparks', label: 'Have you seen sparks, smoke, or smelled burnt plastic?' },
      { id: 'batteryBulge', label: 'Is there any swelling, puffiness, or puncture in a battery?' },
      { id: 'waterDamage', label: 'Did the fault occur after liquid submersion or spills?' },
    ],
    nextButton: 'Check Repair Capability',
  },

  step3Form: {
    title: 'Your capability & time constraints',
    subtitle: 'The engine adjusts DIY vs Professional scores based on your actual comfort level and tools at hand.',
    skillLabel: 'How comfortable are you fixing physical objects?',
    skillLevels: [
      { level: 1, title: 'Novice', desc: 'I have never opened an appliance or used a soldering iron. Prefer screwdrivers and tape only.' },
      { level: 2, title: 'Handy Enthusiast', desc: 'Comfortable with basic hand tools (screwdrivers, pliers, glue, multimeter basics).' },
      { level: 3, title: 'Tinkerer / Maker', desc: 'Experienced with electronics, soldering, woodworking, or automotive repairs.' },
    ],
    toolsLabel: 'Do you have basic hand tools at home?',
    toolsHint: 'Screwdrivers, pliers, utility knife, flashlight.',
    toolsYes: 'Yes, I have basic hand tools',
    toolsNo: 'No, I would need to buy or borrow tools',
    timeAvailableLabel: 'How much time are you willing to invest?',
    timeOptions: {
      quick: 'Under 30 minutes only',
      afternoon: 'An afternoon (1 to 2 hours)',
      weekend: 'A weekend project (3+ hours)',
    },
    calculateButton: 'Generate 5-Way Decision Matrix',
  },

  verdict: {
    title: 'The Decision Matrix',
    subtitle: 'Every option ranked by net economic value, personal effort, environmental impact, and safety.',
    winnerBadge: 'Top Recommendation',
    whyWinner: 'Why this path wins',
    editBanner: 'Notice something off? Click "Tinker with Estimates" below to test different repair prices, replacement costs, or hourly rates.',
    tinkerButton: 'Tinker with Estimates',
    printReport: 'Print / Export Assessment',
    tabs: {
      all: 'All 5 Options Ranked',
      breakdown: 'Score Breakdown',
      impact: 'Environmental & Carbon Impact',
      actionPlan: 'Action Playbook',
    },
    options: {
      repair_diy: {
        name: 'Repair (DIY)',
        badge: 'Lowest Cost & Maximum Learning',
        tagline: 'Fix it yourself using everyday tools and an online guide.',
      },
      repair_pro: {
        name: 'Repair (Professional)',
        badge: 'Zero Effort, Guaranteed Result',
        tagline: 'Bring to a local independent repair technician or authorized shop.',
      },
      reuse: {
        name: 'Reuse / Pass Along',
        badge: 'Zero Waste & Instant Value',
        tagline: 'Use with a minor workaround, repurpose internally, or donate to someone who can use it.',
      },
      repurpose: {
        name: 'Repurpose / Upcycle',
        badge: 'Creative Transformation',
        tagline: 'Transform parts or chassis into a whole new functional object.',
      },
      replace: {
        name: 'Replace (Buy New)',
        badge: 'Fresh Warranty & Latest Features',
        tagline: 'Purchase a new energy-efficient replacement if repair is uneconomical.',
      },
      recycle: {
        name: 'Recycle / E-Waste Discard',
        badge: 'Responsible End-of-Life',
        tagline: 'Drop off at certified recycling centers to reclaim precious metals and prevent toxic landfill.',
      },
    },
    scores: {
      total: 'Overall Score',
      financial: 'Financial Value',
      feasibility: 'Feasibility & Effort',
      environmental: 'Carbon & Waste Saved',
      longevity: 'Longevity Extension',
    },
  },

  tinkerModal: {
    title: 'Tinker with Tunable Estimates',
    subtitle: 'All scores update dynamically in real-time as you adjust these parameters:',
    repairPartsCost: 'Estimated Repair Parts Cost ($)',
    replacementCost: 'Cost to Buy New Replacement ($)',
    proLaborHourly: 'Local Repair Shop Labor Rate ($/hr)',
    userSkillLevel: 'Adjusted User Skill Level (1-3)',
    hasTools: 'User owns basic tools',
    expectedAddedYears: 'Expected Added Years of Life if Repaired',
    applyChanges: 'Apply & Recalculate',
    resetDefaults: 'Reset to Engine Defaults',
  },

  actionPlaybook: {
    title: 'Step-by-Step Action Playbook',
    subtitle: 'Clear, practical steps to carry out your chosen decision safely.',
    diyChecklistTitle: 'DIY Repair Instructions & Checklist',
    toolsNeeded: 'Tools Required',
    partsNeeded: 'Parts & Materials',
    proChecklistTitle: 'Questions to Ask Your Local Repair Shop',
    proChecklist: [
      'Ask for a free or low-cost diagnostic estimate before authorizing labor.',
      'Check if they use OEM or high-grade aftermarket replacement parts.',
      'Request a minimum 90-day warranty on parts and workmanship.',
      'Ask if they return old replaced components to confirm replacement.',
    ],
    upcycleTitle: 'Creative Upcycling Inspiration',
    recycleTitle: 'Safe Responsible Disposal Guidelines',
    recycleGuidelines: [
      'Never throw lithium batteries, power cords, or circuit boards into household trash.',
      'Wipe personal data: perform a factory reset on smartphones, laptops, and tablets.',
      'Check local e-waste drop-off days at municipal civic amenity centers.',
      'Retail drop-offs: Best Buy, Home Depot, and Staples take electronics and rechargeable batteries for free.',
    ],
  },

  safety: {
    alertTitle: 'Safety Alert Detected',
    cautionBadge: 'Safety Hazard',
    dismissAlert: 'I understand the risks',
    diyBlockedNotice: 'DIY repair has been deprioritized due to dangerous electrical, chemical, or structural risks. Professional servicing or safe recycling is strongly advised.',
  },

  catalog: {
    title: 'Repair & Upcycle Knowledge Base',
    subtitle: 'Browse common faults, average repair savings, and creative upcycling recipes across all categories.',
    searchPlaceholder: 'Search faults, appliances, or materials...',
    filterAll: 'All Categories',
  },
};
