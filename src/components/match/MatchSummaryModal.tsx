import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Coins, Gem, RotateCcw, Trophy, ArrowRight, Home } from 'lucide-react';
import { MatchStatistics, PlayerCard, Team } from '../../types/football';
import { sound } from '../../utils/soundFx';

interface MatchSummaryModalProps {
  isHalfTime: boolean;
  score: { home: number; away: number };
  homeTeam: Team;
  awayTeam: Team;
  stats: { home: MatchStatistics; away: MatchStatistics };
  onContinue: () => void;
  onRematch: () => void;
  onExit: () => void;
  onAddRewards?: (coins: number, gems: number, xp: number) => void;
}

export const MatchSummaryModal: React.FC<MatchSummaryModalProps> = ({
  isHalfTime,
  score,
  homeTeam,
  awayTeam,
  stats,
  onContinue,
  onRematch,
  onExit,
  onAddRewards,
}) => {
  const isWin = score.home > score.away;
  const isDraw = score.home === score.away;

  // Pick MVP player (e.g. striker or top performer)
  const mvpPlayer: PlayerCard = isWin
    ? (homeTeam.players.find(p => p.position === 'ST') || homeTeam.players[0])
    : isDraw
    ? (homeTeam.players.find(p => p.position === 'CAM') || homeTeam.players[0])
    : (awayTeam.players.find(p => p.position === 'ST') || awayTeam.players[0]);

  useEffect(() => {
    if (!isHalfTime && isWin) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
      if (onAddRewards) {
        onAddRewards(2500, 75, 450);
      }
    } else if (!isHalfTime && onAddRewards) {
      onAddRewards(1200, 30, 250);
    }
  }, [isHalfTime, isWin, onAddRewards]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative max-w-xl w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
        {/* Title Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest mb-3">
          <Trophy className="w-4 h-4" />
          <span>{isHalfTime ? 'HALFTIME BREAK' : 'FULL TIME OFFICIAL RESULT'}</span>
        </div>

        {/* Result Banner */}
        <h2 className="text-2xl font-black text-white mb-4">
          {isHalfTime
            ? 'First Half Concluded'
            : isWin
            ? '🏆 VICTORY FOR YOUR SQUAD!'
            : isDraw
            ? '🤝 STALEMATE DRAW'
            : 'DEFEAT - FIGHT BACK NEXT TIME!'}
        </h2>

        {/* Score Bug */}
        <div className="flex items-center justify-center gap-6 mb-6 w-full max-w-md bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{homeTeam.badge}</span>
            <div className="text-left">
              <span className="text-sm font-extrabold text-white uppercase block">{homeTeam.name}</span>
              <span className="text-xs text-amber-400 font-bold">{homeTeam.rating} OVR</span>
            </div>
          </div>

          <div className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-3xl font-black text-amber-400 tabular-nums">
            {score.home} - {score.away}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-sm font-extrabold text-white uppercase block">{awayTeam.name}</span>
              <span className="text-xs text-sky-400 font-bold">{awayTeam.rating} OVR</span>
            </div>
            <span className="text-3xl">{awayTeam.badge}</span>
          </div>
        </div>

        {/* MVP Showcase (on Full Time) */}
        {!isHalfTime && (
          <div className="w-full bg-gradient-to-r from-slate-950 via-amber-950/20 to-slate-950 border border-amber-500/40 rounded-2xl p-3.5 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-14 rounded-xl overflow-hidden border border-amber-400 bg-slate-800">
                <img src={mvpPlayer.photoUrl} alt={mvpPlayer.name} className="w-full h-full object-cover object-top" />
                <div className="absolute top-0.5 left-0.5 bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded">
                  {mvpPlayer.rating}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-[10px] font-black text-amber-400 uppercase">
                  <Award className="w-3.5 h-3.5" />
                  <span>MAN OF THE MATCH</span>
                </div>
                <h4 className="text-sm font-black text-white">{mvpPlayer.name}</h4>
                <p className="text-xs text-slate-400">{mvpPlayer.club} • {mvpPlayer.nationality}</p>
              </div>
            </div>

            {/* Match Rewards */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-600/50 px-2.5 py-1 rounded-xl">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-amber-300">+{isWin ? '2,500' : '1,200'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-sky-950/60 border border-sky-600/50 px-2.5 py-1 rounded-xl">
                <Gem className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-black text-sky-300">+{isWin ? '75' : '30'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Stats Comparison */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6">
          <h4 className="text-xs font-bold uppercase text-slate-400 text-center mb-3">Match Performance Breakdown</h4>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between font-bold">
              <span className="text-amber-400">{stats.home.possession}%</span>
              <span className="text-slate-400">Possession</span>
              <span className="text-sky-400">{stats.away.possession}%</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-amber-400">{stats.home.shots}</span>
              <span className="text-slate-400">Total Shots</span>
              <span className="text-sky-400">{stats.away.shots}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-amber-400">{stats.home.xG.toFixed(2)}</span>
              <span className="text-slate-400">Expected Goals (xG)</span>
              <span className="text-sky-400">{stats.away.xG.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-amber-400">{stats.home.tacklesWon}</span>
              <span className="text-slate-400">Tackles Won</span>
              <span className="text-sky-400">{stats.away.tacklesWon}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full">
          {isHalfTime ? (
            <button
              onClick={() => {
                sound.playClick(800);
                onContinue();
              }}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>START 2ND HALF</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  sound.playClick(600);
                  onRematch();
                }}
                className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>REMATCH</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick(800);
                  onExit();
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>RETURN TO HUB</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
