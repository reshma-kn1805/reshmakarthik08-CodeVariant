import { describe, it, expect } from 'vitest';
import rules from '../../data/rules.json';
import {
  calculateDecision,
  tippingPoint,
  calculateWeights,
  analyzeSafety,
  clamp,
  formatCurrency,
} from '../scoring.js';
import { APP_CONFIG } from '../../config/app.config.js';

describe('Decision & Scoring Engine (Pure JS)', () => {
  // Math & Currency helpers
  it('clamps numbers safely between min and max', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-25, 0, 100)).toBe(0);
    expect(clamp(50, 0, 100)).toBe(50);
    expect(clamp(NaN, 0, 100)).toBe(0);
    expect(clamp(Infinity, 0, 100)).toBe(0);
  });

  it('formats currency correctly with default or custom symbol', () => {
    expect(formatCurrency(45, '$')).toBe('$45');
    expect(formatCurrency(1200, '₹')).toBe('₹1200');
    expect(formatCurrency('120.8', '$')).toBe('$121');
  });

  // TEST 1: cheap-fix 5-year-old appliance ranks Repair first
  it('cheap-fix 5-year-old appliance ranks Repair first', () => {
    const input = {
      category: 'kitchen_appliance',
      ageYears: 5,
      faultId: 'ka_kettle_switch',
      severity: 2,
      repairCost: 200,
      replaceCost: 3500,
      restCondition: 'good',
      diyDifficulty: 'easy',
      partsCommon: true,
      safetyFlags: [],
    };

    const result = calculateDecision(input, rules, APP_CONFIG);

    expect(result).toBeDefined();
    expect(result.options.length).toBe(5);
    expect(result.winner).toBeDefined();
    expect(result.winner.id).toBe('repair');
    expect(result.options[0].id).toBe('repair');
    expect(result.winner.score).toBeGreaterThan(70);
    expect(result.gated).toBe(false);
  });

  // TEST 2: critical flag gates the result
  it('critical flag gates the result', () => {
    // 2a. Swollen battery flag
    const inputSwollen = {
      category: 'phone_or_laptop',
      ageYears: 2,
      faultId: 'pl_battery_swollen',
      severity: 5,
      repairCost: 2000,
      replaceCost: 30000,
      restCondition: 'good',
      diyDifficulty: 'hard',
      safetyFlags: ['swollen_battery'],
    };

    const resultSwollen = calculateDecision(inputSwollen, rules, APP_CONFIG);
    expect(resultSwollen.gated).toBe(true);
    expect(resultSwollen.safety.isCritical).toBe(true);

    const repairOpt = resultSwollen.options.find(o => o.id === 'repair');
    const reuseOpt = resultSwollen.options.find(o => o.id === 'reuse');
    const repurposeOpt = resultSwollen.options.find(o => o.id === 'repurpose');

    expect(repairOpt.factors.safety.rating).toBe(0);
    expect(reuseOpt.factors.safety.rating).toBe(0);
    expect(repurposeOpt.factors.safety.rating).toBe(0);
    expect(resultSwollen.gatedRecommendation).toContain('certified professional');
    expect(resultSwollen.gatedRecommendation).toContain('never DIY');

    // 2b. Burning smell flag
    const inputBurning = {
      category: 'fan_or_cooler',
      ageYears: 3,
      faultId: 'fc_motor_burning_odor',
      severity: 5,
      repairCost: 1200,
      replaceCost: 3500,
      safetyFlags: ['burning_smell'],
    };
    const resultBurning = calculateDecision(inputBurning, rules, APP_CONFIG);
    expect(resultBurning.gated).toBe(true);

    // 2c. Exposed mains wiring flag
    const inputMains = {
      category: 'kitchen_appliance',
      ageYears: 3,
      faultId: 'ka_mains_cord_frayed',
      severity: 4,
      repairCost: 250,
      replaceCost: 3500,
      safetyFlags: ['exposed_mains_wiring'],
    };
    const resultMains = calculateDecision(inputMains, rules, APP_CONFIG);
    expect(resultMains.gated).toBe(true);
  });

  // TEST 3: repair cost near replacement cost ranks Replace first
  it('repair cost near replacement cost ranks Replace first', () => {
    const input = {
      category: 'kitchen_appliance',
      ageYears: 6,
      faultId: 'ka_heating_element',
      severity: 4,
      repairCost: 3200,
      replaceCost: 3500, // 3200 / 3500 = 91.4% of new cost
      restCondition: 'poor',
      diyDifficulty: 'hard',
      partsCommon: false,
      safetyFlags: [],
    };

    const result = calculateDecision(input, rules, APP_CONFIG);

    expect(result.winner).toBeDefined();
    expect(result.winner.id).toBe('replace');
    expect(result.options[0].id).toBe('replace');
    expect(result.options.find(o => o.id === 'repair').score).toBeLessThan(result.winner.score);
  });

  // TEST 4: weights always sum to 100 and safety stays 10 under any priorities
  it('weights always sum to 100 and safety stays 10 under any priorities', () => {
    const testPriorities = [
      { money: 100, waste: 0, effort: 0 },
      { money: 0, waste: 100, effort: 0 },
      { money: 0, waste: 0, effort: 100 },
      { money: 85, waste: 45, effort: 10 },
      { money: 50, waste: 50, effort: 50 },
      { money: 0, waste: 0, effort: 0 },
      {},
      null,
      undefined,
    ];

    testPriorities.forEach((p) => {
      const weights = calculateWeights(p, rules);

      // 1. Safety weight is LOCKED at 10
      expect(weights.safety).toBe(10);

      // 2. All weights sum to exactly 100
      const total =
        weights.cost +
        weights.practicality +
        weights.remainingLife +
        weights.environment +
        weights.safety +
        weights.effort;

      expect(Math.round(total * 100) / 100).toBe(100);
      expect(total).toBeCloseTo(100, 2);
    });

    // Verify directional shift: money priority increases cost weight
    const defaultW = calculateWeights({}, rules);
    const moneyW = calculateWeights({ money: 100, waste: 0, effort: 0 }, rules);
    expect(moneyW.cost).toBeGreaterThan(defaultW.cost);

    // Waste priority increases environment and remainingLife weights
    const wasteW = calculateWeights({ money: 0, waste: 100, effort: 0 }, rules);
    expect(wasteW.environment).toBeGreaterThan(defaultW.environment);
    expect(wasteW.remainingLife).toBeGreaterThan(defaultW.remainingLife);

    // Effort priority increases effort weight
    const effortW = calculateWeights({ money: 0, waste: 0, effort: 100 }, rules);
    expect(effortW.effort).toBeGreaterThan(defaultW.effort);
  });

  // TEST 5: tippingPoint returns a threshold that actually flips the winner
  it('tippingPoint returns a threshold that actually flips the winner', () => {
    const input = {
      category: 'kitchen_appliance',
      ageYears: 4,
      faultId: 'ka_kettle_switch',
      severity: 2,
      repairCost: 200,
      replaceCost: 3500,
      restCondition: 'good',
      diyDifficulty: 'easy',
      partsCommon: true,
      safetyFlags: [],
    };

    // Current winner should be repair
    const initial = calculateDecision(input, rules, APP_CONFIG);
    expect(initial.winner.id).toBe('repair');

    const tp = tippingPoint(input, rules, APP_CONFIG);

    expect(tp).not.toBeNull();
    expect(tp.currentWinner).toBe('repair');
    expect(tp.thresholdRupees).toBeGreaterThan(input.repairCost);
    expect(tp.newWinner).not.toBe('repair');
    expect(typeof tp.sentence).toBe('string');
    expect(tp.sentence).toContain(String(tp.newWinner));

    // Evaluating at thresholdRupees must actually flip the winner
    const flippedAtThreshold = calculateDecision(
      { ...input, repairCost: tp.thresholdRupees },
      rules,
      APP_CONFIG
    );
    expect(flippedAtThreshold.winner.id).toBe(tp.newWinner);

    // Just ₹1 below threshold, currentWinner is still top (or tied)
    const justBelow = calculateDecision(
      { ...input, repairCost: tp.thresholdRupees - 1 },
      rules,
      APP_CONFIG
    );
    expect(justBelow.winner.id).toBe(tp.currentWinner);
  });

  // TEST 6: tippingPoint returns null when winner never changes within 3x replaceCost
  it('tippingPoint returns null when winner never changes within 3x replaceCost', () => {
    const replaceWinnerInput = {
      category: 'kitchen_appliance',
      ageYears: 10,
      faultId: 'ka_heating_element',
      severity: 5,
      repairCost: 4000,
      replaceCost: 2000,
      safetyFlags: [],
    };

    // If replace is already winner, raising repair cost will never change winner to repair
    const tp = tippingPoint(replaceWinnerInput, rules, APP_CONFIG);
    expect(tp).toBeNull();
  });

  // TEST 7: Output structure compliance: 5 options, per-factor { rating, weight, points }, reasons, confidence
  it('provides complete output structure with factor breakdowns and reasons', () => {
    const input = {
      category: 'phone_or_laptop',
      ageYears: 3,
      faultId: 'pl_cracked_screen',
      severity: 3,
      repairCost: 4500,
      replaceCost: 32000,
      restCondition: 'fair',
      diyDifficulty: 'medium',
      partsCommon: true,
      safetyFlags: [],
      priorities: { money: 70, waste: 50, effort: 30 },
    };

    const result = calculateDecision(input, rules, APP_CONFIG);

    expect(result.options.length).toBe(5);
    expect(result.confidence).toBe('high');
    expect(typeof result.gated).toBe('boolean');

    result.options.forEach((opt) => {
      expect(opt.score).toBeGreaterThanOrEqual(0);
      expect(opt.score).toBeLessThanOrEqual(100);

      // Check factor breakdowns
      ['cost', 'practicality', 'remainingLife', 'environment', 'safety', 'effort'].forEach(
        (f) => {
          expect(opt.factors[f]).toBeDefined();
          expect(opt.factors[f].rating).toBeGreaterThanOrEqual(0);
          expect(opt.factors[f].rating).toBeLessThanOrEqual(10);
          expect(opt.factors[f].weight).toBeGreaterThan(0);
          expect(opt.factors[f].points).toBeGreaterThanOrEqual(0);
        }
      );

      // Check 2-3 reasons
      expect(Array.isArray(opt.reasons)).toBe(true);
      expect(opt.reasons.length).toBeGreaterThanOrEqual(2);
      expect(opt.reasons.length).toBeLessThanOrEqual(3);
    });
  });

  // TEST 8: Handles graceful fallbacks on empty or partial inputs
  it('handles empty or partial inputs gracefully without crashing', () => {
    const emptyResult = calculateDecision({}, rules, APP_CONFIG);
    expect(emptyResult).toBeDefined();
    expect(emptyResult.options.length).toBe(5);
    expect(emptyResult.confidence).toBe('low');
    expect(emptyResult.winner).toBeDefined();
  });
});
