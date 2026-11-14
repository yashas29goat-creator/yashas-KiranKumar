import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowUpDown, Coins, Filter, Gavel, Search, ShoppingBag, Trash2, Users } from 'lucide-react';
import { PlayerCard, TransferListing, UserEconomy } from '../../types/football';
import { PRIME_PLAYERS } from '../../data/players';
import { sound } from '../../utils/soundFx';

interface TransferMarketProps {
  economy: UserEconomy;
  onUpdateEconomy: (eco: UserEconomy) => void;
}

export const TransferMarket: React.FC<TransferMarketProps> = ({ economy, onUpdateEconomy }) => {
  const [activeTab, setActiveTab] = useState<'market' | 'inventory'>('market');
  const [filterPos, setFilterPos] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Market Listings
  const [listings, setListings] = useState<TransferListing[]>([
    {
      id: 'list_1',
      player: PRIME_PLAYERS.find(p => p.id === 'mbappe_123')!,
      currentBid: 8500,
      buyNowPrice: 12000,
      seller: 'MadridElite_99',
      expiresInSeconds: 145,
      bidsCount: 14,
    },
    {
      id: 'list_2',
      player: PRIME_PLAYERS.find(p => p.id === 'zidane_123')!,
      currentBid: 9200,
      buyNowPrice: 13500,
      seller: 'LegendSquad_FC',
      expiresInSeconds: 320,
      bidsCount: 22,
    },
    {
      id: 'list_3',
      player: PRIME_PLAYERS.find(p => p.id === 'maldini_123')!,
      currentBid: 6800,
      buyNowPrice: 9500,
      seller: 'Milanista_Prime',
      expiresInSeconds: 88,
      bidsCount: 9,
    },
    {
      id: 'list_4',
      player: PRIME_PLAYERS.find(p => p.id === 'debruyne_122')!,
      currentBid: 5400,
      buyNowPrice: 7800,
      seller: 'CityzensGlobal',
      expiresInSeconds: 420,
      bidsCount: 5,
    },
    {
      id: 'list_5',
      player: PRIME_PLAYERS.find(p => p.id === 'yashin_123')!,
      currentBid: 7100,
      buyNowPrice: 10500,
      seller: 'GoalkeepingMaster',
      expiresInSeconds: 610,
      bidsCount: 18,
    },
  ]);

  const handlePlaceBid = (listing: TransferListing) => {
    const nextBid = listing.currentBid + 250;
    if (economy.coins < nextBid) return;

    onUpdateEconomy({
      ...economy,
      coins: economy.coins - nextBid,
    });

    setListings(
      listings.map(l =>
        l.id === listing.id
          ? { ...l, currentBid: nextBid, bidsCount: l.bidsCount + 1 }
          : l
      )
    );

    sound.playClick(800);
  };

  const handleBuyNow = (listing: TransferListing) => {
    if (economy.coins < listing.buyNowPrice) return;

    // Deduct coins & add to inventory
    const updatedInventory = [...economy.inventory, listing.player];
    onUpdateEconomy({
      ...economy,
      coins: economy.coins - listing.buyNowPrice,
      inventory: updatedInventory,
    });

    // Remove listing
    setListings(listings.filter(l => l.id !== listing.id));

    sound.playPackFanfare();
    confetti({ particleCount: 100, spread: 80 });
  };

  const handleQuickSell = (player: PlayerCard) => {
    const sellValue = Math.round(player.rating * 22);
    const updatedInventory = economy.inventory.filter(p => p.id !== player.id);

    onUpdateEconomy({
      ...economy,
      coins: economy.coins + sellValue,
      inventory: updatedInventory,
    });

    sound.playClick(600);
  };

  // Filter listings
  const filteredListings = listings.filter(l => {
    const matchesPos = filterPos === 'ALL' || l.player.position.includes(filterPos);
    const matchesSearch = l.player.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.player.club.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPos && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl mb-8">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black uppercase text-white tracking-wide">Galácticos Transfer Hub</h2>
          </div>
          <p className="text-xs text-slate-400">Live auctions, Buy-it-Now bidding, and squad inventory quick-sell</p>
        </div>

        {/* Currency & Tabs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-amber-500/40 px-3 py-1.5 rounded-2xl">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-black text-amber-400 tabular-nums">{economy.coins.toLocaleString()}</span>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('market')}
              className={`px-3 py-1 rounded-xl text-xs font-black uppercase transition-all ${
                activeTab === 'market' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Market ({listings.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1 rounded-xl text-xs font-black uppercase transition-all ${
                activeTab === 'inventory' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              My Club ({economy.inventory.length})
            </button>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: LIVE MARKET ================= */}
      {activeTab === 'market' && (
        <div className="flex flex-col gap-6">
          {/* Search & Position Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search player name or club..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs font-bold text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'ST', 'LW', 'RW', 'CAM', 'CM', 'CB', 'GK'].map(pos => (
                <button
                  key={pos}
                  onClick={() => setFilterPos(pos)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                    filterPos === pos
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Listings List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredListings.map(listing => (
              <div
                key={listing.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between hover:border-amber-500/40 transition-all shadow-lg"
              >
                {/* Player Card & Info */}
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-22 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-950 shrink-0">
                    <img src={listing.player.photoUrl} alt={listing.player.name} className="w-full h-full object-cover object-top" />
                    <div className="absolute top-0.5 left-0.5 bg-amber-500 text-slate-950 text-[10px] font-black px-1 rounded">
                      {listing.player.rating}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-white">{listing.player.name}</span>
                      <span className="text-xs">{listing.player.flag}</span>
                    </div>
                    <span className="text-xs text-amber-400 font-bold block">{listing.player.position} • {listing.player.club}</span>
                    <span className="text-[10px] text-slate-400">Seller: {listing.seller} ({listing.bidsCount} bids)</span>
                  </div>
                </div>

                {/* Price & Action Buttons */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Current Bid:</span>
                    <span className="text-xs font-black text-amber-400">{listing.currentBid.toLocaleString()} Coins</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={economy.coins < listing.currentBid + 250}
                      onClick={() => handlePlaceBid(listing)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        economy.coins >= listing.currentBid + 250
                          ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/50 cursor-pointer active:scale-95'
                          : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      Bid {(listing.currentBid + 250).toLocaleString()}
                    </button>

                    <button
                      disabled={economy.coins < listing.buyNowPrice}
                      onClick={() => handleBuyNow(listing)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                        economy.coins >= listing.buyNowPrice
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-95 shadow-md'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Buy {listing.buyNowPrice.toLocaleString()}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: MY CLUB INVENTORY ================= */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {economy.inventory.map(player => (
            <div
              key={player.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col items-center text-center hover:border-amber-400/50 transition-all shadow-lg"
            >
              <div className="relative w-32 h-44 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-950 mb-3 shadow-md">
                <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover object-top" />
                <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 text-xs font-black px-1.5 py-0.5 rounded">
                  {player.rating}
                </div>
                <div className="absolute top-1 right-1 text-lg">{player.flag}</div>
              </div>

              <span className="text-sm font-black text-white block uppercase truncate w-full">{player.name}</span>
              <span className="text-xs text-amber-400 font-bold mb-3">{player.position} • {player.club}</span>

              {/* Quick Sell Button */}
              <button
                onClick={() => handleQuickSell(player)}
                className="w-full py-2 rounded-xl bg-slate-950 hover:bg-red-950/60 border border-slate-800 hover:border-red-600/50 text-slate-400 hover:text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Quick-Sell (+{Math.round(player.rating * 22)} Coins)</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
