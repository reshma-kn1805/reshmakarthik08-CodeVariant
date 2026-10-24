import { describe, it, expect } from 'vitest';
import rules from '../../data/rules.json';
import { calculateDecision, analyzeSafety, clamp, formatCurrency } from '../scoring.js';
import { APP_CONFIG } from '../../config/app.config.js';

describe('Decision & Scoring Engine', () => {
  it('clamps numbers safely between min and max', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-25, 0, 100)).toBe(0);
    expect(clamp(50, 0, 100)).toBe(50);
    expect(clamp(NaN, 0, 100)).toBe(0);
    expect(clamp(Infinity, 0, 100)).toBe(0);
  });

  it('formats currency correctly', () => {
    expect(formatCurrency(45)).toBe('$45');
    expect(formatCurrency(0)).toBe('$0');
    expect(formatCurrency('120.8')).toBe('$121');
  });

  it('detects safety hazard on microwave sparks', () => {
    const microwaveFault = rules.faults.sparks_inside;
    const safety = analyzeSafety(microwaveFault, {}, 'small_appliances');

    expect(safety.isHazardous).toBe(true);
    expect(safety.flags).toContain('MICROWAVE_WAVEGUIDE_BURNT');
    expect(safety.warning).toContain('mica waveguide cover');
  });

  it('detects safety hazard when user reports swollen battery', () => {
    const phoneFault = rules.faults.battery_degraded;
    const safety = analyzeSafety(phoneFault, { batteryBulge: true }, 'consumer_electronics');

    expect(safety.isHazardous).toBe(true);
    expect(safety.severity).toBe('critical');
    expect(safety.flags).toContain('SWOLLEN_LITHIUM_BATTERY');
  });

  it('evaluates toaster latch failure and favors repair_diy', () => {
    const input = {
      category: 'small_appliances',
      itemId: 'toaster',
      originalPrice: 45,
      itemAgeYears: 2,
      faultId: 'lever_wont_latch',
      userSkill: 2,
      hasBasicTools: true,
      timeAvailable: 'afternoon',
      safetyChecks: {},
    };

    const result = calculateDecision(input, rules, APP_CONFIG);

    expect(result).toBeDefined();
    expect(result.options.length).toBe(6);
    expect(result.winner).toBeDefined();
    // Repair DIY should score highest for zero-cost crumb clean
    expect(result.winner.id).toBe('repair_diy');
    expect(result.winner.score).toBeGreaterThan(75);
    expect(result.analytics.netSavings).toBeGreaterThanOrEqual(40);
  });

  it('penalizes DIY repair when dangerous safety hazard exists', () => {
    const input = {
      category: 'consumer_electronics',
      itemId: 'smartphone',
      originalPrice: 750,
      itemAgeYears: 3,
      faultId: 'swollen_battery',
      userSkill: 1, // Novice user
      hasBasicTools: false,
      timeAvailable: 'quick',
      safetyChecks: { batteryBulge: true },
    };

    const result = calculateDecision(input, rules, APP_CONFIG);
    const diyOption = result.options.find(o => o.id === 'repair_diy');

    expect(result.safety.isHazardous).toBe(true);
    expect(diyOption.safetyPenaltyApplied).toBe(true);
    // Novice should NOT be advised to DIY a swollen battery
    expect(result.winner.id).not.toBe('repair_diy');
  });

  it('handles empty and extreme inputs gracefully without crashing', () => {
    const emptyInput = {
      category: 'unknown_cat',
      itemId: 'unknown_item',
      originalPrice: 0,
      itemAgeYears: 0,
      faultId: 'unknown_fault',
      userSkill: 0,
      hasBasicTools: false,
      timeAvailable: '',
      safetyChecks: {},
    };

    const result = calculateDecision(emptyInput, rules, APP_CONFIG);
    expect(result).toBeDefined();
    expect(result.options.length).toBe(6);
    result.options.forEach(opt => {
      expect(opt.score).toBeGreaterThanOrEqual(0);
      expect(opt.score).toBeLessThanOrEqual(100);
      expect(typeof opt.verdictSummary).toBe('string');
      expect(opt.verdictSummary.length).toBeGreaterThan(0);
    });
  });

  it('updates scores dynamically when user provides overrides (tinkering)', () => {
    const input = {
      category: 'small_appliances',
      itemId: 'toaster',
      originalPrice: 45,
      itemAgeYears: 2,
      faultId: 'lever_wont_latch',
      userSkill: 2,
      hasBasicTools: true,
      timeAvailable: 'afternoon',
      safetyChecks: {},
      overrides: {
        replacementCost: 200, // expensive toaster
        partsCostEstimate: 5,
      },
    };

    const result = calculateDecision(input, rules, APP_CONFIG);
    const diyOption = result.options.find(o => o.id === 'repair_diy');

    // With replacement at $200 and repair at $5, financial score should be top tier
    expect(diyOption.scoreBreakdown.financial).toBeGreaterThan(90);
    expect(result.analytics.netSavings).toBe(195);
  });
});
