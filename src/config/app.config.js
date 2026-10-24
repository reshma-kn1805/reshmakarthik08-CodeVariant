/**
 * App Configuration & Tunable Constants
 * Layer: src/config/app.config.js
 * Strictly isolated from UI and engine.
 */

export const APP_CONFIG = {
  appName: 'Fix It First',
  tagline: 'Decide with clarity: Repair, Reuse, Repurpose, or Replace.',
  version: '1.0.0',
  round: 'Decision Workshop',
  date: '24 Oct 2026',

  // Currency & units
  currency: {
    symbol: '₹',
    code: 'INR',
    label: 'INR (₹)',
  },

  // Scoring weights (Sum = 1.0)
  weights: {
    financial: 0.35,     // Cost effectiveness vs new item
    feasibility: 0.25,   // Skill, tools, parts availability, time
    environmental: 0.25, // Embodied carbon saved & e-waste diverted
    longevity: 0.15,     // Added useful life gained
  },

  // Cost and Labor Baselines (all editable by user in UI)
  baselines: {
    proHourlyRateEstimate: 50, // USD/hr for professional bench labor
    diyHourlyValueEstimate: 18, // USD/hr value of personal time
    carbonPerKgCo2eUsd: 0.05,  // Social cost of carbon proxy
  },

  // Decision Thresholds
  thresholds: {
    repairStronglyViableRatio: 0.40, // Repair cost <= 40% of replacement: strong repair
    repairBorderlineRatio: 0.65,    // 40% - 65%: moderate repair, evaluate effort
    replaceFavoredRatio: 0.65,       // > 65%: consider replace, repurpose, or recycle
    criticalSafetyPenalty: 70,       // score penalty if untrained user attempts hazardous repair
  },

  // Feature flags
  features: {
    enableJudgeDemos: true,
    enableInteractiveSliders: true,
    enableShareableLink: true,
    enablePrintableReport: true,
    enableCarbonBadge: true,
    enableSafetyBanners: true,
  },
};
