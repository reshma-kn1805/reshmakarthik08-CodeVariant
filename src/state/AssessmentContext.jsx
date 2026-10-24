import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import rulesData from '../data/rules.json';
import examplesData from '../data/examples.json';
import { APP_CONFIG } from '../config/app.config.js';
import { calculateDecision } from '../engine/scoring.js';

const STORAGE_KEY = 'fix_it_first_assessment_v2';
const HISTORY_KEY = 'fix_it_first_history_v2';

const DEFAULT_ASSESSMENT = {
  id: '',
  category: 'kitchen_appliance',
  itemName: 'Kitchen Appliance',
  itemId: '',
  customItemName: '',
  ageYears: 3,
  itemAgeYears: 3,
  faultId: 'ka_blender_coupler',
  customFault: '',
  problemText: 'Appliance power is on but mechanical rotation fails under normal load.',
  severity: 2, // 1: Mild, 2: Moderate, 3: High
  restCondition: 'good', // 'good' | 'fair' | 'poor'
  diyDifficulty: 'easy', // 'easy' | 'medium' | 'hard'
  repairCost: 180,
  replaceCost: 3500,
  safetyFlags: [],
  priorities: {
    money: 50,
    waste: 50,
    effort: 50,
  },
  safetyChecks: {},
  overrides: null,
};

const AssessmentContext = createContext(null);

export function AssessmentProvider({ children }) {
  // Assessment state from sessionStorage
  const [assessment, setAssessment] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_ASSESSMENT, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load from sessionStorage:', e);
    }
    return DEFAULT_ASSESSMENT;
  });

  // History list from sessionStorage
  const [history, setHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem(HISTORY_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load history from sessionStorage:', e);
    }
    return [];
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  // Sync assessment to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(assessment));
    } catch (e) {
      console.warn('Failed to persist assessment:', e);
    }
  }, [assessment]);

  // Sync history to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to persist history:', e);
    }
  }, [history]);

  // Compute decision result dynamically
  const decisionResult = useMemo(() => {
    try {
      return calculateDecision(assessment, rulesData, APP_CONFIG);
    } catch (err) {
      console.error('Error calculating decision:', err);
      return calculateDecision(DEFAULT_ASSESSMENT, rulesData, APP_CONFIG);
    }
  }, [assessment]);

  // Active selected option
  const activeSelectedOption = useMemo(() => {
    if (selectedOptionId) {
      const match = decisionResult.options.find(o => o.id === selectedOptionId);
      if (match) return match;
    }
    return decisionResult.winner;
  }, [selectedOptionId, decisionResult]);

  const updateAssessment = (partial) => {
    setAssessment(prev => ({
      ...prev,
      ...partial,
      priorities: {
        ...prev.priorities,
        ...(partial.priorities || {}),
      },
      safetyFlags: partial.safetyFlags !== undefined ? partial.safetyFlags : prev.safetyFlags,
    }));
  };

  /**
   * Save current assessment & decision result to session history
   */
  const saveCurrentToHistory = () => {
    const result = calculateDecision(assessment, rulesData, APP_CONFIG);
    const id = assessment.id || `eval_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const categoryObj = rulesData.categories.find(c => c.id === assessment.category);

    const historyEntry = {
      id,
      timestamp: new Date().toISOString(),
      dateStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      itemName: assessment.itemName || assessment.customItemName || categoryObj?.name || 'Assessed Item',
      category: categoryObj?.name || assessment.category,
      categoryId: assessment.category,
      faultName: assessment.problemText ? assessment.problemText.slice(0, 45) + '...' : 'Diagnosed issue',
      winner: result.winner.name,
      winnerId: result.winner.id,
      score: result.winner.score,
      savings: result.analytics.netSavings,
      carbon: result.winner.carbonSavedKg || 0,
      gated: result.gated,
      assessment: { ...assessment, id },
      decisionResult: result,
    };

    setHistory(prev => {
      // Remove any prior entry with exact same id or push to top
      const filtered = prev.filter(item => item.id !== id);
      return [historyEntry, ...filtered.slice(0, 19)]; // keep up to 20
    });

    setAssessment(prev => ({ ...prev, id }));
    return id;
  };

  /**
   * Load a scenario from examples.json or judgeDemos
   */
  const loadExample = (exampleId) => {
    const ex = examplesData.find(e => e.id === exampleId);
    if (ex) {
      const id = `ex_${ex.id}`;
      const newAssessment = {
        ...DEFAULT_ASSESSMENT,
        ...ex.assessment,
        id,
      };
      setAssessment(newAssessment);
      setSelectedOptionId(null);

      // Run and persist in history
      const result = calculateDecision(newAssessment, rulesData, APP_CONFIG);
      const historyEntry = {
        id,
        timestamp: new Date().toISOString(),
        dateStr: 'Example',
        itemName: ex.title,
        category: ex.assessment.category?.replace(/_/g, ' '),
        categoryId: ex.assessment.category,
        faultName: ex.subtitle,
        winner: result.winner.name,
        winnerId: result.winner.id,
        score: result.winner.score,
        savings: result.analytics.netSavings,
        carbon: result.winner.carbonSavedKg || 0,
        gated: result.gated,
        assessment: newAssessment,
        decisionResult: result,
      };

      setHistory(prev => [historyEntry, ...prev.filter(h => h.id !== id)]);
      return id;
    }

    // Fallback: check rulesData.judgeDemos
    const demo = rulesData.judgeDemos?.find(d => d.id === exampleId);
    if (demo) {
      const id = `demo_${demo.id}`;
      const newAssessment = {
        ...DEFAULT_ASSESSMENT,
        category: demo.category,
        itemName: demo.itemName,
        ageYears: demo.itemAgeYears || 3,
        itemAgeYears: demo.itemAgeYears || 3,
        faultId: demo.faultId,
        problemText: demo.subtitle || demo.highlightNote,
        replaceCost: demo.replaceCost || demo.originalPrice || 3500,
        repairCost: demo.repairCost !== undefined ? demo.repairCost : 250,
        safetyFlags: demo.safetyFlags || [],
        id,
      };
      setAssessment(newAssessment);
      setSelectedOptionId(null);
      return id;
    }

    return null;
  };

  const getHistoryItem = (id) => {
    return history.find(h => h.id === id) || null;
  };

  const deleteHistoryItem = (id) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      sessionStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      // ignore
    }
  };

  const resetAssessment = () => {
    setAssessment(DEFAULT_ASSESSMENT);
    setCurrentStep(1);
    setSelectedOptionId(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  const value = {
    assessment,
    updateAssessment,
    currentStep,
    setCurrentStep,
    decisionResult,
    selectedOption: activeSelectedOption,
    setSelectedOptionId,
    saveCurrentToHistory,
    loadExample,
    history,
    getHistoryItem,
    deleteHistoryItem,
    clearHistory,
    resetAssessment,
    rules: rulesData,
    examples: examplesData,
    config: APP_CONFIG,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return ctx;
}
