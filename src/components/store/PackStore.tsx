import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Coins, Gem, Gift, Sparkles, Trophy, Check, ArrowRight } from 'lucide-react';
import { PlayerCard, UserEconomy } from '../../types/football';
import { PRIME_PLAYERS } from '../../data/players';
import { sound } from '../../utils/soundFx';

interface PackStoreProps {
  economy: UserEconomy;
  onUpdateEconomy: (eco: UserEconomy) => void;
}

interface PackType {
  id: string;
  name: string;
  priceCoins: number;
  priceGems: number;
  guaranteedMinOvr: number;
  description: string;
  bannerColor: string;
  badge: string;
}

export const PackStore: React.FC<PackStoreProps> = ({ economy, onUpdateEconomy }) => {
  const [openingPack, setOpeningPack] = useState<PackType | null>(null);
  const [walkoutStage, setWalkoutStage] = useState<number>(0); // 0: unopened, 1: flag, 2: pos/club, 3: full walkout
  const [revealedPlayer, setRevealedPlayer] = useState<PlayerCard | null>(null);

  const PACKS: PackType[] = [
    {
      id: 'daily_scout',
      name: 'Daily Free Scout Pack',
      priceCoins: 0,
      priceGems: 0,
      guaranteedMinOvr: 119,
      description: 'Free daily pack containing 119+ Prime Galáctico superstar.',
      bannerColor: 'from-emerald-600 to-teal-900',
      badge: '🎁',
    },
    {
      id: 'jumbo_galactico',
      name: 'Jumbo Galácticos Pack',
      priceCoins: 2500,
      priceGems: 50,
      guaranteedMinOvr: 121,
      description: 'High-voltage pack featuring TOTY and UCL Heroes (121+ OVR).',
      bannerColor: 'from-blue-600 to-indigo-950',
      badge: '⚡',
    },
    {
      id: 'icon_walkout',
      name: 'Prime Icons Walkout Pack',
      priceCoins: 5000,
      priceGems: 100,
      guaranteedMinOvr: 123,
      description: 'Guaranteed 123 Prime Icon (R9, Zidane, Ronaldinho, Maldini, Yashin).',
      bannerColor: 'from-amber-600 to-yellow-950',
      badge: '👑',
    },
    {
      id: 'toty_champions',
      name: 'TOTY Champions Mega Pack',
      priceCoins: 10000,
      priceGems: 200,
      guaranteedMinOvr: 123,
      description: 'The ultimate 123 OVR Prime TOTY Superstar Walkout pack.',
      bannerColor: 'from-purple-600 to-pink-950',
      badge: '💎',
    },
  ];

  const handleOpenPack = (pack: PackType, currency: 'coins' | 'gems' | 'free') => {
    if (currency === 'coins' && economy.coins < pack.priceCoins) return;
    if (currency === 'gems' && economy.gems < pack.priceGems) return;

    // Deduct currency
    const newCoins = currency === 'coins' ? economy.coins - pack.priceCoins : economy.coins;
    const newGems = currency === 'gems' ? economy.gems - pack.priceGems : economy.gems;

    // Pick a player meeting minimum OVR criteria
    const eligible = PRIME_PLAYERS.filter(p => p.rating >= pack.guaranteedMinOvr);
    const chosen = eligible[Math.floor(Math.random() * eligible.length)] || PRIME_PLAYERS[0];

    // Add to inventory if not already present
    const updatedInventory = [...economy.inventory];
    if (!updatedInventory.some(p => p.id === chosen.id)) {
      updatedInventory.push(chosen);
    }

    onUpdateEconomy({
      ...economy,
      coins: newCoins,
      gems: newGems,
      inventory: updatedInventory,
    });

    setOpeningPack(pack);
    setRevealedPlayer(chosen);
    setWalkoutStage(1);
    sound.playClick(600);

    // Cinematic Walkout Timing Sequence
    setTimeout(() => {
      setWalkoutStage(2);
      sound.playClick(800);
    }, 1200);

    setTimeout(() => {
      setWalkoutStage(3);
      sound.playPackFanfare();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
    }, 2400);
  };

  const handleCloseWalkout = () => {
    setOpeningPack(null);
    setWalkoutStage(0);
    setRevealedPlayer(null);
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 text-slate-100">
      {/* Top Header & Balances */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black uppercase text-white tracking-wide">Galácticos Pack Store</h2>
          </div>
          <p className="text-xs text-slate-400">Open packs to draft 123 Prime Icons and TOTY Superstars</p>
        </div>

        {/* Currency Pill Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-amber-500/40 px-3 py-1.5 rounded-2xl shadow-inner">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-black text-amber-400 tabular-nums">{economy.coins.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-slate-400">COINS</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-sky-500/40 px-3 py-1.5 rounded-2xl shadow-inner">
            <Gem className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-black text-sky-400 tabular-nums">{economy.gems.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-slate-400">GEMS</span>
          </div>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PACKS.map(pack => (
          <div
            key={pack.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-xl group"
          >
            {/* Top Pack Banner */}
            <div className={`h-36 bg-gradient-to-br ${pack.bannerColor} p-4 flex flex-col justify-between relative`}>
              <div className="flex justify-between items-start">
                <span className="text-3xl">{pack.badge}</span>
                <span className="text-[10px] font-black uppercase bg-black/50 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
                  {pack.guaranteedMinOvr}+ OVR
                </span>
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wider leading-tight">{pack.name}</h3>
            </div>

            {/* Description */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-slate-300 mb-4">{pack.description}</p>

              {/* Purchase Buttons */}
              <div className="flex flex-col gap-2">
                {pack.priceCoins === 0 ? (
                  <button
                    onClick={() => handleOpenPack(pack, 'free')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>CLAIM FREE PACK</span>
                  </button>
                ) : (
                  <>
                    <button
                      disabled={economy.coins < pack.priceCoins}
                      onClick={() => handleOpenPack(pack, 'coins')}
                      className={`w-full py-2.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-md transition-all ${
                        economy.coins >= pack.priceCoins
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-98'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{pack.priceCoins.toLocaleString()} COINS</span>
                    </button>

                    <button
                      disabled={economy.gems < pack.priceGems}
                      onClick={() => handleOpenPack(pack, 'gems')}
                      className={`w-full py-2 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 border transition-all ${
                        economy.gems >= pack.priceGems
                          ? 'bg-sky-950/60 border-sky-600/60 text-sky-300 hover:bg-sky-900 cursor-pointer active:scale-98'
                          : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <Gem className="w-3.5 h-3.5" />
                      <span>{pack.priceGems} GEMS</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= PACK OPENING WALKOUT CINEMATIC MODAL ================= */}
      {openingPack && revealedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4">
          <div className="relative max-w-lg w-full flex flex-col items-center text-center">
            {/* Stage 1: Nationality Reveal */}
            {walkoutStage >= 1 && (
              <div className="flex flex-col items-center animate-in fade-in duration-300 mb-4">
                <span className="text-5xl mb-2">{revealedPlayer.flag}</span>
                <span className="text-sm font-black uppercase text-amber-400 tracking-widest">{revealedPlayer.nationality}</span>
              </div>
            )}

            {/* Stage 2: Club & Position Reveal */}
            {walkoutStage >= 2 && (
              <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-2xl animate-in zoom-in-90 duration-300 mb-6">
                <span className="text-2xl">{revealedPlayer.clubBadge}</span>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-300 block">{revealedPlayer.club}</span>
                  <span className="text-xs font-black text-amber-400">{revealedPlayer.position}</span>
                </div>
              </div>
            )}

            {/* Stage 3: Full Card Walkout */}
            {walkoutStage >= 3 && (
              <div className="flex flex-col items-center animate-in zoom-in-75 duration-500">
                <div className="relative w-52 h-72 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.6)] bg-gradient-to-b from-amber-500/40 via-slate-900 to-black mb-6">
                  <img src={revealedPlayer.photoUrl} alt={revealedPlayer.name} className="w-full h-full object-cover object-top" />
                  <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-base font-black px-2 py-0.5 rounded-lg">
                    {revealedPlayer.rating}
                  </div>
                  <div className="absolute top-2 right-2 text-2xl">{revealedPlayer.flag}</div>

                  <div className="absolute bottom-2 inset-x-2 bg-slate-950/95 border border-amber-400/50 rounded-2xl p-2 text-center">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider block truncate">
                      {revealedPlayer.name}
                    </span>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-300 mt-0.5">
                      <span>PAC {revealedPlayer.stats.pac}</span>
                      <span>SHO {revealedPlayer.stats.sho}</span>
                      <span>PAS {revealedPlayer.stats.pas}</span>
                      <span>DRI {revealedPlayer.stats.dri}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-6">
                  <Check className="w-4 h-4" />
                  <span>Added to Squad Inventory!</span>
                </div>

                <button
                  onClick={handleCloseWalkout}
                  className="py-3 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                  COLLECT & CONTINUE
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
