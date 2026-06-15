import { motion } from 'framer-motion';
import { Home, Calendar, BarChart, User } from 'lucide-react';

export type NavigationTab = 'home' | 'schedule' | 'stats' | 'profile';

interface NavItem {
  id: NavigationTab;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'schedule', icon: Calendar, label: 'Agenda' },
  { id: 'stats', icon: BarChart, label: 'Stats' },
  { id: 'profile', icon: User, label: 'Perfil' },
];

interface BottomNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 safe-bottom"
    >
      <div className="mx-4 mb-4">
        <div className="bg-surface-secondary/90 backdrop-blur-xl rounded-3xl border border-white/5 shadow-elevated px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  whileTap={{ scale: 0.9 }}
                  className="relative flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/5 rounded-2xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  <div className="relative z-10">
                    <Icon
                      className={`w-5 h-5 transition-colors ${isActive ? 'text-mint-400' : 'text-obsidian-500'}`}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  </div>

                  <span className={`text-[10px] font-medium tracking-wide uppercase ${isActive ? 'text-white' : 'text-obsidian-500'}`}>
                    {item.label}
                  </span>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="absolute -top-1 w-1 h-1 rounded-full bg-mint-400"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
