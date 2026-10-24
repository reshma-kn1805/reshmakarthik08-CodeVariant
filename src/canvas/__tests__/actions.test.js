import { describe, it, expect } from 'vitest';
import { applyDrop, PRIORITY_WEIGHTS } from '../actions.js';
import { ZONES } from '../../config/zones.js';

describe('Canvas Protocol - applyDrop pure reducer', () => {
  const baseState = {
    assessment: {
      category: 'kitchen_appliance',
      itemName: 'Mixer Grinder',
      faultId: 'ka_blender_coupler',
      problemText: 'Blades stripped',
      replaceCost: 3500,
      repairCost: 180,
      safetyFlags: [],
      priorities: { money: 50, waste: 50, effort: 50 },
      priorityRanks: ['money', 'waste', 'effort'],
    },
    history: [],
    recentlyDiscarded: [],
    gated: false,
    selectedFaults: [],
    committedOptionId: null,
    comparedOptionIds: [],
    comparedHistoryIds: [],
    checklistTicks: {},
  };

  it('rejects an unknown zone ID', () => {
    const res = applyDrop(baseState, { type: 'category', id: 'kitchen' }, 'zone-non-existent');
    expect(res.success).toBe(false);
    expect(res.reason).toBe('ZONE_NOT_FOUND');
    expect(res.effects.bounced).toBe(true);
  });

  // 1. START_ASSESSMENT
  describe('zone-start-assessment', () => {
    it('accepts category card and sets navigation to /assess', () => {
      const card = { type: 'category', id: 'furniture', data: { id: 'furniture', name: 'Furniture' } };
      const res = applyDrop(baseState, card, ZONES.START_ASSESSMENT.id);
      expect(res.success).toBe(true);
      expect(res.effects.navigate).toBe('/assess');
      expect(res.state.assessment.category).toBe('furniture');
    });

    it('accepts example card and routes to verdict page', () => {
      const card = { type: 'example', id: 'mixer_grinder_spin', data: { id: 'mixer_grinder_spin' } };
      const res = applyDrop(baseState, card, ZONES.START_ASSESSMENT.id);
      expect(res.success).toBe(true);
      expect(res.effects.navigate).toBe('/verdict/ex_mixer_grinder_spin');
    });

    it('rejects invalid card types (e.g. priority or step)', () => {
      const card = { type: 'step', id: 'step_1' };
      const res = applyDrop(baseState, card, ZONES.START_ASSESSMENT.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('ZONE_REJECTS_CARD_TYPE');
      expect(res.effects.bounced).toBe(true);
    });
  });

  // 2. CATEGORY_SLOT
  describe('zone-category-slot', () => {
    it('accepts category card and updates category in state', () => {
      const card = { type: 'category', id: 'bicycle', data: { id: 'bicycle', name: 'Bicycle', replaceCost: { default: 6000 } } };
      const res = applyDrop(baseState, card, ZONES.CATEGORY_SLOT.id);
      expect(res.success).toBe(true);
      expect(res.state.assessment.category).toBe('bicycle');
      expect(res.state.assessment.replaceCost).toBe(6000);
    });

    it('rejects non-category card', () => {
      const card = { type: 'fault', id: 'fault_1' };
      const res = applyDrop(baseState, card, ZONES.CATEGORY_SLOT.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('ZONE_REJECTS_CARD_TYPE');
    });
  });

  // 3. FAULTS
  describe('zone-faults', () => {
    it('accepts fault cards with first card as primary diagnosis', () => {
      const card1 = { type: 'fault', id: 'motor_stalled', data: { id: 'motor_stalled', label: 'Motor stalls', severity: 3, repairCost: { default: 450 } } };
      const res1 = applyDrop(baseState, card1, ZONES.FAULTS.id);
      expect(res1.success).toBe(true);
      expect(res1.effects.isPrimary).toBe(true);
      expect(res1.state.assessment.faultId).toBe('motor_stalled');
      expect(res1.state.assessment.repairCost).toBe(450);

      // Second fault is secondary
      const card2 = { type: 'fault', id: 'cord_damaged', data: { id: 'cord_damaged', label: 'Cord damaged' } };
      const res2 = applyDrop(res1.state, card2, ZONES.FAULTS.id);
      expect(res2.success).toBe(true);
      expect(res2.effects.isPrimary).toBe(false);
      expect(res2.state.selectedFaults.length).toBe(2);
      expect(res2.state.assessment.faultId).toBe('motor_stalled'); // stays primary
    });

    it('rejects non-fault card', () => {
      const card = { type: 'category', id: 'audio' };
      const res = applyDrop(baseState, card, ZONES.FAULTS.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('ZONE_REJECTS_CARD_TYPE');
    });
  });

  // 4. SAFETY
  describe('zone-safety', () => {
    it('accepts safety warning sign and toggles state', () => {
      const card = { type: 'safety', id: 'exposed_wire', data: { id: 'exposed_wire', label: 'Exposed wire', isCritical: true } };
      const res = applyDrop(baseState, card, ZONES.SAFETY.id);
      expect(res.success).toBe(true);
      expect(res.state.assessment.safetyFlags).toContain('exposed_wire');
      expect(res.state.gated).toBe(true);
    });

    it('clears safety flags when "none" card is dropped', () => {
      const stateWithFlags = {
        ...baseState,
        assessment: { ...baseState.assessment, safetyFlags: ['water_ingress'] },
        gated: false,
      };
      const card = { type: 'safety', id: 'none', data: { id: 'none', label: 'None of these' } };
      const res = applyDrop(stateWithFlags, card, ZONES.SAFETY.id);
      expect(res.success).toBe(true);
      expect(res.state.assessment.safetyFlags).toEqual([]);
    });

    it('rejects non-safety cards', () => {
      const card = { type: 'option', id: 'repair' };
      const res = applyDrop(baseState, card, ZONES.SAFETY.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('ZONE_REJECTS_CARD_TYPE');
    });
  });

  // 5. PRIORITIES (Slots 1, 2, 3)
  describe('zone-priority-1, 2, 3', () => {
    it('reorders priority ladder when card dropped on Slot 1', () => {
      const card = { type: 'priority', id: 'waste', data: { key: 'waste', label: 'Reduce Waste' } };
      const res = applyDrop(baseState, card, ZONES.PRIORITY_1.id);
      expect(res.success).toBe(true);
      expect(res.state.assessment.priorityRanks[0]).toBe('waste');
      expect(res.state.assessment.priorities.waste).toBe(PRIORITY_WEIGHTS[1]);
    });

    it('reorders priority ladder when card dropped on Slot 2', () => {
      const card = { type: 'priority', id: 'effort', data: { key: 'effort', label: 'Save Effort' } };
      const res = applyDrop(baseState, card, ZONES.PRIORITY_2.id);
      expect(res.success).toBe(true);
      expect(res.state.assessment.priorityRanks[1]).toBe('effort');
      expect(res.state.assessment.priorities.effort).toBe(PRIORITY_WEIGHTS[2]);
    });

    it('reorders priority ladder when card dropped on Slot 3', () => {
      const card = { type: 'priority', id: 'money', data: { key: 'money', label: 'Save Money' } };
      const res = applyDrop(baseState, card, ZONES.PRIORITY_3.id);
      expect(res.success).toBe(true);
      expect(res.state.assessment.priorityRanks[2]).toBe('money');
      expect(res.state.assessment.priorities.money).toBe(PRIORITY_WEIGHTS[3]);
    });

    it('rejects invalid priority card or key', () => {
      const card = { type: 'priority', id: 'unknown_key', data: { key: 'unknown_key' } };
      const res = applyDrop(baseState, card, ZONES.PRIORITY_1.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('INVALID_PRIORITY_KEY');
    });
  });

  // 6. RUN_ASSESSMENT
  describe('zone-run-assessment', () => {
    it('bounces back with missing slots when Case File is incomplete', () => {
      const incompleteState = {
        ...baseState,
        assessment: {
          category: '', // missing
          problemText: '', // missing
          replaceCost: 0, // missing
        },
      };
      const card = { type: 'case-file', id: 'case_summary' };
      const res = applyDrop(incompleteState, card, ZONES.RUN_ASSESSMENT.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('INCOMPLETE_CASE_FILE');
      expect(res.effects.bounced).toBe(true);
      expect(res.effects.missingSlots).toContain('Category');
      expect(res.effects.missingSlots).toContain("What's wrong");
      expect(res.effects.missingSlots).toContain('Cost estimates');
    });

    it('succeeds and navigates to verdict when Case File is complete', () => {
      const card = { type: 'case-file', id: 'case_summary' };
      const res = applyDrop(baseState, card, ZONES.RUN_ASSESSMENT.id);
      expect(res.success).toBe(true);
      expect(res.effects.navigate).toMatch(/\/verdict\/.+/);
    });

    it('rejects non-case-file cards', () => {
      const card = { type: 'priority', id: 'money' };
      const res = applyDrop(baseState, card, ZONES.RUN_ASSESSMENT.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('ZONE_REJECTS_CARD_TYPE');
    });
  });

  // 7. COMMIT
  describe('zone-commit', () => {
    it('accepts option card when not safety gated', () => {
      const card = { type: 'option', id: 'repair', data: { id: 'repair', name: 'Repair It Yourself' } };
      const res = applyDrop(baseState, card, ZONES.COMMIT.id);
      expect(res.success).toBe(true);
      expect(res.state.committedOptionId).toBe('repair');
    });

    it('rejects and bounces DIY repair option when safety gate is active', () => {
      const gatedState = { ...baseState, gated: true };
      const card = { type: 'option', id: 'repair', data: { id: 'repair', name: 'Repair It Yourself' } };
      const res = applyDrop(gatedState, card, ZONES.COMMIT.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('SAFETY_GATED');
      expect(res.effects.bounced).toBe(true);
      expect(res.effects.isGated).toBe(true);
    });

    it('permits professional repair and safe disposal even when safety gate is active', () => {
      const gatedState = { ...baseState, gated: true };
      const card1 = { type: 'option', id: 'pro_repair', data: { id: 'pro_repair', name: 'Professional Repair' } };
      const res1 = applyDrop(gatedState, card1, ZONES.COMMIT.id);
      expect(res1.success).toBe(true);

      const card2 = { type: 'option', id: 'recycle', data: { id: 'recycle', name: 'Safe E-Waste Recycling' } };
      const res2 = applyDrop(gatedState, card2, ZONES.COMMIT.id);
      expect(res2.success).toBe(true);
    });

    it('rejects non-option card', () => {
      const card = { type: 'category', id: 'bicycle' };
      const res = applyDrop(baseState, card, ZONES.COMMIT.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('ZONE_REJECTS_CARD_TYPE');
    });
  });

  // 8. PLAN_DONE
  describe('zone-plan-done', () => {
    it('accepts step card and updates checklistTicks', () => {
      const card = { type: 'step', id: 'step_disconnect_power', data: { id: 'step_disconnect_power', text: 'Disconnect power' } };
      const res = applyDrop(baseState, card, ZONES.PLAN_DONE.id);
      expect(res.success).toBe(true);
      expect(res.state.checklistTicks['step_disconnect_power']).toBe(true);
    });

    it('rejects non-step card', () => {
      const card = { type: 'case-file', id: 'case_1' };
      const res = applyDrop(baseState, card, ZONES.PLAN_DONE.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('ZONE_REJECTS_CARD_TYPE');
    });
  });

  // 9. COMPARE
  describe('zone-compare', () => {
    it('accepts up to 3 option cards for side-by-side comparison', () => {
      const card1 = { type: 'option', id: 'repair', data: { id: 'repair' } };
      const res1 = applyDrop(baseState, card1, ZONES.COMPARE.id);
      expect(res1.success).toBe(true);
      expect(res1.state.comparedOptionIds).toContain('repair');

      const card2 = { type: 'option', id: 'replace', data: { id: 'replace' } };
      const res2 = applyDrop(res1.state, card2, ZONES.COMPARE.id);
      expect(res2.state.comparedOptionIds.length).toBe(2);
    });

    it('rejects non-option card', () => {
      const card = { type: 'priority', id: 'waste' };
      const res = applyDrop(baseState, card, ZONES.COMPARE.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('ZONE_REJECTS_CARD_TYPE');
    });
  });

  // 10. KEEP and DISCARD
  describe('zone-keep and zone-discard', () => {
    it('discards a case file into recentlyDiscarded tray and removes from history', () => {
      const stateWithHist = {
        ...baseState,
        history: [{ id: 'case_123', itemName: 'Phone' }],
      };
      const card = { type: 'case-file', id: 'case_123', data: { id: 'case_123', itemName: 'Phone' } };
      const resDiscard = applyDrop(stateWithHist, card, ZONES.DISCARD.id);
      expect(resDiscard.success).toBe(true);
      expect(resDiscard.state.history.length).toBe(0);
      expect(resDiscard.state.recentlyDiscarded[0].id).toBe('case_123');

      // Undo by dragging back to Keep
      const resRestore = applyDrop(resDiscard.state, { ...card, type: 'discarded-case' }, ZONES.KEEP.id);
      expect(resRestore.success).toBe(true);
      expect(resRestore.state.history.length).toBe(1);
      expect(resRestore.state.recentlyDiscarded.length).toBe(0);
    });

    it('rejects invalid card types', () => {
      const card = { type: 'step', id: 'step_1' };
      const res = applyDrop(baseState, card, ZONES.KEEP.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('ZONE_REJECTS_CARD_TYPE');
    });
  });

  // 11. EXPORT
  describe('zone-export', () => {
    it('accepts case file and triggers export effect', () => {
      const card = { type: 'case-file', id: 'case_123', data: { id: 'case_123' } };
      const res = applyDrop(baseState, card, ZONES.EXPORT.id);
      expect(res.success).toBe(true);
      expect(res.effects.action).toBe('EXPORT');
      expect(res.effects.copySummary).toBe(true);
      expect(res.effects.openPrint).toBe(true);
    });

    it('rejects non-case-file card', () => {
      const card = { type: 'priority', id: 'money' };
      const res = applyDrop(baseState, card, ZONES.EXPORT.id);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('ZONE_REJECTS_CARD_TYPE');
    });
  });

  // 12. HISTORY ZONES (Reopen, Compare, Discard)
  describe('history archive zones', () => {
    const histCard = {
      type: 'history-card',
      id: 'eval_1',
      data: {
        id: 'eval_1',
        itemName: 'Kettle',
        assessment: { category: 'kitchen_appliance', itemName: 'Kettle' },
      },
    };

    it('zone-history-reopen sets assessment and routes to /assess', () => {
      const res = applyDrop(baseState, histCard, ZONES.HISTORY_REOPEN.id);
      expect(res.success).toBe(true);
      expect(res.effects.navigate).toBe('/assess');
      expect(res.state.assessment.itemName).toBe('Kettle');
    });

    it('zone-history-compare queues history items for comparison', () => {
      const res1 = applyDrop(baseState, histCard, ZONES.HISTORY_COMPARE.id);
      expect(res1.success).toBe(true);
      expect(res1.state.comparedHistoryIds).toContain('eval_1');
    });

    it('zone-history-discard removes item from history', () => {
      const stateWithHist = {
        ...baseState,
        history: [{ id: 'eval_1', itemName: 'Kettle' }],
      };
      const res = applyDrop(stateWithHist, histCard, ZONES.HISTORY_DISCARD.id);
      expect(res.success).toBe(true);
      expect(res.state.history.length).toBe(0);
    });

    it('rejects non-history card', () => {
      const card = { type: 'category', id: 'phone' };
      expect(applyDrop(baseState, card, ZONES.HISTORY_REOPEN.id).success).toBe(false);
      expect(applyDrop(baseState, card, ZONES.HISTORY_COMPARE.id).success).toBe(false);
      expect(applyDrop(baseState, card, ZONES.HISTORY_DISCARD.id).success).toBe(false);
    });
  });
});
