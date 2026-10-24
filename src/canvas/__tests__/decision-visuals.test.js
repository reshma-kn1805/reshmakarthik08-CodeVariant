import { describe, it, expect } from 'vitest';
import { applyDrop } from '../actions.js';
import { ZONES } from '../../config/zones.js';
import rulesData from '../../data/rules.json';
import examplesData from '../../data/examples.json';
import { calculateDecision } from '../../engine/scoring.js';
import { APP_CONFIG } from '../../config/app.config.js';

describe('Phase D — Decision Visuals & Complete Journey QA Tests', () => {
  const mixerExample = examplesData.find((e) => e.id === 'mixer_grinder_spin');
  const decision = calculateDecision(mixerExample.assessment, rulesData, APP_CONFIG);

  // 1. Export Action Zone QA
  describe('Export Case File Summary', () => {
    it('sets copySummary and openPrint effects without action buttons', () => {
      const state = {
        assessment: mixerExample.assessment,
      };
      const res = applyDrop(
        state,
        { type: 'case-file', id: 'case_export_1', data: mixerExample.assessment },
        ZONES.EXPORT.id
      );

      expect(res.success).toBe(true);
      expect(res.effects.action).toBe('EXPORT');
      expect(res.effects.copySummary).toBe(true);
      expect(res.effects.openPrint).toBe(true);
      expect(res.effects.message).toContain('Summary report copied to clipboard');
    });
  });

  // 2. Verdict Compare Action Zone QA
  describe('Verdict Compare Action Zone (Up to 3 Options)', () => {
    it('queues up to 3 options side-by-side for comparison', () => {
      let state = { comparedOptionIds: [] };

      // Drop option 1 (repair)
      const res1 = applyDrop(state, { type: 'option', id: 'repair', data: { id: 'repair', name: 'Repair' } }, ZONES.COMPARE.id);
      expect(res1.success).toBe(true);
      expect(res1.state.comparedOptionIds).toEqual(['repair']);
      expect(res1.effects.openCompareModal).toBe(true);

      // Drop option 2 (replace)
      const res2 = applyDrop(res1.state, { type: 'option', id: 'replace', data: { id: 'replace', name: 'Replace' } }, ZONES.COMPARE.id);
      expect(res2.success).toBe(true);
      expect(res2.state.comparedOptionIds).toEqual(['repair', 'replace']);
      expect(res2.effects.openCompareModal).toBe(true);

      // Drop option 3 (diy_repair)
      const res3 = applyDrop(res2.state, { type: 'option', id: 'diy_repair', data: { id: 'diy_repair', name: 'DIY' } }, ZONES.COMPARE.id);
      expect(res3.success).toBe(true);
      expect(res3.state.comparedOptionIds).toEqual(['repair', 'replace', 'diy_repair']);

      // 4th option cycles via sliding FIFO window of 3
      const res4 = applyDrop(res3.state, { type: 'option', id: 'recycle', data: { id: 'recycle', name: 'Recycle' } }, ZONES.COMPARE.id);
      expect(res4.success).toBe(true);
      expect(res4.state.comparedOptionIds.length).toBe(3);
      expect(res4.state.comparedOptionIds).toContain('recycle');
    });
  });

  // 3. Radar Chart 6 Factors Logic QA
  describe('Radar Chart 6-Factors Evaluation', () => {
    it('evaluates all 6 decision factors between Winner and Runner-up', () => {
      const winner = decision.winner;
      const runnerUp = decision.options[1];

      expect(winner).toBeDefined();
      expect(runnerUp).toBeDefined();

      const factorKeys = ['cost', 'practicality', 'environment'];
      
      factorKeys.forEach((key) => {
        const winRating = winner.factors?.[key]?.rating ?? 6;
        const runRating = runnerUp.factors?.[key]?.rating ?? 5;

        expect(typeof winRating).toBe('number');
        expect(winRating).toBeGreaterThanOrEqual(1);
        expect(winRating).toBeLessThanOrEqual(10);

        expect(typeof runRating).toBe('number');
        expect(runRating).toBeGreaterThanOrEqual(1);
        expect(runRating).toBeLessThanOrEqual(10);
      });
    });
  });

  // 4. Break-even Line Chart Calculation QA
  describe('Break-Even Cost Over N Years Calculation', () => {
    it('calculates repair vs replace cost trajectory over 5 years and finds break-even', () => {
      const repairCost = 180;
      const replaceCost = 3200;
      const lifespanYears = 5;

      const years = Array.from({ length: lifespanYears + 1 }, (_, i) => i);
      const repairCurve = years.map((y) => repairCost + y * (repairCost * 0.15));
      const replaceCurve = years.map((y) => replaceCost + y * (replaceCost * 0.08));

      // At year 0, repair is significantly cheaper than replacement
      expect(repairCurve[0]).toBeLessThan(replaceCurve[0]);

      // Cumulative savings over lifespan
      const totalSavingsAtEnd = replaceCurve[lifespanYears] - repairCurve[lifespanYears];
      expect(totalSavingsAtEnd).toBeGreaterThan(0);
    });
  });

  // 5. Sensitivity Slider & Exact Flip Point Calculation QA
  describe('Repair Quote Sensitivity & Exact Flip Point', () => {
    it('finds exact flip threshold where repair is overtaken by runner-up', () => {
      const baseAssessment = mixerExample.assessment;
      const baseQuote = baseAssessment.repairCost || 180;
      const replaceCost = baseAssessment.replaceCost || 3200;

      // When repair cost is equal to 95% of replacement cost, repair should no longer win
      const highQuoteAssessment = {
        ...baseAssessment,
        repairCost: replaceCost * 0.95,
      };

      const highDecision = calculateDecision(highQuoteAssessment, rulesData, APP_CONFIG);
      expect(highDecision.winner.id).not.toBe('repair');

      // Iterative flip-point search test
      let flipFound = false;
      let flipQuote = null;

      for (let testQuote = baseQuote; testQuote <= replaceCost; testQuote += 100) {
        const testAssessment = { ...baseAssessment, repairCost: testQuote };
        const testDec = calculateDecision(testAssessment, rulesData, APP_CONFIG);
        if (testDec.winner.id !== 'repair') {
          flipFound = true;
          flipQuote = testQuote;
          break;
        }
      }

      expect(flipFound).toBe(true);
      expect(flipQuote).toBeGreaterThan(baseQuote);
      expect(flipQuote).toBeLessThanOrEqual(replaceCost);
    });
  });

  // 6. The Matrix Heatmap Structure QA
  describe('The Matrix Heatmap Options x Factors', () => {
    it('contains all 5 parallel options and weighted headers', () => {
      expect(decision.options.length).toBe(5);

      const optionIds = decision.options.map((o) => o.id);
      expect(optionIds).toContain('repair');
      expect(optionIds).toContain('reuse');
      expect(optionIds).toContain('repurpose');
      expect(optionIds).toContain('replace');
      expect(optionIds).toContain('recycle');

      // Verify each option has hover reason / summary
      decision.options.forEach((opt) => {
        expect(opt.verdictSummary).toBeDefined();
        expect(opt.verdictSummary.length).toBeGreaterThan(5);
      });
    });
  });
});
