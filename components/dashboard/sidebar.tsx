'use client';

import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  LineChart,
  FileText,
  Database,
  Settings,
  HelpCircle,
  Sparkles,
  LogOut,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { DataImportExport } from '@/components/data/import-export';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: LineChart, label: 'Analytics', href: '/analytics' },
  { icon: FileText, label: 'Reports', href: '/reports' },
  { icon: Database, label: 'Data', href: '/data' }
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-slate-900/95 via-purple-900/90 to-indigo-900/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col relative overflow-hidden">
      {/* Animated sidebar background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,107,107,0.1),transparent_70%)]" />

      {/* Floating accent elements */}
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-sm"
          style={{
            top: `${20 + i * 15}%`,
            right: `${10 + i * 8}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.7
          }}
        />
      ))}

      <div className="p-6 border-b border-slate-700/50 relative z-10">
        <div className="flex items-center gap-4">
          <motion.div
            className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30 relative overflow-hidden"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-indigo-400/20 animate-pulse" />

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              <Sparkles className="w-6 h-6 text-white drop-shadow-lg" />
            </motion.div>

            {/* Sparkle particles */}
            {Array.from({ length: 3 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  top: `${20 + i * 20}%`,
                  right: `${15 + i * 15}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              />
            ))}
          </motion.div>

          <div>
            <motion.span
              className="text-xl font-bold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ backgroundSize: "200% 200%" }}
            >
              InsightFlow
            </motion.span>
            <motion.p
              className="text-xs text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Analytics Platform
            </motion.p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          // Color schemes for each nav item
          const colorSchemes = [
            { active: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 shadow-pink-500/20', hover: 'hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-purple-500/10', icon: 'text-pink-400' },
            { active: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 shadow-blue-500/20', hover: 'hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10', icon: 'text-blue-400' },
            { active: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 shadow-emerald-500/20', hover: 'hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10', icon: 'text-emerald-400' },
            { active: 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 shadow-orange-500/20', hover: 'hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-red-500/10', icon: 'text-orange-400' }
          ];

          const scheme = colorSchemes[index % colorSchemes.length];

          return (
            <Link key={index} href={item.href}>
              <motion.div
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                  isActive
                    ? `${scheme.active} shadow-lg border border-white/10`
                    : `text-slate-400 ${scheme.hover} hover:text-white hover:shadow-md hover:border hover:border-white/5`
                }`}
                whileHover={{
                  x: 6,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated background for active state */}
                {isActive && (
                  <motion.div
                    className={`absolute inset-0 ${scheme.active} opacity-50`}
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Icon with animated glow */}
                <motion.div
                  className={`relative z-10 ${isActive ? scheme.icon : 'text-slate-500 group-hover:text-white'} transition-colors duration-300`}
                  animate={isActive ? {
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                {/* Label */}
                <span className="relative z-10 font-medium">{item.label}</span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-pink-400 to-purple-400 rounded-r-full"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                      scaleY: [0.8, 1, 0.8]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Hover particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {Array.from({ length: 3 }, (_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-1 h-1 ${scheme.icon.replace('text-', 'bg-')} rounded-full blur-sm`}
                      style={{
                        top: `${20 + i * 25}%`,
                        right: `${10 + i * 15}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-zinc-800/50">
          <DataImportExport />
        </div>
      </nav>
      
      <div className="p-3 border-t border-zinc-800/50 space-y-1">
        {session?.user && (
          <div className="mb-2 px-3 py-2 bg-zinc-800/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-300 truncate">{session.user.name || session.user.email}</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1 capitalize">
              {session.user.role || 'User'}
            </div>
          </div>
        )}

        <Link href="/settings">
          <motion.div
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
              pathname === '/settings'
                ? 'bg-indigo-600/20 text-indigo-300 shadow-lg shadow-indigo-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 hover:shadow-md'
            }`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <Settings className="w-4 h-4" />
            Settings
          </motion.div>
        </Link>

        <motion.div
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all duration-200 hover:shadow-md cursor-pointer"
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.div>

        <motion.div
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all duration-200 hover:shadow-md cursor-pointer"
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <HelpCircle className="w-4 h-4" />
          Help
        </motion.div>
      </div>
    </aside>
  );
}