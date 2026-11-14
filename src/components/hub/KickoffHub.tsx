import React, { useState } from 'react';
import {
  CloudRain,
  Compass,
  Gamepad2,
  Moon,
  Play,
  Shield,
  Sparkles,
  Sun,
  Swords,
  Trophy,
  Users,
  Volume2,
  Zap,
} from 'lucide-react';
import { DifficultyLevel, FormationType, PlayerCard, Team, WeatherMode } from '../../types/football';
import { sound } from '../../utils/soundFx';

import coverArtImage from '../../assets/images/football_cover_art_1787320254947.jpg';
import tunnelWalkoutImage from '../../assets/images/stadium_tunnel_walkout_1787320430503.jpg';

interface KickoffHubProps {
  homeTeam: Team;
  awayTeam: Team;
  weather: WeatherMode;
  difficulty: DifficultyLevel;
  onWeatherChange: (w: WeatherMode) => void;
  onDifficultyChange: (d: DifficultyLevel) => void;
  onFormationChange: (f: FormationType) => void;
  onLaunchMatch: () => void;
  onInspectPlayer: (player: PlayerCard) => void;
}

export const KickoffHub: React.FC<KickoffHubProps> = ({
  homeTeam,
  awayTeam,
  weather,
  difficulty,
  onWeatherChange,
  onDifficultyChange,
  onFormationChange,
  onLaunchMatch,
  onInspectPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'matchup' | 'lineup' | 'tunnel' | 'controls'>('matchup');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerCard | null>(homeTeam.players[0] || null);

  const FORMATIONS: FormationType[] = ['4-3-3', '4-2-3-1', '3-5-2', '4-4-2'];
  const DIFFICULTIES: DifficultyLevel[] = ['Semi-Pro', 'World Class', 'Prime 123'];

  // Squad Chemistry calculation (simplified high chemistry 33/33)
  const chemistry = 33;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* ================= HERO MATCHDAY STADIUM COVER BANNER ================= */}
      <div className="relative w-full h-64 md:h-72 overflow-hidden border-b border-amber-500/30">
        {/* Stadium Background Image */}
        <img
          src={coverArtImage}
          alt="Champions Arena Game Cover"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Dark & Gold Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950" />

        {/* Stadium Floodlight Visual Beams */}
        <div className="absolute top-0 left-1/4 w-32 h-64 bg-amber-400/10 rotate-12 blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-32 h-64 bg-sky-400/10 -rotate-12 blur-2xl pointer-events-none" />

        {/* Content Container */}
        <div className="relative max-w-6xl mx-auto h-full px-4 flex flex-col justify-between py-6">
          {/* Top Live Attendance & Cup Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/40 rounded-full px-3 py-1 backdrop-blur-md">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                CHAMPIONS ARENA MOBILE CUP • GRAND FINAL
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700/80 rounded-full px-3 py-1 backdrop-blur-md text-xs font-bold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Attendance: 84,200 (Sold Out)</span>
            </div>
          </div>

          {/* Center Match Clash Lineup */}
          <div className="flex items-center justify-between max-w-3xl mx-auto w-full my-auto">
            {/* Home Team */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                {homeTeam.badge}
              </div>
              <div>
                <span className="text-xl md:text-2xl font-black text-white block uppercase tracking-wide">
                  {homeTeam.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-400 bg-amber-950/80 border border-amber-600/50 px-2 py-0.5 rounded-full">
                    {homeTeam.rating} PRIME OVR
                  </span>
                  <span className="text-xs text-slate-400">Home Kit</span>
                </div>
              </div>
            </div>

            {/* VS Crest */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-black text-amber-400 shadow-inner">
                VS
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">90 MIN + ET</span>
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-4 flex-row-reverse text-right">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-900 to-slate-900 border-2 border-sky-400 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(56,189,248,0.4)]">
                {awayTeam.badge}
              </div>
              <div>
                <span className="text-xl md:text-2xl font-black text-white block uppercase tracking-wide">
                  {awayTeam.name}
                </span>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs text-slate-400">Away Kit</span>
                  <span className="text-xs font-black text-sky-400 bg-sky-950/80 border border-sky-600/50 px-2 py-0.5 rounded-full">
                    {awayTeam.rating} PRIME OVR
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hub Navigation Tabs */}
          <div className="flex items-center justify-center gap-2">
            {[
              { id: 'matchup', label: 'Matchup & Tactics', icon: Swords },
              { id: 'lineup', label: 'Starting XI Lineup', icon: Users },
              { id: 'tunnel', label: 'Tunnel Walkout', icon: Sparkles },
              { id: 'controls', label: 'Controls Guide', icon: Gamepad2 },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    sound.playClick(700);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= TAB 1: MATCHUP & TACTICS ================= */}
      {activeTab === 'matchup' && (
        <div className="max-w-6xl mx-auto w-full px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Match Settings */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-black uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <h3>Match Environment</h3>
            </div>

            {/* Stadium Weather */}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">Stadium Atmosphere & Weather</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'night_floodlights', label: 'Night Lights', icon: Moon },
                  { id: 'sunny', label: 'Sunny Turf', icon: Sun },
                  { id: 'rain_slick', label: 'Rain Slick', icon: CloudRain },
                ].map(w => {
                  const Icon = w.icon;
                  const active = weather === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        onWeatherChange(w.id as WeatherMode);
                        sound.playClick(650);
                      }}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                        active
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px]">{w.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Match Difficulty */}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">AI Difficulty Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => {
                      onDifficultyChange(d);
                      sound.playClick(680);
                    }}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold text-center transition-all ${
                      difficulty === d
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Formation Selector */}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2">Squad Formation</label>
              <div className="grid grid-cols-4 gap-1.5">
                {FORMATIONS.map(f => (
                  <button
                    key={f}
                    onClick={() => {
                      onFormationChange(f);
                      sound.playClick(720);
                    }}
                    className={`py-1.5 rounded-xl border text-xs font-black text-center transition-all ${
                      homeTeam.formation === f
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Head to Head Comparison */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-black uppercase tracking-wider">
              <Swords className="w-4 h-4" />
              <h3>Head-to-Head Comparison</h3>
            </div>

            <div className="flex flex-col gap-3 text-xs font-bold">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span className="text-amber-400 font-black">123 (Attack 124)</span>
                  <span>Squad Overall</span>
                  <span className="text-sky-400 font-black">122 (Attack 123)</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-slate-950">
                  <div className="bg-amber-500 w-1/2" />
                  <div className="bg-sky-500 w-1/2" />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Team Chemistry</span>
                  <span className="text-emerald-400 font-black">33 / 33 Max Synergized</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tactical Gameplan</span>
                  <span className="text-amber-400 font-black">High Pressing Possession</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stadium Capacity</span>
                  <span className="text-white font-black">84,200 Champions Arena</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Featured Superstar Spotlight */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-5 flex flex-col items-center text-center shadow-xl">
            <div className="inline-flex items-center gap-1 text-[10px] font-black text-amber-400 bg-amber-950/80 border border-amber-700/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
              <Zap className="w-3 h-3" />
              <span>CAPTAIN & KEY PLAYER</span>
            </div>

            {homeTeam.players[9] && (
              <>
                <div className="relative w-36 h-48 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] my-2">
                  <img
                    src={homeTeam.players[9].photoUrl}
                    alt={homeTeam.players[9].name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 text-xs font-black px-1.5 py-0.5 rounded">
                    {homeTeam.players[9].rating}
                  </div>
                  <div className="absolute bottom-1 right-1 text-lg">{homeTeam.players[9].flag}</div>
                </div>

                <h4 className="text-base font-black text-white uppercase">{homeTeam.players[9].name}</h4>
                <p className="text-xs text-amber-400 font-bold">{homeTeam.players[9].position} • {homeTeam.players[9].club}</p>

                <div className="w-full grid grid-cols-3 gap-1 mt-3 text-[10px] font-bold bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div>PAC <span className="text-amber-400">{homeTeam.players[9].stats.pac}</span></div>
                  <div>SHO <span className="text-amber-400">{homeTeam.players[9].stats.sho}</span></div>
                  <div>DRI <span className="text-amber-400">{homeTeam.players[9].stats.dri}</span></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: STARTING XI LINEUP & FORMATION ================= */}
      {activeTab === 'lineup' && (
        <div className="max-w-6xl mx-auto w-full px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pitch Formation Board (2 Columns) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-white uppercase">Starting XI • {homeTeam.formation}</h3>
                <span className="text-xs text-amber-400 font-bold">123 Galácticos Prime Squad</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-1 rounded-xl">
                  Chemistry: {chemistry}/33 Max
                </span>
              </div>
            </div>

            {/* Tactical Pitch Grid */}
            <div className="relative w-full h-[420px] rounded-2xl bg-gradient-to-b from-emerald-900/60 via-emerald-950 to-slate-950 border-2 border-emerald-500/30 overflow-hidden p-3 flex flex-col justify-between">
              {/* Pitch markings */}
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-px bg-white/20" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-white/20" />

              {/* Attackers Row */}
              <div className="flex justify-around z-10">
                {homeTeam.players.slice(8, 11).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayer(p)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="relative w-12 h-14 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 shadow-lg group-hover:scale-110 transition-transform">
                      <img src={p.photoUrl} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                      <div className="absolute top-0.5 left-0.5 bg-amber-500 text-slate-950 text-[8px] font-black px-1 rounded">
                        {p.rating}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-white mt-1 bg-slate-950/80 px-1.5 rounded">{p.shortName}</span>
                    <span className="text-[8px] font-black text-amber-400">{p.position}</span>
                  </button>
                ))}
              </div>

              {/* Midfielders Row */}
              <div className="flex justify-around z-10">
                {homeTeam.players.slice(5, 8).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayer(p)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="relative w-12 h-14 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 shadow-lg group-hover:scale-110 transition-transform">
                      <img src={p.photoUrl} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                      <div className="absolute top-0.5 left-0.5 bg-amber-500 text-slate-950 text-[8px] font-black px-1 rounded">
                        {p.rating}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-white mt-1 bg-slate-950/80 px-1.5 rounded">{p.shortName}</span>
                    <span className="text-[8px] font-black text-amber-400">{p.position}</span>
                  </button>
                ))}
              </div>

              {/* Defenders Row */}
              <div className="flex justify-around z-10">
                {homeTeam.players.slice(1, 5).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayer(p)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="relative w-12 h-14 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 shadow-lg group-hover:scale-110 transition-transform">
                      <img src={p.photoUrl} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                      <div className="absolute top-0.5 left-0.5 bg-amber-500 text-slate-950 text-[8px] font-black px-1 rounded">
                        {p.rating}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-white mt-1 bg-slate-950/80 px-1.5 rounded">{p.shortName}</span>
                    <span className="text-[8px] font-black text-amber-400">{p.position}</span>
                  </button>
                ))}
              </div>

              {/* Goalkeeper */}
              <div className="flex justify-center z-10">
                {homeTeam.players[0] && (
                  <button
                    onClick={() => setSelectedPlayer(homeTeam.players[0])}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="relative w-12 h-14 rounded-xl overflow-hidden border-2 border-sky-400 bg-slate-900 shadow-lg group-hover:scale-110 transition-transform">
                      <img src={homeTeam.players[0].photoUrl} alt={homeTeam.players[0].name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                      <div className="absolute top-0.5 left-0.5 bg-sky-500 text-slate-950 text-[8px] font-black px-1 rounded">
                        {homeTeam.players[0].rating}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-white mt-1 bg-slate-950/80 px-1.5 rounded">{homeTeam.players[0].shortName}</span>
                    <span className="text-[8px] font-black text-sky-400">GK</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Player Inspector Card */}
          {selectedPlayer && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col items-center text-center">
              <span className="text-xs font-bold text-slate-400 uppercase mb-2">Player Inspector</span>

              <div className="relative w-40 h-56 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 mb-3">
                <img src={selectedPlayer.photoUrl} alt={selectedPlayer.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-black text-sm px-2 py-0.5 rounded">
                  {selectedPlayer.rating}
                </div>
                <div className="absolute top-2 right-2 text-xl">{selectedPlayer.flag}</div>
              </div>

              <h4 className="text-lg font-black text-white uppercase">{selectedPlayer.name}</h4>
              <p className="text-xs text-amber-400 font-bold mb-3">{selectedPlayer.position} • {selectedPlayer.club}</p>

              {/* Core Attributes */}
              <div className="w-full grid grid-cols-2 gap-2 text-xs font-bold mb-4">
                <div className="bg-slate-950 p-2 rounded-xl flex justify-between">
                  <span className="text-slate-400">Pace (PAC)</span>
                  <span className="text-amber-400">{selectedPlayer.stats.pac}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl flex justify-between">
                  <span className="text-slate-400">Shooting (SHO)</span>
                  <span className="text-amber-400">{selectedPlayer.stats.sho}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl flex justify-between">
                  <span className="text-slate-400">Passing (PAS)</span>
                  <span className="text-amber-400">{selectedPlayer.stats.pas}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl flex justify-between">
                  <span className="text-slate-400">Dribbling (DRI)</span>
                  <span className="text-amber-400">{selectedPlayer.stats.dri}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl flex justify-between">
                  <span className="text-slate-400">Defending (DEF)</span>
                  <span className="text-amber-400">{selectedPlayer.stats.def}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl flex justify-between">
                  <span className="text-slate-400">Physical (PHY)</span>
                  <span className="text-amber-400">{selectedPlayer.stats.phy}</span>
                </div>
              </div>

              {/* Special Traits */}
              <div className="w-full text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Special Traits:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedPlayer.traits.map(t => (
                    <span key={t} className="text-[10px] font-bold bg-amber-950/60 border border-amber-700/50 text-amber-300 px-2 py-0.5 rounded-full">
                      ✨ {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: TUNNEL WALKOUT CINEMATIC ================= */}
      {activeTab === 'tunnel' && (
        <div className="max-w-4xl mx-auto w-full px-4 mt-6">
          <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 bg-slate-950 p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] min-h-[460px] justify-between">
            {/* High-definition Cinematic Tunnel Walkout Background Image */}
            <img
              src={tunnelWalkoutImage}
              alt="Futuristic Stadium Tunnel Walkout"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center brightness-75 scale-105 transition-transform duration-1000"
            />

            {/* Cinematic Gradients & Floodlight Glows */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
            <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-amber-400/20 via-emerald-400/10 to-transparent blur-2xl" />

            <div className="relative z-10 flex flex-col items-center max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-slate-950/90 border border-amber-400/60 text-amber-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-lg backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>CHAMPIONS TUNNEL • IMMERSIVE WALKOUT</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                STADIUM TUNNEL WALKOUT
              </h3>
              <p className="text-xs md:text-sm text-slate-200 font-medium mb-6 drop-shadow">
                The players stand ready under the pulsating neon green and gold tunnel LEDs. Smoke flares illuminate the archway as 84,200 fans chant the Champions anthem.
              </p>
            </div>

            {/* Squad Walkout Preview Cards */}
            <div className="relative z-10 flex items-center justify-center -space-x-4 my-2">
              {homeTeam.players.slice(8, 11).map((p, idx) => (
                <div
                  key={p.id}
                  style={{ transform: `scale(${idx === 1 ? 1.15 : 0.95})`, zIndex: idx === 1 ? 10 : 5 }}
                  className="relative w-28 h-40 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)] bg-slate-900 transition-all hover:scale-110 duration-300"
                >
                  <img src={p.photoUrl} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                  <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 rounded">
                    {p.rating}
                  </div>
                  <div className="absolute bottom-1 inset-x-1 bg-slate-950/90 rounded px-1 py-0.5 text-center">
                    <span className="text-[9px] font-black text-amber-300 truncate block">{p.shortName}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-4">
              <button
                onClick={() => {
                  sound.playWhistle(true);
                  onLaunchMatch();
                }}
                className="py-3.5 px-9 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-widest shadow-[0_0_35px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer border border-amber-300"
              >
                <span>ENTER THE PITCH NOW</span>
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: CONTROLS GUIDE ================= */}
      {activeTab === 'controls' && (
        <div className="max-w-4xl mx-auto w-full px-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Keyboard & Desktop */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">Keyboard & Desktop Controls</h3>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-300">Move Player (Dribble)</span>
                <span className="font-mono font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded">W / A / S / D or Arrows</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-300">Ground Pass / Switch</span>
                <span className="font-mono font-bold text-blue-400 bg-slate-800 px-2 py-0.5 rounded">[J]</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-300">Power Shoot / Slide Tackle</span>
                <span className="font-mono font-bold text-red-400 bg-slate-800 px-2 py-0.5 rounded">[Space] or [K]</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-300">Through Ball / 2nd Press</span>
                <span className="font-mono font-bold text-purple-400 bg-slate-800 px-2 py-0.5 rounded">[L]</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-300">Sprint & 5★ Skill Move</span>
                <span className="font-mono font-bold text-emerald-400 bg-slate-800 px-2 py-0.5 rounded">[Shift] or [I]</span>
              </div>
            </div>
          </div>

          {/* Touch & Mobile Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">Mobile Touch Controls</h3>
            <div className="flex flex-col gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                <span className="text-lg">🕹️</span>
                <div>
                  <span className="font-bold text-white block">Virtual Analog Joystick</span>
                  <span className="text-slate-400 text-[11px]">Drag smoothly on the bottom-left to sprint and navigate direction.</span>
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                <span className="text-lg">⚡</span>
                <div>
                  <span className="font-bold text-white block">Hold Shoot to Charge Power</span>
                  <span className="text-slate-400 text-[11px]">Press and hold the Shoot button to charge power for long screamers and curlers.</span>
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                <span className="text-lg">✨</span>
                <div>
                  <span className="font-bold text-white block">5★ Skill Move Selector</span>
                  <span className="text-slate-400 text-[11px]">Tap center skill pill to toggle between Roulette, Rainbow Flick, and Stepover!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PROMINENT BOTTOM LAUNCH BAR ================= */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-950/95 border-t border-slate-800 p-4 z-40 backdrop-blur-xl flex items-center justify-between max-w-6xl mx-auto rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{homeTeam.badge}</span>
            <span className="text-sm font-black text-white">{homeTeam.shortCode}</span>
          </div>
          <span className="text-xs font-bold text-slate-500">VS</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white">{awayTeam.shortCode}</span>
            <span className="text-2xl">{awayTeam.badge}</span>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playWhistle(true);
            onLaunchMatch();
          }}
          className="py-3 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-widest flex items-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.6)] active:scale-95 transition-all cursor-pointer"
        >
          <span>⚽ KICK OFF MATCH</span>
          <Play className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  );
};
