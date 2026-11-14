import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, Check, Sparkles, Wand2, ArrowRight } from 'lucide-react';
import { CardRarity, PlayerCard, PlayerPosition, UserEconomy } from '../../types/football';
import { sound } from '../../utils/soundFx';

interface PlayerForgeProps {
  economy: UserEconomy;
  onUpdateEconomy: (eco: UserEconomy) => void;
}

export const PlayerForge: React.FC<PlayerForgeProps> = ({ economy, onUpdateEconomy }) => {
  const [name, setName] = useState('Alex Hunter');
  const [position, setPosition] = useState<PlayerPosition>('ST');
  const [rarity, setRarity] = useState<CardRarity>('CUSTOM_FORGE');
  const [nationality, setNationality] = useState('Brazil');
  const [flag, setFlag] = useState('🇧🇷');
  const [club, setClub] = useState('Galácticos Prime');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');

  // Stats sliders (80 - 126)
  const [pac, setPac] = useState(122);
  const [sho, setSho] = useState(124);
  const [pas, setPas] = useState(115);
  const [dri, setDri] = useState(125);
  const [def, setDef] = useState(70);
  const [phy, setPhy] = useState(110);

  // Selected Traits
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['Trivela Master', 'Rocket Volley']);

  const ALL_TRAITS = [
    'Rocket Volley',
    'Trivela Master',
    'Finesse Shot',
    'Speed Dribbler',
    'Playmaker',
    'Power Header',
    'Anchor Tackler',
    'Aerial Wall',
  ];

  // Calculated OVR
  const calculatedOvr = Math.min(125, Math.round((pac * 0.25 + sho * 0.3 + dri * 0.25 + pas * 0.15 + phy * 0.05)));

  const handleToggleTrait = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else {
      if (selectedTraits.length < 3) {
        setSelectedTraits([...selectedTraits, trait]);
      }
    }
  };

  const handleSaveToInventory = () => {
    const customPlayer: PlayerCard = {
      id: `custom_${Date.now()}`,
      name,
      shortName: name.split(' ').pop() || name,
      rating: calculatedOvr,
      position,
      rarity,
      photoUrl,
      club,
      clubBadge: '👑',
      nationality,
      flag,
      preferredFoot: 'Right',
      heightCm: 185,
      traits: selectedTraits,
      stats: {
        pac,
        sho,
        pas,
        dri,
        def,
        phy,
        staminaMax: 98,
        weakFoot: 5,
        skillMoves: 5,
      },
    };

    onUpdateEconomy({
      ...economy,
      inventory: [customPlayer, ...economy.inventory],
    });

    sound.playPackFanfare();
    confetti({ particleCount: 120, spread: 90 });
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-3xl mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black uppercase text-white tracking-wide">Player Forge & Card Customizer</h2>
          </div>
          <p className="text-xs text-slate-400">Craft your custom Galáctico Prime Card with personalized attributes & foils</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Customizer Controls */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Player Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Position</label>
              <select
                value={position}
                onChange={e => setPosition(e.target.value as PlayerPosition)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-amber-400 outline-none cursor-pointer"
              >
                {['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'CB', 'RB', 'GK'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nation & Flag */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Nationality</label>
              <input
                type="text"
                value={nationality}
                onChange={e => setNationality(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Flag Emoji</label>
              <input
                type="text"
                value={flag}
                onChange={e => setFlag(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Card Rarity Foil Theme */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-2">Card Foil Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'TOTY', label: 'TOTY Neon Diamond' },
                { id: 'ICON_PRIME', label: 'Prime Icon Gold' },
                { id: 'UCL_HERO', label: 'UCL Nebula Cosmic' },
                { id: 'FLASHBACK', label: 'Flashback Emerald' },
                { id: 'CUSTOM_FORGE', label: 'Obsidian Galaxy' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setRarity(f.id as CardRarity)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    rarity === f.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Attribute Sliders */}
          <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-black text-amber-400 uppercase">Attributes & Skill Ratings</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">Pace (PAC)</span>
                  <span className="text-amber-400">{pac}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="126"
                  value={pac}
                  onChange={e => setPac(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">Shooting (SHO)</span>
                  <span className="text-amber-400">{sho}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="126"
                  value={sho}
                  onChange={e => setSho(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">Passing (PAS)</span>
                  <span className="text-amber-400">{pas}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="126"
                  value={pas}
                  onChange={e => setPas(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">Dribbling (DRI)</span>
                  <span className="text-amber-400">{dri}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="126"
                  value={dri}
                  onChange={e => setDri(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">Defending (DEF)</span>
                  <span className="text-amber-400">{def}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="126"
                  value={def}
                  onChange={e => setDef(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">Physical (PHY)</span>
                  <span className="text-amber-400">{phy}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="126"
                  value={phy}
                  onChange={e => setPhy(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Traits Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-2">Special Gameplay Traits (Max 3)</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TRAITS.map(trait => {
                const isSelected = selectedTraits.includes(trait);
                return (
                  <button
                    key={trait}
                    onClick={() => handleToggleTrait(trait)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {trait}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Holographic Card Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between text-center">
          <span className="text-xs font-bold text-slate-400 uppercase mb-4">Holographic Card Preview</span>

          {/* Card Shield */}
          <div className="relative w-52 h-72 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.5)] bg-gradient-to-b from-amber-500/30 via-slate-900 to-black p-1 my-auto">
            <img src={photoUrl} alt={name} className="w-full h-full object-cover object-top rounded-2xl" />

            <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-base font-black px-2 py-0.5 rounded-lg shadow">
              {calculatedOvr}
            </div>
            <div className="absolute top-2 right-2 text-2xl">{flag}</div>

            <div className="absolute bottom-2 inset-x-2 bg-slate-950/95 border border-amber-400/50 rounded-2xl p-2 text-center">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider block truncate">
                {name}
              </span>
              <div className="flex items-center justify-center gap-1 text-[9px] font-black text-amber-400">
                <span>{position}</span> • <span>{club}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-slate-300 mt-1">
                <span>PAC {pac}</span>
                <span>SHO {sho}</span>
                <span>DRI {dri}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveToInventory}
            className="w-full mt-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>FORGE & ADD TO SQUAD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
