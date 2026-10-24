/**
 * Pure Drop Logic for The Canvas Protocol
 * applyDrop(state, card, zoneId) returns:
 * { success: boolean, reason?: string, state: nextState, effects: { ... } }
 */

import { getZoneById } from '../config/zones.js';

// Default priority ranking ladder weights
export const PRIORITY_WEIGHTS = {
  1: 70, // Primary weight
  2: 50, // Secondary weight
  3: 30, // Tertiary weight
};

export function applyDrop(state = {}, card = {}, zoneId) {
  const currentState = {
    assessment: {
      category: '',
      itemName: '',
      faultId: '',
      problemText: '',
      severity: 2,
      repairCost: 0,
      replaceCost: 0,
      safetyFlags: [],
      priorities: { money: 50, waste: 50, effort: 50 },
      priorityRanks: ['money', 'waste', 'effort'],
      ...(state.assessment || {}),
    },
    history: Array.isArray(state.history) ? [...state.history] : [],
    recentlyDiscarded: Array.isArray(state.recentlyDiscarded) ? [...state.recentlyDiscarded] : [],
    gated: Boolean(state.gated),
    selectedFaults: Array.isArray(state.selectedFaults) ? [...state.selectedFaults] : [],
    committedOptionId: state.committedOptionId || null,
    comparedOptionIds: Array.isArray(state.comparedOptionIds) ? [...state.comparedOptionIds] : [],
    comparedHistoryIds: Array.isArray(state.comparedHistoryIds) ? [...state.comparedHistoryIds] : [],
    checklistTicks: { ...(state.checklistTicks || {}) },
    ...state,
  };

  const zone = getZoneById(zoneId);

  // 1. Zone existence validation
  if (!zone) {
    return {
      success: false,
      reason: 'ZONE_NOT_FOUND',
      state: currentState,
      effects: {
        bounced: true,
        message: `Action zone "${zoneId}" does not exist.`,
      },
    };
  }

  // 2. Card type compatibility validation
  if (!card || !card.type || !zone.accepts.includes(card.type)) {
    return {
      success: false,
      reason: 'ZONE_REJECTS_CARD_TYPE',
      state: currentState,
      effects: {
        bounced: true,
        message: `Zone "${zone.label}" does not accept "${card?.type || 'unknown'}" cards.`,
      },
    };
  }

  // 3. Zone-specific drop evaluation
  switch (zone.id) {
    case 'zone-start-assessment': {
      if (card.type === 'category') {
        const catId = card.data?.id || card.id;
        const nextAssessment = {
          ...currentState.assessment,
          category: catId,
          itemName: card.data?.name || card.title || catId,
        };
        return {
          success: true,
          state: {
            ...currentState,
            assessment: nextAssessment,
          },
          effects: {
            navigate: '/assess',
            message: `Starting assessment for ${card.data?.name || card.title || 'category'}.`,
          },
        };
      }

      if (card.type === 'example') {
        const exampleId = card.data?.id || card.id;
        return {
          success: true,
          state: currentState,
          effects: {
            loadExampleId: exampleId,
            navigate: `/verdict/ex_${exampleId}`,
            message: `Loaded example scenario: ${card.title || card.data?.title || exampleId}.`,
          },
        };
      }

      break;
    }

    case 'zone-category-slot': {
      const catId = card.data?.id || card.id;
      const nextAssessment = {
        ...currentState.assessment,
        category: catId,
        itemName: card.data?.name || card.title || catId,
        // Reset incompatible fault & safety flags
        faultId: card.data?.commonFaults?.[0]?.id || '',
        safetyFlags: [],
        replaceCost: card.data?.replaceCost?.default || currentState.assessment.replaceCost || 3500,
      };

      return {
        success: true,
        state: {
          ...currentState,
          assessment: nextAssessment,
          selectedFaults: [],
        },
        effects: {
          message: `Category updated to ${card.data?.name || card.title}.`,
        },
      };
    }

    case 'zone-faults': {
      const fault = card.data || {};
      const faultId = fault.id || card.id;
      const isAlreadyAdded = currentState.selectedFaults.some((f) => f.id === faultId);
      const nextFaults = isAlreadyAdded
        ? currentState.selectedFaults
        : [...currentState.selectedFaults, { ...fault, id: faultId }];

      // First fault dropped is primary
      const primaryFault = nextFaults[0];
      const nextAssessment = {
        ...currentState.assessment,
        faultId: primaryFault?.id || faultId,
        problemText: currentState.assessment.problemText || fault.label || fault.description || '',
        repairCost: fault.repairCost?.default || currentState.assessment.repairCost || 250,
        severity: typeof fault.severity === 'number' ? fault.severity : currentState.assessment.severity,
      };

      return {
        success: true,
        state: {
          ...currentState,
          assessment: nextAssessment,
          selectedFaults: nextFaults,
        },
        effects: {
          isPrimary: nextFaults.length === 1,
          message: `Fault added: ${fault.label || card.title} (${nextFaults.length === 1 ? 'Primary diagnosis' : 'Secondary symptom'}).`,
        },
      };
    }

    case 'zone-safety': {
      const flagId = card.data?.id || card.id;
      const currentFlags = currentState.assessment.safetyFlags || [];

      let nextFlags = [];
      if (flagId === 'none') {
        nextFlags = [];
      } else if (currentFlags.includes(flagId)) {
        nextFlags = currentFlags.filter((f) => f !== flagId);
      } else {
        nextFlags = [...currentFlags.filter((f) => f !== 'none'), flagId];
      }

      const isCritical =
        flagId !== 'none' &&
        (card.data?.isCritical ||
          ['swollen_battery', 'burning_smell', 'exposed_mains_wiring', 'structural_crack'].includes(flagId));

      const nextAssessment = {
        ...currentState.assessment,
        safetyFlags: nextFlags,
      };

      return {
        success: true,
        state: {
          ...currentState,
          assessment: nextAssessment,
          gated: isCritical || nextFlags.some((f) => String(f).includes('swollen') || String(f).includes('burning')),
        },
        effects: {
          isCritical,
          message: flagId === 'none'
            ? 'Safety flags cleared: safe operating condition affirmed.'
            : `Safety flag toggled: ${card.title || card.data?.label || flagId}.`,
        },
      };
    }

    case 'zone-priority-1':
    case 'zone-priority-2':
    case 'zone-priority-3': {
      const targetRank = zone.rank; // 1, 2, or 3
      const priorityKey = card.data?.key || card.data?.id || card.id; // 'money', 'waste', 'effort'

      const validKeys = ['money', 'waste', 'effort'];
      if (!validKeys.includes(priorityKey)) {
        return {
          success: false,
          reason: 'INVALID_PRIORITY_KEY',
          state: currentState,
          effects: {
            bounced: true,
            message: `Unknown priority key "${priorityKey}". Expected money, waste, or effort.`,
          },
        };
      }

      // Reorder priority ladder without duplicates
      const currentRanks = currentState.assessment.priorityRanks || ['money', 'waste', 'effort'];
      const filtered = currentRanks.filter((k) => k !== priorityKey);

      let nextRanks = [];
      if (targetRank === 1) {
        nextRanks = [priorityKey, filtered[0], filtered[1]];
      } else if (targetRank === 2) {
        nextRanks = [filtered[0], priorityKey, filtered[1]];
      } else {
        nextRanks = [filtered[0], filtered[1], priorityKey];
      }

      // Map ranks to numeric weights
      const nextPriorities = {
        [nextRanks[0]]: PRIORITY_WEIGHTS[1],
        [nextRanks[1]]: PRIORITY_WEIGHTS[2],
        [nextRanks[2]]: PRIORITY_WEIGHTS[3],
      };

      const nextAssessment = {
        ...currentState.assessment,
        priorityRanks: nextRanks,
        priorities: nextPriorities,
      };

      return {
        success: true,
        state: {
          ...currentState,
          assessment: nextAssessment,
        },
        effects: {
          rankedSlot: targetRank,
          ranks: nextRanks,
          message: `Ranked ${card.title || priorityKey} into Priority #${targetRank} (${PRIORITY_WEIGHTS[targetRank]}% weight).`,
        },
      };
    }

    case 'zone-run-assessment': {
      const a = currentState.assessment;
      const missingSlots = [];

      if (!a.category) missingSlots.push('Category');
      if (!a.problemText && !a.faultId) missingSlots.push("What's wrong");
      if (!a.replaceCost || Number(a.replaceCost) <= 0) missingSlots.push('Cost estimates');

      if (missingSlots.length > 0) {
        return {
          success: false,
          reason: 'INCOMPLETE_CASE_FILE',
          missingSlots,
          state: currentState,
          effects: {
            bounced: true,
            missingSlots,
            message: `Case File incomplete: Please define ${missingSlots.join(', ')} before running assessment.`,
          },
        };
      }

      const caseId = a.id || `eval_${Date.now()}`;
      const nextAssessment = { ...a, id: caseId };

      return {
        success: true,
        state: {
          ...currentState,
          assessment: nextAssessment,
        },
        effects: {
          caseId,
          navigate: `/verdict/${caseId}`,
          message: 'Case file validated. Generating 5-way decision table.',
        },
      };
    }

    case 'zone-commit': {
      const option = card.data || {};
      const optionId = option.id || card.id;

      // Check safety gate
      const isDiyOrRepurpose = ['repair', 'diy_repair', 'reuse', 'repurpose'].includes(optionId);
      if (currentState.gated && isDiyOrRepurpose) {
        return {
          success: false,
          reason: 'SAFETY_GATED',
          state: currentState,
          effects: {
            bounced: true,
            isGated: true,
            message:
              'Safety Red-Line Triggered: DIY repair, reuse, and repurposing are strictly locked. Only Professional Repair or Certified Recycling can be committed.',
          },
        };
      }

      return {
        success: true,
        state: {
          ...currentState,
          committedOptionId: optionId,
        },
        effects: {
          committedOptionId: optionId,
          message: `Committed to ${option.name || card.title || optionId}. Action plan steps unlocked.`,
        },
      };
    }

    case 'zone-plan-done': {
      const stepId = card.data?.id || card.id;
      const nextTicks = {
        ...currentState.checklistTicks,
        [stepId]: true,
      };

      return {
        success: true,
        state: {
          ...currentState,
          checklistTicks: nextTicks,
        },
        effects: {
          stepId,
          message: `Step marked done: ${card.title || card.data?.text || stepId}.`,
        },
      };
    }

    case 'zone-compare': {
      const optionId = card.data?.id || card.id;
      const current = currentState.comparedOptionIds;

      let nextCompared = current;
      if (!current.includes(optionId)) {
        if (current.length >= 3) {
          nextCompared = [current[1], current[2], optionId];
        } else {
          nextCompared = [...current, optionId];
        }
      }

      return {
        success: true,
        state: {
          ...currentState,
          comparedOptionIds: nextCompared,
        },
        effects: {
          comparedOptionIds: nextCompared,
          openCompareModal: true,
          message: `Added ${card.title || optionId} to side-by-side comparison (${nextCompared.length}/3).`,
        },
      };
    }

    case 'zone-keep': {
      const caseItem = card.data || currentState.assessment;
      const caseId = caseItem.id || `eval_${Date.now()}`;

      // If restoring from recentlyDiscarded
      const filteredDiscarded = currentState.recentlyDiscarded.filter((d) => d.id !== caseId);
      const isAlreadyInHistory = currentState.history.some((h) => h.id === caseId);
      const nextHistory = isAlreadyInHistory
        ? currentState.history
        : [{ ...caseItem, id: caseId }, ...currentState.history];

      return {
        success: true,
        state: {
          ...currentState,
          history: nextHistory,
          recentlyDiscarded: filteredDiscarded,
        },
        effects: {
          caseId,
          message: `Case File pinned in session history${filteredDiscarded.length < currentState.recentlyDiscarded.length ? ' (restored from Discarded tray)' : ''}.`,
        },
      };
    }

    case 'zone-discard': {
      const caseItem = card.data || currentState.assessment;
      const caseId = caseItem.id || `eval_${Date.now()}`;

      const filteredHistory = currentState.history.filter((h) => h.id !== caseId);
      const nextDiscarded = [
        { ...caseItem, id: caseId },
        ...currentState.recentlyDiscarded.filter((d) => d.id !== caseId),
      ];

      return {
        success: true,
        state: {
          ...currentState,
          history: filteredHistory,
          recentlyDiscarded: nextDiscarded,
        },
        effects: {
          caseId,
          message: 'Case moved to Recently Discarded tray. Drag back onto Keep to restore.',
        },
      };
    }

    case 'zone-export': {
      const caseItem = card.data || currentState.assessment;
      return {
        success: true,
        state: currentState,
        effects: {
          action: 'EXPORT',
          caseId: caseItem.id,
          copySummary: true,
          openPrint: true,
          message: 'Summary report copied to clipboard. Opening print-ready sheet.',
        },
      };
    }

    case 'zone-history-reopen': {
      const pastAssessment = card.data?.assessment || card.data || {};
      return {
        success: true,
        state: {
          ...currentState,
          assessment: {
            ...currentState.assessment,
            ...pastAssessment,
          },
        },
        effects: {
          navigate: '/assess',
          message: `Reopened assessment for ${card.title || card.data?.itemName || 'item'}.`,
        },
      };
    }

    case 'zone-history-compare': {
      const itemId = card.data?.id || card.id;
      const current = currentState.comparedHistoryIds;

      let nextCompared = current;
      if (!current.includes(itemId)) {
        if (current.length >= 2) {
          nextCompared = [current[1], itemId];
        } else {
          nextCompared = [...current, itemId];
        }
      }

      return {
        success: true,
        state: {
          ...currentState,
          comparedHistoryIds: nextCompared,
        },
        effects: {
          comparedHistoryIds: nextCompared,
          openCompareModal: nextCompared.length >= 2,
          message: `History comparison queue: ${nextCompared.length}/2 cases.`,
        },
      };
    }

    case 'zone-history-discard': {
      const itemId = card.data?.id || card.id;
      const nextHistory = currentState.history.filter((h) => h.id !== itemId);

      return {
        success: true,
        state: {
          ...currentState,
          history: nextHistory,
        },
        effects: {
          removedId: itemId,
          message: `Removed ${card.title || card.data?.itemName || 'item'} from history.`,
        },
      };
    }

    default:
      return {
        success: false,
        reason: 'UNHANDLED_ZONE',
        state: currentState,
        effects: {
          bounced: true,
          message: `Zone action not handled for "${zone.id}".`,
        },
      };
  }

  return {
    success: false,
    reason: 'UNKNOWN_ERROR',
    state: currentState,
    effects: { bounced: true },
  };
}
