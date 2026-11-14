import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, Check, ChevronRight, Play, RotateCcw, Shield, Sparkles, Trophy, Users } from 'lucide-react';
import { DraftPick, FormationType, PlayerCard, PlayerPosition, UserEconomy } from '../../types/football';
import { PRIME_PLAYERS } from '../../data/players';
import { sound } from '../../utils/soundFx';

interface DraftArenaProps {
  economy: UserEconomy;
  onUpdateEconomy: (eco: UserEconomy) => void;
  onLaunchDraftMatch: (draftSquad: PlayerCard[]) => void;
}

const DRAFT_POSITIONS: PlayerPosition[] = ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'CB', 'CB', 'RB', 'GK'];

export const DraftArena: React.FC<DraftArenaProps> = ({ economy, onUpdateEconomy, onLaunchDraftMatch }) => {
  const [stage, setStage] = useState<'formation' | 'drafting' | 'tournament'>('formation');
  const [formation, setFormation] = useState<FormationType>('4-3-3');
  const [currentPickIndex, setCurrentPickIndex] = useState<number>(0);
  const [draftSquad, setDraftSquad] = useState<(PlayerCard | null)[]>(new Array(11).fill(null));
  const [currentOptions, setCurrentOptions] = useState<PlayerCard[]>([]);

  // Tournament Bracket State
  const [bracketRound, setBracketRound] = useState<number>(1); // 1: QF, 2: SF, 3: Final, 4: Champion
  const [tournamentLogs, setTournamentLogs] = useState<string[]>([]);

  // Start Drafting
  const handleStartDraft = (selectedForm: FormationType) => {
    setFormation(selectedForm);
    setDraftSquad(new Array(11).fill(null));
    setCurrentPickIndex(0);
    generateOptionsForPosition(DRAFT_POSITIONS[0]);
    setStage('drafting');
    sound.playClick(700);
  };

  const generateOptionsForPosition = (pos: PlayerPosition) => {
    // Pick 5 random players from PRIME_PLAYERS (biased toward position if available)
    const shuffled = [...PRIME_PLAYERS].sort(() => 0.5 - Math.random());
    setCurrentOptions(shuffled.slice(0, 5));
  };

  const handleSelectPlayer = (player: PlayerCard) => {
    const updated = [...draftSquad];
    updated[currentPickIndex] = player;
    setDraftSquad(updated);
    sound.playClick(850);

    if (currentPickIndex < 10) {
      const nextIdx = currentPickIndex + 1;
      setCurrentPickIndex(nextIdx);
      generateOptionsForPosition(DRAFT_POSITIONS[nextIdx]);
    } else {
      // Completed Draft!
      setStage('tournament');
      setBracketRound(1);
      setTournamentLogs(['🏆 Draft Squad finalized! Entering Champions Arena Tournament Bracket...']);
      confetti({ particleCount: 100, spread: 80 });
    }
  };

  // Simulate Tournament Rounds
  const handleSimulateRound = () => {
    sound.playWhistle(false);
    if (bracketRound === 1) {
      setTournamentLogs(prev => [...prev, '⚔️ Quarter-Final: Galácticos Draft XI defeated Bayern Red (3 - 1)!']);
      setBracketRound(2);
    } else if (bracketRound === 2) {
      setTournamentLogs(prev => [...prev, '⚔️ Semi-Final: Thrilling 4 - 3 extra-time victory over Paris Blue!']);
      setBracketRound(3);
    } else if (bracketRound === 3) {
      setTournamentLogs(prev => [
        ...prev,
        '🏆 GRAND FINAL VICTORY! Your Draft Squad lifted the Prime Trophy (2 - 1)!',
        '🎁 Rewards Claimed: +5,000 Coins, +100 Gems, +1x Prime Pack!',
      ]);
      setBracketRound(4);
      onUpdateEconomy({
        ...economy,
        coins: economy.coins + 5000,
        gems: economy.gems + 100,
      });
      confetti({ particleCount: 200, spread: 100 });
      sound.playPackFanfare();
    }
  };

  // Calculate Average Squad Rating
  const validPlayers = draftSquad.filter((p): p is PlayerCard => p !== null);
  const avgOvr = validPlayers.length > 0 ? Math.round(validPlayers.reduce((acc, p) => acc + p.rating, 0) / validPlayers.length) : 122;

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 text-slate-100">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-3xl mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black uppercase text-white tracking-wide">Ultimate Draft Arena</h2>
          </div>
          <p className="text-xs text-slate-400">Pick superstar cards by position & battle through tournament brackets</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-600/50 px-3 py-1.5 rounded-2xl">
            Draft Rating: {avgOvr} OVR
          </span>
        </div>
      </div>

      {/* ================= STAGE 1: FORMATION SELECTION ================= */}
      {stage === 'formation' && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
          <h3 className="text-lg font-black text-white uppercase mb-2">Select Your Draft Tactical Formation</h3>
          <p className="text-xs text-slate-400 mb-6">Choose the tactical blueprint for your tournament run</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['4-3-3', '4-2-3-1', '3-5-2', '4-4-2'] as FormationType[]).map(f => (
              <button
                key={f}
                onClick={() => setFormation(f)}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  formation === f
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span className="text-base font-black block">{f}</span>
                <span className="text-[10px] text-slate-400">Balanced Tactical Synergy</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => handleStartDraft(formation)}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <span>START SQUAD DRAFT</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= STAGE 2: DRAFTING PICKS ================= */}
      {stage === 'drafting' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase block">Current Pick ({currentPickIndex + 1}/11)</span>
              <span className="text-base font-black text-amber-400 uppercase">
                Choose {DRAFT_POSITIONS[currentPickIndex]}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-300">Formation: {formation}</span>
          </div>

          {/* 5 Card Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {currentOptions.map((player) => (
              <button
                key={player.id}
                onClick={() => handleSelectPlayer(player)}
                className="bg-slate-900 border-2 border-slate-800 hover:border-amber-400 rounded-3xl p-4 flex flex-col items-center text-center group cursor-pointer transition-all hover:scale-105 shadow-xl"
              >
                {/* Photo & OVR Shield */}
                <div className="relative w-32 h-44 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-950 mb-3 shadow-md">
                  <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover object-top" />
                  <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 text-xs font-black px-1.5 py-0.5 rounded">
                    {player.rating}
                  </div>
                  <div className="absolute top-1 right-1 text-lg">{player.flag}</div>
                </div>

                <span className="text-sm font-black text-white block uppercase truncate w-full">{player.name}</span>
                <span className="text-xs text-amber-400 font-bold mb-2">{player.position} • {player.club}</span>

                <div className="w-full grid grid-cols-3 gap-1 text-[9px] font-bold bg-slate-950 p-1.5 rounded-xl text-slate-300">
                  <div>PAC {player.stats.pac}</div>
                  <div>SHO {player.stats.sho}</div>
                  <div>DRI {player.stats.dri}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= STAGE 3: TOURNAMENT BRACKET ================= */}
      {stage === 'tournament' && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 mb-3">
            <Trophy className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-black text-white uppercase mb-2">Champions Arena Tournament Bracket</h3>
          <p className="text-xs text-slate-400 mb-6">Play through knockout rounds or simulate your draft dream team!</p>

          {/* Tournament Logs */}
          <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 text-left flex flex-col gap-2 max-h-48 overflow-y-auto">
            {tournamentLogs.map((log, idx) => (
              <p key={idx} className="text-xs font-semibold text-slate-200">{log}</p>
            ))}
          </div>

          {/* Round Buttons */}
          <div className="flex items-center gap-3 w-full">
            {bracketRound < 4 ? (
              <>
                <button
                  onClick={handleSimulateRound}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase cursor-pointer border border-slate-700"
                >
                  SIMULATE ROUND ({bracketRound === 1 ? 'QUARTER-FINAL' : bracketRound === 2 ? 'SEMI-FINAL' : 'GRAND FINAL'})
                </button>

                <button
                  onClick={() => onLaunchDraftMatch(validPlayers)}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>PLAY MATCH LIVE</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setStage('formation')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>START NEW DRAFT</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
