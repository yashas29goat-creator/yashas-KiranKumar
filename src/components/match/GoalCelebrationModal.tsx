import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Gauge, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { GoalWalkoutEvent, Team } from '../../types/football';
import { sound } from '../../utils/soundFx';

interface GoalCelebrationModalProps {
  goalEvent: GoalWalkoutEvent;
  homeTeam: Team;
  awayTeam: Team;
  onResume: () => void;
}

export const GoalCelebrationModal: React.FC<GoalCelebrationModalProps> = ({
  goalEvent,
  homeTeam,
  awayTeam,
  onResume,
}) => {
  const { scorer, team, minute, shotSpeedKmh, distanceMeters, executionStyle, scoreHome, scoreAway } = goalEvent;

  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#38bdf8', '#ef4444', '#10b981', '#ffffff'],
    });

    const timer = setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        origin: { x: 1 },
      });
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  const isHome = team === 'home';
  const scoringTeam = isHome ? homeTeam : awayTeam;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Light Burst Behind Card */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-red-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-md w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/60 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.35)] flex flex-col items-center text-center">
        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg mb-4">
          <Flame className="w-4 h-4" />
          <span>GOAL! MATCH PRESENTATION</span>
        </div>

        {/* Score Update Line */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{homeTeam.badge}</span>
            <span className="text-sm font-bold text-white uppercase">{homeTeam.shortCode}</span>
          </div>
          <div className="px-4 py-1 rounded-xl bg-slate-900 border border-slate-700 text-2xl font-black text-amber-400 tabular-nums">
            {scoreHome} - {scoreAway}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white uppercase">{awayTeam.shortCode}</span>
            <span className="text-2xl">{awayTeam.badge}</span>
          </div>
        </div>

        {/* Golden Hexagonal Prime Card */}
        <div className="relative w-44 h-60 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)] bg-gradient-to-b from-amber-500/30 via-slate-900 to-slate-950 mb-5 p-1 group">
          {/* Card Rarity Header */}
          <div className="absolute top-2 left-2 z-10 flex flex-col items-center bg-amber-500/90 text-slate-950 rounded-lg px-1.5 py-0.5 shadow-md">
            <span className="text-base font-black leading-none">{scorer.rating}</span>
            <span className="text-[10px] font-extrabold">{scorer.position}</span>
          </div>

          <div className="absolute top-2 right-2 z-10 text-xl shadow-sm">{scorer.flag}</div>

          {/* Photo */}
          <img
            src={scorer.photoUrl}
            alt={scorer.name}
            className="w-full h-44 object-cover object-top rounded-xl"
          />

          {/* Card Footer */}
          <div className="absolute bottom-1 inset-x-1 bg-slate-950/95 border border-amber-400/40 rounded-xl p-1.5 text-center">
            <span className="text-xs font-black text-amber-300 block truncate uppercase tracking-wider">
              {scorer.name}
            </span>
            <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-slate-300">
              <span>PAC {scorer.stats.pac}</span>
              <span>SHO {scorer.stats.sho}</span>
              <span>DRI {scorer.stats.dri}</span>
            </div>
          </div>
        </div>

        {/* Shot Metrics Panel */}
        <div className="w-full grid grid-cols-3 gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 mb-5">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
              <Gauge className="w-3 h-3 text-amber-400" />
              <span>Shot Speed</span>
            </div>
            <span className="text-sm font-black text-amber-400 mt-0.5">{shotSpeedKmh} km/h</span>
          </div>

          <div className="flex flex-col items-center border-x border-slate-800">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Distance</span>
            </div>
            <span className="text-sm font-black text-sky-400 mt-0.5">{distanceMeters} m</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
              <Trophy className="w-3 h-3 text-emerald-400" />
              <span>Minute</span>
            </div>
            <span className="text-sm font-black text-emerald-400 mt-0.5">{minute}'</span>
          </div>
        </div>

        {/* Execution Style */}
        <div className="mb-5 text-xs text-slate-300">
          Execution Style: <span className="font-bold text-amber-300">{executionStyle}</span>
        </div>

        {/* Continue Match Action Button */}
        <button
          onClick={() => {
            sound.playClick(850);
            onResume();
          }}
          className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-98 transition-all cursor-pointer"
        >
          <span>CONTINUE MATCH</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
