import {
  Wrench,
  Droplet,
  Hammer,
  Wind,
  Home,
  Construction,
  Palette,
  Zap,
  Grid3x3,
  Sprout,
} from 'lucide-react';

export const TRADE_ICONS = {
  electrician: Zap,
  plumber: Droplet,
  carpenter: Hammer,
  hvac: Wind,
  mason: Home,
  roofer: Construction,
  painter: Palette,
  welder: Wrench,
  tiler: Grid3x3,
  landscaper: Sprout,
};

export const TRADE_COLORS = {
  electrician: { bg: 'bg-yellow-900', text: 'text-yellow-200' },
  plumber: { bg: 'bg-blue-900', text: 'text-blue-200' },
  carpenter: { bg: 'bg-amber-900', text: 'text-amber-200' },
  hvac: { bg: 'bg-cyan-900', text: 'text-cyan-200' },
  mason: { bg: 'bg-gray-700', text: 'text-gray-200' },
  roofer: { bg: 'bg-red-900', text: 'text-red-200' },
  painter: { bg: 'bg-purple-900', text: 'text-purple-200' },
  welder: { bg: 'bg-orange-900', text: 'text-orange-200' },
  tiler: { bg: 'bg-slate-700', text: 'text-slate-200' },
  landscaper: { bg: 'bg-green-900', text: 'text-green-200' },
};

export function getTradeIcon(trade) {
  return TRADE_ICONS[trade] || Wrench;
}

export function getTradeColor(trade) {
  return TRADE_COLORS[trade] || { bg: 'bg-slate-700', text: 'text-slate-200' };
}