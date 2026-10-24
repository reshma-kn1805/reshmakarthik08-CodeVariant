/**
 * Action Zone Registry for The Canvas Protocol
 * Each zone defines its ID, label, accepted card types, hint, and primary action identifier.
 */

export const ZONES = {
  // Workbench (Home Page)
  START_ASSESSMENT: {
    id: 'zone-start-assessment',
    label: 'Drop to run assessment',
    accepts: ['category', 'example'],
    hint: 'Drop a category card to configure or an example card for an instant verdict',
    action: 'START_ASSESSMENT',
    verb: 'Start Assessment',
  },

  // Assess Page (Case File Canvas)
  CATEGORY_SLOT: {
    id: 'zone-category-slot',
    label: 'Drop category card here',
    accepts: ['category'],
    hint: 'Sets the equipment category for diagnosis & scoring',
    action: 'SET_CATEGORY',
    verb: 'Set Category',
  },
  FAULTS: {
    id: 'zone-faults',
    label: 'Drop diagnosed fault cards',
    accepts: ['fault'],
    hint: 'Drop faults here. The first card becomes primary diagnosis.',
    action: 'ADD_FAULT',
    verb: 'Add Fault',
  },
  SAFETY: {
    id: 'zone-safety',
    label: 'Drop safety warning signs',
    accepts: ['safety'],
    hint: 'Drop hazard flags. Critical signs immediately lock DIY repairs.',
    action: 'TOGGLE_SAFETY',
    verb: 'Set Safety Sign',
  },
  PRIORITY_1: {
    id: 'zone-priority-1',
    label: '#1 Priority (Top Weight)',
    accepts: ['priority'],
    hint: 'Slot 1: Highest decision weight',
    action: 'SET_PRIORITY_1',
    verb: 'Set #1 Priority',
    rank: 1,
  },
  PRIORITY_2: {
    id: 'zone-priority-2',
    label: '#2 Priority (Moderate Weight)',
    accepts: ['priority'],
    hint: 'Slot 2: Secondary decision weight',
    action: 'SET_PRIORITY_2',
    verb: 'Set #2 Priority',
    rank: 2,
  },
  PRIORITY_3: {
    id: 'zone-priority-3',
    label: '#3 Priority (Base Weight)',
    accepts: ['priority'],
    hint: 'Slot 3: Baseline decision weight',
    action: 'SET_PRIORITY_3',
    verb: 'Set #3 Priority',
    rank: 3,
  },
  RUN_ASSESSMENT: {
    id: 'zone-run-assessment',
    label: 'Drop Case File to run assessment',
    accepts: ['case-file'],
    hint: 'Calculates decision and logs evaluation to history',
    action: 'RUN_ASSESSMENT',
    verb: 'Run Assessment',
  },

  // Verdict Page (Decision Table Canvas)
  COMMIT: {
    id: 'zone-commit',
    label: 'Drop option to commit & view action plan',
    accepts: ['option'],
    hint: 'Locks in choice and generates sequential action steps',
    action: 'COMMIT_OPTION',
    verb: 'Commit Option',
  },
  PLAN_DONE: {
    id: 'zone-plan-done',
    label: 'Drop step here to mark Done',
    accepts: ['step'],
    hint: 'Ticks off step and saves progress to session',
    action: 'COMPLETE_STEP',
    verb: 'Complete Step',
  },
  COMPARE: {
    id: 'zone-compare',
    label: 'Drop up to 3 options to compare',
    accepts: ['option'],
    hint: 'Opens side-by-side comparative inspection',
    action: 'COMPARE_OPTIONS',
    verb: 'Compare Options',
  },
  KEEP: {
    id: 'zone-keep',
    label: 'Drop Case File to pin in history',
    accepts: ['case-file', 'discarded-case'],
    hint: 'Pins case in permanent session archive or restores discarded case',
    action: 'KEEP_CASE',
    verb: 'Keep / Restore Case',
  },
  DISCARD: {
    id: 'zone-discard',
    label: 'Drop Case File to discard',
    accepts: ['case-file'],
    hint: 'Moves case to recently discarded tray (can restore to Keep)',
    action: 'DISCARD_CASE',
    verb: 'Discard Case',
  },
  EXPORT: {
    id: 'zone-export',
    label: 'Drop Case File to export summary',
    accepts: ['case-file'],
    hint: 'Copies summary text and opens print dialog',
    action: 'EXPORT_SUMMARY',
    verb: 'Export Summary',
  },

  // History Page (Archive Canvas)
  HISTORY_REOPEN: {
    id: 'zone-history-reopen',
    label: 'Drop history card to reopen & edit',
    accepts: ['history-card'],
    hint: 'Loads saved diagnosis back into the assessment workbench',
    action: 'REOPEN_HISTORY',
    verb: 'Reopen Case',
  },
  HISTORY_COMPARE: {
    id: 'zone-history-compare',
    label: 'Drop 2 history cards to compare',
    accepts: ['history-card'],
    hint: 'Inspect trade-offs between two past items',
    action: 'COMPARE_HISTORY',
    verb: 'Compare Cases',
  },
  HISTORY_DISCARD: {
    id: 'zone-history-discard',
    label: 'Drop history card to discard',
    accepts: ['history-card'],
    hint: 'Permanently removes record from session history',
    action: 'DISCARD_HISTORY',
    verb: 'Remove History Record',
  },
};

export const ZONES_LIST = Object.values(ZONES);

export function getZoneById(id) {
  return ZONES_LIST.find((z) => z.id === id) || null;
}

export function isZoneAccepting(zoneId, cardType) {
  const zone = getZoneById(zoneId);
  if (!zone) return false;
  return zone.accepts.includes(cardType);
}
