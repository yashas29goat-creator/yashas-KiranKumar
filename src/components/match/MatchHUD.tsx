import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Camera,
  CloudRain,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Sun,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { CameraMode, MatchPlayer, PitchEmote, TacticMode, Team, WeatherMode } from '../../types/football';
import { EngineState } from '../../utils/matchEngine';
import { sound } from '../../utils/soundFx';

interface MatchHUDProps {
  engineState: EngineState;
  homeTeam: Team;
  awayTeam: Team;
  cameraMode: CameraMode;
  onCameraChange: (cam: CameraMode) => void;
  onTacticChange: (tactic: TacticMode) => void;
  onWeatherChange: (w: WeatherMode) => void;
  onTogglePlay: () => void;
  onRestart: () => void;
  onTriggerEmote: (emoji: string) => void;
  onExitMatch: () => void;
}

export const MatchHUD: React.FC<MatchHUDProps> = ({
  engineState,
  homeTeam,
  awayTeam,
  cameraMode,
  onCameraChange,
  onTacticChange,
  onWeatherChange,
  onTogglePlay,
  onRestart,
  onTriggerEmote,
  onExitMatch,
}) => {
  const [showStatsDrawer, setShowStatsDrawer] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const { score, timeSeconds, stoppageTime, controlledPlayerId, players, tactics, weather, stats, commentary } = engineState;
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = Math.floor(timeSeconds % 60);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const controlledPlayer = players.find(p => p.id === controlledPlayerId);

  const handleMuteToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const EMOTES = ['🔥', '👑', '⚡', '⚽', '👏', '🛡️'];

  return (
    <>
      {/* ================= TOP BROADCAST SCOREBOARD BUG ================= */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center select-none">
        {/* Top Scoreboard Container */}
        <div className="flex items-center bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-2xl backdrop-blur-md gap-3">
          {/* Home Team */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{homeTeam.badge}</span>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black tracking-wider text-white uppercase">{homeTeam.shortCode}</span>
                <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {homeTeam.rating}
                </span>
              </div>
            </div>
          </div>

          {/* Score Counter */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-xl font-black text-amber-400 tabular-nums">{score.home}</span>
            <span className="text-xs text-slate-500 font-bold">-</span>
            <span className="text-xl font-black text-sky-400 tabular-nums">{score.away}</span>
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  {awayTeam.rating}
                </span>
                <span className="text-xs font-black tracking-wider text-white uppercase">{awayTeam.shortCode}</span>
              </div>
            </div>
            <span className="text-xl">{awayTeam.badge}</span>
          </div>

          {/* Match Clock & Stoppage */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-200 tabular-nums">{formattedTime}</span>
            {minutes >= 45 && minutes < 48 && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1 rounded border border-amber-700/50">
                +{stoppageTime}'
              </span>
            )}
            {minutes >= 90 && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1 rounded border border-amber-700/50">
                +{stoppageTime}'
              </span>
            )}
          </div>
        </div>

        {/* 3-Way Tactical Mode Switcher & In-Game Quick Controls */}
        <div className="mt-1.5 flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-full backdrop-blur-sm text-[10px] font-bold">
          {/* Tactical Switcher */}
          <span className="text-slate-400 uppercase text-[9px] mr-1">Tactic:</span>
          {(['DEF', 'BAL', 'ATT'] as TacticMode[]).map(t => (
            <button
              key={t}
              onClick={() => {
                onTacticChange(t);
                sound.playClick(650);
              }}
              className={`px-2 py-0.5 rounded transition-all ${
                tactics.home === t
                  ? t === 'DEF'
                    ? 'bg-blue-600 text-white font-extrabold shadow-[0_0_8px_#3b82f6]'
                    : t === 'ATT'
                    ? 'bg-red-600 text-white font-extrabold shadow-[0_0_8px_#ef4444]'
                    : 'bg-amber-500 text-slate-950 font-extrabold shadow-[0_0_8px_#f59e0b]'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              {t === 'DEF' ? 'DEF' : t === 'ATT' ? 'ATT' : 'BAL'}
            </button>
          ))}

          <span className="w-px h-3 bg-slate-800 mx-1" />

          {/* Camera Selector */}
          <button
            onClick={() => {
              const modes: CameraMode[] = ['broadcast', 'action', 'topdown'];
              const nextIdx = (modes.indexOf(cameraMode) + 1) % modes.length;
              onCameraChange(modes[nextIdx]);
              sound.playClick(700);
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
            title="Switch camera angle"
          >
            <Camera className="w-3 h-3 text-amber-400" />
            <span className="capitalize">{cameraMode}</span>
          </button>

          {/* Weather Toggle */}
          <button
            onClick={() => {
              const weathers: WeatherMode[] = ['night_floodlights', 'sunny', 'rain_slick'];
              const nextIdx = (weathers.indexOf(weather) + 1) % weathers.length;
              onWeatherChange(weathers[nextIdx]);
              sound.playClick(750);
            }}
            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
            title="Toggle weather"
          >
            {weather === 'night_floodlights' ? (
              <Moon className="w-3 h-3 text-indigo-400" />
            ) : weather === 'sunny' ? (
              <Sun className="w-3 h-3 text-amber-400" />
            ) : (
              <CloudRain className="w-3 h-3 text-sky-400" />
            )}
          </button>

          {/* Stats Drawer Toggle */}
          <button
            onClick={() => setShowStatsDrawer(!showStatsDrawer)}
            className={`p-1 rounded ${showStatsDrawer ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
            title="Match statistics"
          >
            <BarChart3 className="w-3 h-3" />
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={handleMuteToggle}
            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
          </button>

          {/* Pause / Play */}
          <button
            onClick={onTogglePlay}
            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
            title={engineState.isPlaying ? 'Pause match' : 'Resume match'}
          >
            {engineState.isPlaying ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
          </button>

          {/* Exit Match */}
          <button
            onClick={onExitMatch}
            className="px-2 py-0.5 rounded bg-red-950/60 border border-red-800/80 text-red-300 hover:bg-red-900"
          >
            Exit
          </button>
        </div>
      </div>

      {/* ================= COMMENTARY TICKER ================= */}
      {commentary.length > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-lg w-11/12">
          <div className="bg-slate-950/85 border border-amber-500/30 rounded-lg px-3 py-1 shadow-lg backdrop-blur-sm flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-700/60 shrink-0">
              {commentary[0].minute}'
            </span>
            <p className="text-xs font-medium text-slate-100 truncate">{commentary[0].text}</p>
          </div>
        </div>
      )}

      {/* ================= ACTIVE CONTROLLED PLAYER CARD HUD ================= */}
      {controlledPlayer && (
        <div className="absolute bottom-4 left-44 z-20 hidden md:flex items-center gap-2.5 bg-slate-950/90 border border-amber-500/40 rounded-2xl p-2 shadow-2xl backdrop-blur-md pointer-events-none">
          {/* Card Portrait */}
          <div className="relative w-12 h-14 rounded-xl overflow-hidden border border-amber-400/60 bg-gradient-to-b from-amber-600/30 to-slate-900 flex items-center justify-center">
            <img
              src={controlledPlayer.photoUrl}
              alt={controlledPlayer.name}
              className="w-full h-full object-cover object-top"
            />
            {/* 123 OVR Gold Shield */}
            <div className="absolute top-0.5 left-0.5 bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded shadow-sm">
              {controlledPlayer.rating}
            </div>
            <div className="absolute bottom-0.5 right-0.5 bg-slate-950/90 text-white text-[8px] font-bold px-1 rounded">
              {controlledPlayer.position}
            </div>
          </div>

          {/* Player Info & Stamina Bar */}
          <div className="flex flex-col gap-1 min-w-[110px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white leading-tight">{controlledPlayer.shortName}</span>
              <span className="text-[10px]">{controlledPlayer.flag}</span>
            </div>
            {/* Stamina Meter */}
            <div className="flex items-center gap-1.5">
              <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${controlledPlayer.stamina}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-400"
                />
              </div>
              <span className="text-[8px] font-bold text-slate-400">STA</span>
            </div>
            {/* Speed & Shot stats */}
            <div className="flex items-center gap-2 text-[9px] font-bold text-amber-300">
              <span>PAC {controlledPlayer.stats.pac}</span>
              <span>SHO {controlledPlayer.stats.sho}</span>
              <span>DRI {controlledPlayer.stats.dri}</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= INTERACTIVE PITCH EMOTES FLOATING BAR ================= */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-slate-950/85 border border-slate-800 rounded-full px-3 py-1 backdrop-blur-md shadow-xl">
        <span className="text-[9px] font-bold uppercase text-slate-400 mr-1 hidden sm:inline">Emotes:</span>
        {EMOTES.map(emoji => (
          <button
            key={emoji}
            onClick={() => {
              onTriggerEmote(emoji);
              sound.playClick(900);
            }}
            className="text-lg hover:scale-125 active:scale-90 transition-transform p-1 rounded-full hover:bg-slate-800"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* ================= MATCH STATISTICS DRAWER ================= */}
      {showStatsDrawer && (
        <div className="absolute top-16 right-4 z-40 w-80 bg-slate-950/95 border border-slate-700 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Live Match Statistics</h3>
            </div>
            <button
              onClick={() => setShowStatsDrawer(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Teams Header */}
          <div className="flex items-center justify-between py-2 text-xs font-bold">
            <span className="text-amber-400">{homeTeam.shortCode}</span>
            <span className="text-slate-400">METRIC</span>
            <span className="text-sky-400">{awayTeam.shortCode}</span>
          </div>

          {/* Stats Rows */}
          <div className="flex flex-col gap-2.5 text-xs font-medium">
            {/* Possession */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-bold text-amber-400">{stats.home.possession}%</span>
                <span className="text-slate-400">Possession</span>
                <span className="font-bold text-sky-400">{stats.away.possession}%</span>
              </div>
              <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-800">
                <div style={{ width: `${stats.home.possession}%` }} className="bg-amber-500" />
                <div style={{ width: `${stats.away.possession}%` }} className="bg-sky-500" />
              </div>
            </div>

            {/* Total Shots */}
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="font-bold text-amber-400">{stats.home.shots}</span>
              <span className="text-slate-400">Total Shots</span>
              <span className="font-bold text-sky-400">{stats.away.shots}</span>
            </div>

            {/* Shots on Target */}
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="font-bold text-amber-400">{stats.home.shotsOnTarget}</span>
              <span className="text-slate-400">Shots on Target</span>
              <span className="font-bold text-sky-400">{stats.away.shotsOnTarget}</span>
            </div>

            {/* Expected Goals (xG) */}
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="font-bold text-amber-400">{stats.home.xG.toFixed(2)}</span>
              <span className="text-slate-400">Expected Goals (xG)</span>
              <span className="font-bold text-sky-400">{stats.away.xG.toFixed(2)}</span>
            </div>

            {/* Passes Completed */}
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="font-bold text-amber-400">{stats.home.passesCompleted}</span>
              <span className="text-slate-400">Passes Completed</span>
              <span className="font-bold text-sky-400">{stats.away.passesCompleted}</span>
            </div>

            {/* Tackles Won */}
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="font-bold text-amber-400">{stats.home.tacklesWon}</span>
              <span className="text-slate-400">Tackles Won</span>
              <span className="font-bold text-sky-400">{stats.away.tacklesWon}</span>
            </div>

            {/* Saves */}
            <div className="flex justify-between py-1">
              <span className="font-bold text-amber-400">{stats.home.saves}</span>
              <span className="text-slate-400">Goalkeeper Saves</span>
              <span className="font-bold text-sky-400">{stats.away.saves}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
