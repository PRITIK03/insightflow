'use client';

import { 
  LayoutDashboard, 
  LineChart, 
  Zap, 
  Settings, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { DataImportExport } from '@/components/data/import-export';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '#', active: true },
  { icon: LineChart, label: 'Analytics', href: '#' },
  { icon: Zap, label: 'Forecasts', href: '#' },
  { icon: Sparkles, label: 'AI Insights', href: '#' }
];

export function Sidebar() {
  return (
    <aside className="w-56 h-screen bg-zinc-900/50 border-r border-zinc-800/50 flex flex-col">
      <div className="p-4 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-zinc-100">InsightFlow</span>
        </div>
      </div>
      
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-zinc-800/50">
          <DataImportExport />
        </div>
      </nav>
      
      <div className="p-3 border-t border-zinc-800/50 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors">
          <HelpCircle className="w-4 h-4" />
          Help
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}