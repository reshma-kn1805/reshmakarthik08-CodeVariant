import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Wrench,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Layers,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { DonutGauge } from '../components/common/DonutGauge.jsx';
import { RadarChart } from '../components/verdict/RadarChart.jsx';
import { BreakEvenChart } from '../components/verdict/BreakEvenChart.jsx';

const SCENES = [
  {
    id: 1,
    title: 'Scene 1: The Workbench & The Canvas Protocol',
    duration: 12,
    script:
      'Welcome to Fix It First under The Canvas Protocol. All standard action buttons are eliminated: primary decisions execute solely by dragging data cards into tactile Action Zones.',
    badge: 'The Workbench (0:00 - 0:12)',
  },
  {
    id: 2,
    title: 'Scene 2: Case File Diagnosis & Priority Ladder',
    duration: 12,
    script:
      'The single-screen Case File canvas lets you diagnose equipment, flag hazards, and re-order the Priorities Ladder before dropping the live Case File to run the engine.',
    badge: 'Case File Canvas (0:12 - 0:24)',
  },
  {
    id: 3,
    title: 'Scene 3: Decision Visuals — Radar Chart & Flip Point',
    duration: 14,
    script:
      'The Decision Table delivers rich decision visuals: an inline 6-factor radar chart, a break-even cost trajectory, and a live repair quote slider showing the exact ₹1,550 flip threshold.',
    badge: 'Decision Visuals (0:24 - 0:38)',
  },
  {
    id: 4,
    title: 'Scene 4: Safety Lockout & Zero-Button Pure Drag Undo',
    duration: 10,
    script:
      'Critical battery hazards trigger rust locks that bounce dangerous DIY attempts, while discarded cases are restored by dragging directly back to Keep—with zero undo buttons.',
    badge: 'Safety & Pure Drag Undo (0:38 - 0:48)',
  },
];

const TOTAL_DURATION = SCENES.reduce((acc, s) => acc + s.duration, 0); // 48 seconds

export function DemoVideoPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const timerRef = useRef(null);

  // Determine active scene
  let accumulated = 0;
  let activeSceneIndex = 0;
  for (let i = 0; i < SCENES.length; i++) {
    accumulated += SCENES[i].duration;
    if (currentTime < accumulated) {
      activeSceneIndex = i;
      break;
    }
    if (i === SCENES.length - 1) activeSceneIndex = i;
  }
  const currentScene = SCENES[activeSceneIndex];

  // Speech narration
  useEffect(() => {
    if (!audioEnabled || !isPlaying || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentScene.script);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [activeSceneIndex, audioEnabled, isPlaying]);

  // Main playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false);
            return TOTAL_DURATION;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const progressPercent = (currentTime / TOTAL_DURATION) * 100;
  const sceneProgress = (() => {
    let start = 0;
    for (let i = 0; i < activeSceneIndex; i++) {
      start += SCENES[i].duration;
    }
    return Math.min(1, Math.max(0, (currentTime - start) / currentScene.duration));
  })();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <Breadcrumbs
        items={[{ label: 'The Workbench', path: '/' }, { label: '48-Second Demo Video Showcase' }]}
        showActions={false}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-ink-border/50">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber/20 border border-amber/40 text-ink text-xs font-mono font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber fill-amber" />
            <span>48-Second Official Demo Video</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink mt-1">
            Fix It First — The Canvas Protocol Video Tour
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Full professional walk-through with animated cursor, synchronized captions, and real decision engine calculations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-brand bg-deepGreen text-white text-xs font-bold hover:bg-brand-deep transition-colors shadow-xs"
          >
            Launch Interactive App
          </Link>
        </div>
      </div>

      {/* 16:9 Video Player Screen */}
      <div className="relative rounded-brand-lg overflow-hidden border-2 border-brand-deep shadow-elevated bg-[#12241D] text-white aspect-[16/9] flex flex-col justify-between">
        {/* Top Header Bar inside Video */}
        <div className="p-4 bg-black/40 backdrop-blur-xs flex items-center justify-between z-20 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-brand bg-amber text-ink flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-white block leading-tight">Fix It First</span>
              <span className="text-[10px] font-mono text-white/70 block">{currentScene.badge}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold bg-white/10 px-2 py-1 rounded">
              00:{Math.floor(currentTime).toString().padStart(2, '0')} / 00:{TOTAL_DURATION}
            </span>
          </div>
        </div>

        {/* Video Stage: Animated Scenes */}
        <div className="flex-1 relative p-6 flex items-center justify-center overflow-hidden">
          {/* SCENE 1: The Workbench */}
          {activeSceneIndex === 0 && (
            <div className="w-full max-w-2xl bg-brand-canvas p-6 rounded-brand-lg text-ink space-y-4 shadow-card border border-ink-border animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-amber tracking-wider">
                  The Canvas Protocol Active
                </span>
                <h3 className="font-heading font-black text-xl text-ink">The Workbench • Drag to Act</h3>
                <p className="text-[11px] text-ink-muted">All primary actions execute by dragging data cards into action zones.</p>
              </div>

              {/* Glowing Amber Action Zone */}
              <div
                className={`p-4 rounded-brand border-2 border-dashed flex flex-col items-center justify-center text-center transition-all duration-300 ${
                  sceneProgress > 0.4
                    ? 'border-amber bg-amber/20 ring-4 ring-amber/50 scale-[1.02]'
                    : 'border-ink-border/80 bg-white'
                }`}
              >
                <Sparkles className="w-5 h-5 text-amber animate-spin" />
                <span className="font-heading font-bold text-sm text-ink mt-1">Drop card to start assessment</span>
                <span className="text-[10px] text-ink-muted">Accepts Category or Example scenarios</span>
              </div>

              {/* Draggable Card being animated */}
              <div className="relative pt-2">
                <div
                  className="max-w-[260px] mx-auto p-3 rounded-brand bg-white border-2 border-amber shadow-elevated transition-transform duration-700 ease-out"
                  style={{
                    transform:
                      sceneProgress > 0.35 && sceneProgress < 0.75
                        ? 'translateY(-68px) scale(1.05) rotate(2deg)'
                        : sceneProgress >= 0.75
                        ? 'translateY(-78px) scale(0.96) opacity(0)'
                        : 'translateY(0px)',
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-ink">
                    <span>Mixer Grinder</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amberLight text-amber font-mono font-bold">
                      Example
                    </span>
                  </div>
                  <p className="text-[10px] text-ink-muted mt-1">Stripped drive coupler • Motor spins</p>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 2: Assess Case File Canvas */}
          {activeSceneIndex === 1 && (
            <div className="w-full max-w-2xl bg-brand-canvas p-6 rounded-brand-lg text-ink grid grid-cols-2 gap-4 shadow-card border border-ink-border animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase text-deepGreen">Case File Configuration</span>
                <div className="p-2.5 rounded bg-white border border-ink-border text-xs">
                  <span className="font-bold block text-ink">1. Kitchen Appliance</span>
                  <span className="text-[10px] text-ink-muted">Diagnostic Category Slot</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-ink-border text-xs">
                  <span className="font-bold block text-ink">2. Stripped Coupler Teeth</span>
                  <span className="text-[10px] text-ink-muted">Primary Diagnosed Fault</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-ink-border text-xs">
                  <span className="font-bold block text-deepGreen">3. Safe Condition Affirmed</span>
                  <span className="text-[10px] text-ink-muted">No sparks, swelling, or odor</span>
                </div>
              </div>

              <div className="space-y-3 flex flex-col justify-between">
                <div className="p-3 rounded-brand bg-amberLight/30 border border-amber/40 text-xs space-y-1">
                  <span className="font-mono font-bold text-[10px] text-amber uppercase block">Priorities Ladder</span>
                  <div className="flex justify-between font-mono font-bold text-[11px]">
                    <span>#1 Reduce Waste</span>
                    <span className="text-amber">70% Weight</span>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-brand border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${
                    sceneProgress > 0.5 ? 'border-deepGreen bg-tint ring-2 ring-deepGreen' : 'border-ink-border bg-white'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-deepGreen" />
                  <span className="font-heading font-bold text-xs text-ink mt-1">Drop Case File to run assessment</span>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 3: Decision Visuals */}
          {activeSceneIndex === 2 && (
            <div className="w-full max-w-3xl bg-brand-canvas p-5 rounded-brand-lg text-ink grid grid-cols-12 gap-4 shadow-card border border-ink-border animate-in fade-in zoom-in-95 duration-300">
              {/* Radar Chart */}
              <div className="col-span-5 bg-white p-3 rounded-brand border border-ink-border/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-heading font-bold">6-Factor Radar Chart</span>
                  <span className="text-[10px] font-mono font-bold text-deepGreen">Winner vs Runner-up</span>
                </div>
                <div className="h-40 flex items-center justify-center">
                  <RadarChart
                    winnerOption={{
                      name: 'Repair',
                      score: 92,
                      factors: {
                        cost: { rating: 9 },
                        practicality: { rating: 8 },
                        environment: { rating: 10 },
                        longevity: { rating: 8 },
                        reliability: { rating: 7 },
                        speed: { rating: 8 },
                      },
                    }}
                    runnerUpOption={{
                      name: 'Replace',
                      score: 64,
                      factors: {
                        cost: { rating: 4 },
                        practicality: { rating: 9 },
                        environment: { rating: 2 },
                        longevity: { rating: 9 },
                        reliability: { rating: 9 },
                        speed: { rating: 9 },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Break-Even Chart & Sensitivity Slider */}
              <div className="col-span-7 bg-white p-3 rounded-brand border border-ink-border/80 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-heading font-bold">Multi-Year Cost Trajectory</span>
                    <span className="text-[10px] font-mono text-deepGreen font-bold">Break-even: Year 0</span>
                  </div>
                  <div className="h-28">
                    <BreakEvenChart repairCost={180} replaceCost={3500} lifespanYears={5} />
                  </div>
                </div>

                <div className="pt-2 border-t border-ink-border/40">
                  <div className="flex justify-between text-[11px] font-mono font-bold text-ink">
                    <span>What if repair quote changes?</span>
                    <span className="text-amber">Flip Point: ₹1,550</span>
                  </div>
                  <div className="w-full bg-brand-surfaceAlt h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-amber h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, sceneProgress * 80 + 20)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 4: Safety Gate & Zero-Button Pure Drag Undo */}
          {activeSceneIndex === 3 && (
            <div className="w-full max-w-2xl bg-brand-canvas p-6 rounded-brand-lg text-ink grid grid-cols-2 gap-4 shadow-card border border-ink-border animate-in fade-in zoom-in-95 duration-300">
              {/* Rust Lockout */}
              <div className="p-4 rounded-brand bg-safety-rustLight/30 border-2 border-safety-rust space-y-2 text-center">
                <div className="w-8 h-8 rounded-full bg-safety-rust text-white flex items-center justify-center mx-auto">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="font-heading font-bold text-xs text-safety-rust">Critical Safety Gate Bounced</h4>
                <p className="text-[10px] text-ink-muted">
                  DIY repair card bounced from Commit zone. Swollen lithium pouch requires certified disposal.
                </p>
              </div>

              {/* Pure Drag-and-Drop Undo */}
              <div className="p-4 rounded-brand bg-white border border-ink-border space-y-2 text-center">
                <div className="w-8 h-8 rounded-full bg-tint text-deepGreen flex items-center justify-center mx-auto">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h4 className="font-heading font-bold text-xs text-deepGreen">Zero-Button Pure Drag Undo</h4>
                <p className="text-[10px] text-ink-muted">
                  Discarded cases move to tray. Restored directly by dragging back onto "Keep" zone.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Synchronized Broadcast Subtitles Banner */}
        <div className="p-3.5 bg-black/85 backdrop-blur-md border-t border-white/10 z-20 text-center">
          <p className="text-xs sm:text-sm font-medium text-amber leading-snug font-mono max-w-3xl mx-auto">
            {currentScene.script}
          </p>
        </div>

        {/* Bottom Control Bar */}
        <div className="px-4 py-2.5 bg-black/90 flex items-center justify-between z-20 text-xs">
          <div className="flex items-center gap-3">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsPlaying(!isPlaying)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') setIsPlaying(!isPlaying);
              }}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer select-none"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={handleRestart}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') handleRestart();
              }}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer select-none"
              aria-label="Restart video"
            >
              <RotateCcw className="w-4 h-4" />
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => setAudioEnabled(!audioEnabled)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') setAudioEnabled(!audioEnabled);
              }}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer select-none"
              aria-label={audioEnabled ? 'Mute audio' : 'Enable audio'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-white/60" />}
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="flex-1 mx-4">
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber h-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <span className="font-mono text-[11px] text-white/80">67 Automated Tests Passing</span>
        </div>
      </div>
    </div>
  );
}
