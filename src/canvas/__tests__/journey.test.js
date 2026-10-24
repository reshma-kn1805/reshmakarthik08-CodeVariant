import { describe, it, expect } from 'vitest';
import { applyDrop } from '../actions.js';
import { ZONES } from '../../config/zones.js';
import rulesData from '../../data/rules.json';
import examplesData from '../../data/examples.json';
import { calculateDecision } from '../../engine/scoring.js';
import { APP_CONFIG } from '../../config/app.config.js';

describe('Phase 8 — Complete User Journey QA Tests (Canvas Protocol)', () => {
  // 1. Three Examples Journey
  describe('Three Examples Journey', () => {
    it('1. Mixer Grinder example loads and evaluates repair as winner', () => {
      const ex = examplesData.find((e) => e.id === 'mixer_grinder_spin');
      expect(ex).toBeDefined();

      const dropRes = applyDrop({}, { type: 'example', id: ex.id, data: ex }, ZONES.START_ASSESSMENT.id);
      expect(dropRes.success).toBe(true);
      expect(dropRes.effects.navigate).toBe('/verdict/ex_mixer_grinder_spin');

      const decision = calculateDecision(ex.assessment, rulesData, APP_CONFIG);
      expect(decision.winner.id).toBe('repair');
      expect(decision.gated).toBe(false);
    });

    it('2. Swollen Phone Battery example triggers Critical Safety Lock', () => {
      const ex = examplesData.find((e) => e.id === 'swollen_battery_phone');
      expect(ex).toBeDefined();

      const dropRes = applyDrop({}, { type: 'example', id: ex.id, data: ex }, ZONES.START_ASSESSMENT.id);
      expect(dropRes.success).toBe(true);

      const decision = calculateDecision(ex.assessment, rulesData, APP_CONFIG);
      expect(decision.gated).toBe(true);
      expect(decision.winner.id).toBe('recycle');

      // Attempting to drop DIY repair on zone-commit must bounce back
      const commitRes = applyDrop(
        { gated: true },
        { type: 'option', id: 'repair', data: { id: 'repair', name: 'Repair' } },
        ZONES.COMMIT.id
      );
      expect(commitRes.success).toBe(false);
      expect(commitRes.reason).toBe('SAFETY_GATED');
      expect(commitRes.effects.bounced).toBe(true);

      // But dropping recycle or pro_repair succeeds
      const commitRecycle = applyDrop(
        { gated: true },
        { type: 'option', id: 'recycle', data: { id: 'recycle', name: 'Recycle' } },
        ZONES.COMMIT.id
      );
      expect(commitRecycle.success).toBe(true);
    });

    it('3. Old Wooden Study Chair evaluates replacement as winner', () => {
      const ex = examplesData.find((e) => e.id === 'chair_expensive_repair');
      expect(ex).toBeDefined();

      const decision = calculateDecision(ex.assessment, rulesData, APP_CONFIG);
      expect(decision.winner.id).toBe('replace');
    });
  });

  // 2. Assess Case File Flow & Incomplete Validation
  describe('Assess Case File Validation', () => {
    it('bounces incomplete case file and pulses missing slots', () => {
      const emptyState = {
        assessment: { category: '', problemText: '', replaceCost: 0 },
      };
      const res = applyDrop(emptyState, { type: 'case-file', id: 'case' }, ZONES.RUN_ASSESSMENT.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('INCOMPLETE_CASE_FILE');
      expect(res.effects.bounced).toBe(true);
      expect(res.effects.missingSlots).toContain('Category');
      expect(res.effects.missingSlots).toContain("What's wrong");
      expect(res.effects.missingSlots).toContain('Cost estimates');
    });

    it('succeeds when case file has equipment, fault, and economic estimates', () => {
      const completeState = {
        assessment: {
          category: 'kitchen_appliance',
          problemText: 'Drive teeth stripped',
          faultId: 'ka_blender_coupler',
          replaceCost: 3500,
          repairCost: 180,
          id: 'case_complete_123',
        },
      };
      const res = applyDrop(completeState, { type: 'case-file', id: 'case' }, ZONES.RUN_ASSESSMENT.id);
      expect(res.success).toBe(true);
      expect(res.effects.navigate).toBe('/verdict/case_complete_123');
    });
  });

  // 3. Keep, Discard & Restore (No Button Undo)
  describe('Keep, Discard & Restore Journey', () => {
    it('allows discarding case to tray and restoring back onto Keep with zero buttons', () => {
      const initialHistory = [{ id: 'case_test_99', itemName: 'Kettle', savings: 1200 }];
      const state = {
        history: initialHistory,
        recentlyDiscarded: [],
      };

      // 1. Drag case to Discard zone
      const discardRes = applyDrop(
        state,
        { type: 'case-file', id: 'case_test_99', data: initialHistory[0] },
        ZONES.DISCARD.id
      );
      expect(discardRes.success).toBe(true);
      expect(discardRes.state.history.length).toBe(0);
      expect(discardRes.state.recentlyDiscarded.length).toBe(1);
      expect(discardRes.state.recentlyDiscarded[0].id).toBe('case_test_99');

      // 2. Drag discarded case card back onto Keep zone (The pure drag undo)
      const restoreRes = applyDrop(
        discardRes.state,
        { type: 'discarded-case', id: 'case_test_99', data: discardRes.state.recentlyDiscarded[0] },
        ZONES.KEEP.id
      );
      expect(restoreRes.success).toBe(true);
      expect(restoreRes.state.history.length).toBe(1);
      expect(restoreRes.state.recentlyDiscarded.length).toBe(0);
      expect(restoreRes.state.history[0].id).toBe('case_test_99');
    });
  });

  // 4. History Reopen & Compare
  describe('History Reopen & Compare', () => {
    it('loads past case file into /assess on drop', () => {
      const pastCase = {
        id: 'hist_77',
        itemName: 'Bicycle Gear',
        assessment: { category: 'bicycle', problemText: 'Chain slips' },
      };
      const res = applyDrop({}, { type: 'history-card', id: 'hist_77', data: pastCase }, ZONES.HISTORY_REOPEN.id);
      expect(res.success).toBe(true);
      expect(res.effects.navigate).toBe('/assess');
      expect(res.state.assessment.category).toBe('bicycle');
    });

    it('queues 2 history cards for comparison', () => {
      const card1 = { type: 'history-card', id: 'h1', data: { id: 'h1' } };
      const card2 = { type: 'history-card', id: 'h2', data: { id: 'h2' } };

      const res1 = applyDrop({ comparedHistoryIds: [] }, card1, ZONES.HISTORY_COMPARE.id);
      expect(res1.success).toBe(true);
      expect(res1.state.comparedHistoryIds).toEqual(['h1']);
      expect(res1.effects.openCompareModal).toBe(false);

      const res2 = applyDrop(res1.state, card2, ZONES.HISTORY_COMPARE.id);
      expect(res2.success).toBe(true);
      expect(res2.state.comparedHistoryIds).toEqual(['h1', 'h2']);
      expect(res2.effects.openCompareModal).toBe(true);
    });
  });

  // 5. Priorities Ladder Live Re-ranking
  describe('Priorities Ladder live re-ranking', () => {
    it('maps priority weights dynamically when priority card dropped into Slot 1', () => {
      const state = {
        assessment: {
          priorities: { money: 50, waste: 50, effort: 50 },
          priorityRanks: ['money', 'waste', 'effort'],
        },
      };

      const dropRes = applyDrop(
        state,
        { type: 'priority', id: 'waste', data: { key: 'waste', label: 'Reduce Waste' } },
        ZONES.PRIORITY_1.id
      );

      expect(dropRes.success).toBe(true);
      expect(dropRes.state.assessment.priorityRanks[0]).toBe('waste');
      expect(dropRes.state.assessment.priorities.waste).toBe(70);
    });
  });

  // 6. Plan Done Checklist Drag
  describe('Plan Done Checklist Drag', () => {
    it('marks step completed when dragged into zone-plan-done', () => {
      const stepCard = { type: 'step', id: 'step_1_repair', data: { id: 'step_1_repair', text: 'Safety disconnect' } };
      const res = applyDrop({ checklistTicks: {} }, stepCard, ZONES.PLAN_DONE.id);
      expect(res.success).toBe(true);
      expect(res.state.checklistTicks['step_1_repair']).toBe(true);
    });
  });
});
