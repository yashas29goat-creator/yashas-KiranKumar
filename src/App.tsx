import React, { useEffect, useRef, useState } from 'react';
import {
  Coins,
  Compass,
  Flame,
  Gem,
  Gift,
  Play,
  RotateCcw,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Wand2,
} from 'lucide-react';
import {
  CameraMode,
  DifficultyLevel,
  FormationType,
  GoalWalkoutEvent,
  MatchPlayer,
  PitchEmote,
  PlayerCard,
  TacticMode,
  Team,
  UserEconomy,
  WeatherMode,
} from './types/football';
import { AWAY_TEAM_DEFAULT, HOME_TEAM_DEFAULT, PRIME_PLAYERS } from './data/players';
import { FootballMatchEngine, EngineState } from './utils/matchEngine';
import { sound } from './utils/soundFx';

// Components
import { PitchCanvas } from './components/match/PitchCanvas';
import { VirtualControls } from './components/match/VirtualControls';
import { MatchHUD } from './components/match/MatchHUD';
import { GoalCelebrationModal } from './components/match/GoalCelebrationModal';
import { MatchSummaryModal } from './components/match/MatchSummaryModal';
import { KickoffHub } from './components/hub/KickoffHub';
import { PackStore } from './components/store/PackStore';
import { DraftArena } from './components/draft/DraftArena';
import { PlayerForge } from './components/forge/PlayerForge';
import { TransferMarket } from './components/market/TransferMarket';

export default function App() {
  // Navigation Screens: 'hub' | 'match' | 'store' | 'draft' | 'forge' | 'market'
  const [currentScreen, setCurrentScreen] = useState<'hub' | 'match' | 'store' | 'draft' | 'forge' | 'market'>('hub');

  // Match Configuration
  const [homeTeam, setHomeTeam] = useState<Team>(HOME_TEAM_DEFAULT);
  const [awayTeam, setAwayTeam] = useState<Team>(AWAY_TEAM_DEFAULT);
  const [weather, setWeather] = useState<WeatherMode>('night_floodlights');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('World Class');
  const [cameraMode, setCameraMode] = useState<CameraMode>('broadcast');

  // User Economy & Inventory
  const [economy, setEconomy] = useState<UserEconomy>({
    coins: 15400,
    gems: 280,
    level: 14,
    xp: 2450,
    inventory: [...PRIME_PLAYERS.slice(0, 15)],
    activeSquad: [...HOME_TEAM_DEFAULT.players],
    activeFormation: '4-3-3',
  });

  // Match Engine Instance & State
  const engineRef = useRef<FootballMatchEngine | null>(null);
  const [engineState, setEngineState] = useState<EngineState | null>(null);

  // Active Joystick Vector & Emotes
  const joystickVectorRef = useRef({ active: false, dx: 0, dy: 0 });
  const [emotes, setEmotes] = useState<PitchEmote[]>([]);

  // Sound Mute
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  // Initialize Match Engine
  const startMatch = (customHomeSquad?: PlayerCard[]) => {
    const updatedHomeTeam = {
      ...homeTeam,
      players: customHomeSquad || homeTeam.players,
    };
    const engine = new FootballMatchEngine(updatedHomeTeam, awayTeam, weather, difficulty);
    engineRef.current = engine;
    setEngineState({ ...engine.state });
    setCurrentScreen('match');
  };

  // Main 60 FPS Game Loop when in match screen
  useEffect(() => {
    if (currentScreen !== 'match' || !engineRef.current) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (engineRef.current) {
        engineRef.current.update(dt, joystickVectorRef.current);
        setEngineState({ ...engineRef.current.state });

        // Update floating pitch emotes decay
        setEmotes(prev =>
          prev
            .map(e => ({
              ...e,
              y: e.y - 0.8,
              opacity: e.opacity - 0.015,
            }))
            .filter(e => e.opacity > 0)
        );
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [currentScreen]);

  // Handle Controls & Actions
  const handleJoystickMove = (data: { active: boolean; dx: number; dy: number }) => {
    joystickVectorRef.current = data;
  };

  const handleShoot = (power: number) => {
    if (!engineRef.current) return;
    const player = engineRef.current.state.players.find(p => p.id === engineRef.current?.state.controlledPlayerId);
    if (player) {
      engineRef.current.executeShoot(player, power);
    }
  };

  const handlePass = (isThrough: boolean) => {
    if (!engineRef.current) return;
    const player = engineRef.current.state.players.find(p => p.id === engineRef.current?.state.controlledPlayerId);
    if (player) {
      engineRef.current.executePass(player, isThrough);
    }
  };

  const handleSkillMove = (skill: 'roulette' | 'rainbow' | 'stepover') => {
    if (!engineRef.current) return;
    const player = engineRef.current.state.players.find(p => p.id === engineRef.current?.state.controlledPlayerId);
    if (player) {
      engineRef.current.executeSkillMove(player, skill);
    }
  };

  const handleSlideTackle = () => {
    if (!engineRef.current) return;
    const player = engineRef.current.state.players.find(p => p.id === engineRef.current?.state.controlledPlayerId);
    if (player) {
      engineRef.current.executeSlideTackle(player);
    }
  };

  const handleSwitchPlayer = () => {
    if (!engineRef.current) return;
    engineRef.current.switchPlayerManual();
  };

  const handleSprintToggle = (sprinting: boolean) => {
    if (!engineRef.current) return;
    const player = engineRef.current.state.players.find(p => p.id === engineRef.current?.state.controlledPlayerId);
    if (player) {
      player.state = sprinting ? 'sprinting' : 'running';
    }
  };

  const handleTriggerEmote = (emoji: string) => {
    if (!engineRef.current) return;
    const player = engineRef.current.state.players.find(p => p.id === engineRef.current?.state.controlledPlayerId) || engineRef.current.state.players[0];
    const newEmote: PitchEmote = {
      id: `emote_${Date.now()}`,
      emoji,
      x: player.x,
      y: player.y - 20,
      opacity: 1.0,
      createdAt: Date.now(),
    };
    setEmotes(prev => [...prev, newEmote]);
  };

  // Nav Items Contract (≤ 5 items)
  const NAV_ITEMS = [
    { id: 'hub', label: 'Match Center', icon: Swords },
    { id: 'store', label: 'Pack Store', icon: Gift },
    { id: 'draft', label: 'Draft Arena', icon: Trophy },
    { id: 'forge', label: 'Player Forge', icon: Wand2 },
    { id: 'market', label: 'Transfer Market', icon: ShoppingBag },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-950 text-slate-100 font-sans select-none overflow-x-hidden">
      {/* ================= TOP BAR (Strict 3-Zone Contract) ================= */}
      {currentScreen !== 'match' && (
        <header className="sticky top-0 z-50 w-full bg-slate-950/95 border-b border-slate-800 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            {/* Zone 1: Brand Title (Single Text Element) */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xl">⚽</span>
              <span className="text-sm font-black tracking-wider uppercase bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent whitespace-nowrap">
                Champions Arena
              </span>
            </div>

            {/* Zone 2: Navigation Links (Single-Line 5 items) */}
            <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentScreen(item.id as typeof currentScreen);
                      sound.playClick(700);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Primary Actions & Economy Pills */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Coins Pill */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/40 px-2.5 py-1 rounded-xl">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-black text-amber-300 tabular-nums">{economy.coins.toLocaleString()}</span>
              </div>

              {/* Gems Pill */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-sky-500/40 px-2.5 py-1 rounded-xl">
                <Gem className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-xs font-black text-sky-300 tabular-nums">{economy.gems.toLocaleString()}</span>
              </div>

              {/* Mute Toggle */}
              <button
                onClick={() => {
                  const muted = sound.toggleMute();
                  setIsMuted(muted);
                }}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                title={isMuted ? 'Unmute' : 'Mute sound'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ================= MAIN CONTENT ROUTER ================= */}
      <main className="flex-1 flex flex-col w-full relative">
        {/* MATCH CENTRE / KICKOFF HUB */}
        {currentScreen === 'hub' && (
          <KickoffHub
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            weather={weather}
            difficulty={difficulty}
            onWeatherChange={setWeather}
            onDifficultyChange={setDifficulty}
            onFormationChange={f => setHomeTeam({ ...homeTeam, formation: f })}
            onLaunchMatch={() => startMatch()}
            onInspectPlayer={() => {}}
          />
        )}

        {/* REAL-TIME MATCH ENGINE SIMULATION SCREEN */}
        {currentScreen === 'match' && engineState && (
          <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden select-none">
            {/* Top Scoreboard Bug & Active HUD */}
            <MatchHUD
              engineState={engineState}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              cameraMode={cameraMode}
              onCameraChange={setCameraMode}
              onTacticChange={t => engineRef.current?.setTactic('home', t)}
              onWeatherChange={w => {
                setWeather(w);
                engineRef.current?.setWeather(w);
              }}
              onTogglePlay={() => engineRef.current?.togglePlayPause()}
              onRestart={() => startMatch()}
              onTriggerEmote={handleTriggerEmote}
              onExitMatch={() => setCurrentScreen('hub')}
            />

            {/* 60 FPS HTML5 Canvas Match Pitch */}
            <div className="flex-1 w-full h-full relative">
              <PitchCanvas
                engineState={engineState}
                cameraMode={cameraMode}
                emotes={emotes}
              />

              {/* Ergonomic Virtual Joystick & Action Button Cluster */}
              <VirtualControls
                onJoystickMove={handleJoystickMove}
                onShoot={handleShoot}
                onPass={handlePass}
                onSkillMove={handleSkillMove}
                onSlideTackle={handleSlideTackle}
                onSwitchPlayer={handleSwitchPlayer}
                onSprintToggle={handleSprintToggle}
                hasBall={engineState.ball.possessionPlayerId === engineState.controlledPlayerId}
              />
            </div>

            {/* Goal Celebration Walkout Presentation Replay */}
            {engineState.latestGoalWalkout && (
              <GoalCelebrationModal
                goalEvent={engineState.latestGoalWalkout}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                onResume={() => engineRef.current?.resumeAfterGoal()}
              />
            )}

            {/* Halftime or Fulltime Summary Modal */}
            {(engineState.isHalfTime || engineState.isFullTime) && (
              <MatchSummaryModal
                isHalfTime={engineState.isHalfTime}
                score={engineState.score}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                stats={engineState.stats}
                onContinue={() => {
                  if (engineRef.current) {
                    engineRef.current.state.isHalfTime = false;
                    engineRef.current.state.isPlaying = true;
                    setEngineState({ ...engineRef.current.state });
                  }
                }}
                onRematch={() => startMatch()}
                onExit={() => setCurrentScreen('hub')}
                onAddRewards={(c, g, xp) => {
                  setEconomy(prev => ({
                    ...prev,
                    coins: prev.coins + c,
                    gems: prev.gems + g,
                    xp: prev.xp + xp,
                  }));
                }}
              />
            )}
          </div>
        )}

        {/* PACK STORE & WALKOUT ARENA */}
        {currentScreen === 'store' && (
          <PackStore economy={economy} onUpdateEconomy={setEconomy} />
        )}

        {/* ULTIMATE DRAFT ARENA */}
        {currentScreen === 'draft' && (
          <DraftArena
            economy={economy}
            onUpdateEconomy={setEconomy}
            onLaunchDraftMatch={draftSquad => startMatch(draftSquad)}
          />
        )}

        {/* PLAYER FORGE & CARD CUSTOMIZER */}
        {currentScreen === 'forge' && (
          <PlayerForge economy={economy} onUpdateEconomy={setEconomy} />
        )}

        {/* TRANSFER MARKET & SQUAD INVENTORY */}
        {currentScreen === 'market' && (
          <TransferMarket economy={economy} onUpdateEconomy={setEconomy} />
        )}
      </main>
    </div>
  );
}
