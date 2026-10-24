import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import rulesData from '../data/rules.json';
import { APP_CONFIG } from '../config/app.config.js';
import { calculateDecision } from '../engine/scoring.js';

const STORAGE_KEY = 'fix_it_first_assessment_v1';

const DEFAULT_ASSESSMENT = {
  category: 'small_appliances',
  itemId: 'toaster',
  customItemName: '',
  itemAgeYears: 2,
  itemCondition: 'good',
  originalPrice: 45,
  faultId: 'lever_wont_latch',
  customFault: '',
  severity: 'mild',
  userSkill: 2,
  hasBasicTools: true,
  timeAvailable: 'afternoon',
  safetyChecks: {
    sparks: false,
    batteryBulge: false,
    waterDamage: false,
  },
  overrides: null,
};

const AssessmentContext = createContext(null);

export function AssessmentProvider({ children }) {
  // Initialize from sessionStorage to survive browser refresh
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

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  // Sync to sessionStorage on changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(assessment));
    } catch (e) {
      console.warn('Failed to persist assessment:', e);
    }
  }, [assessment]);

  // Compute decision matrix dynamically via pure engine
  const decisionResult = useMemo(() => {
    try {
      return calculateDecision(assessment, rulesData, APP_CONFIG);
    } catch (err) {
      console.error('Error calculating decision:', err);
      // Fallback safe result
      return calculateDecision(DEFAULT_ASSESSMENT, rulesData, APP_CONFIG);
    }
  }, [assessment]);

  // Automatically keep selectedOptionId in sync with winner if not explicitly set
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
      safetyChecks: {
        ...prev.safetyChecks,
        ...(partial.safetyChecks || {}),
      },
    }));
  };

  const loadDemo = (demoId) => {
    const demo = rulesData.judgeDemos?.find(d => d.id === demoId);
    if (!demo) return;

    setAssessment({
      category: demo.category,
      itemId: demo.itemId,
      customItemName: '',
      itemAgeYears: demo.itemAgeYears || 2,
      itemCondition: 'good',
      originalPrice: demo.originalPrice,
      faultId: demo.faultId,
      customFault: '',
      severity: rulesData.faults[demo.faultId]?.severity || 'moderate',
      userSkill: demo.userSkill || 2,
      hasBasicTools: demo.hasBasicTools ?? true,
      timeAvailable: demo.timeAvailable || 'afternoon',
      safetyChecks: {
        sparks: demo.faultId === 'sparks_inside',
        batteryBulge: demo.faultId === 'swollen_battery',
        waterDamage: demo.faultId === 'leaking_base',
      },
      overrides: null,
    });
    setSelectedOptionId(null);
  };

  const applyOverrides = (newOverrides) => {
    setAssessment(prev => ({
      ...prev,
      overrides: {
        ...(prev.overrides || {}),
        ...newOverrides,
      },
    }));
  };

  const resetOverrides = () => {
    setAssessment(prev => ({
      ...prev,
      overrides: null,
    }));
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
    loadDemo,
    applyOverrides,
    resetOverrides,
    resetAssessment,
    rules: rulesData,
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
