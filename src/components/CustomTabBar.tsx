import { motion } from 'framer-motion';
import { Home, Calendar, BarChart, User, Plus } from 'lucide-react';

type TabId = 'home' | 'schedule' | 'stats' | 'profile';

interface TabItem {
  id: TabId;
  icon: React.ElementType;
  label: string;
}

const tabs: TabItem[] = [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'schedule', icon: Calendar, label: 'Agenda' },
  { id: 'stats', icon: BarChart, label: 'Stats' },
  { id: 'profile', icon: User, label: 'Perfil' },
];

interface CustomTabBarProps {
  activeTab: string;
  onTabChange: (tab: TabId) => void;
  onCenterClick?: () => void;
}

function TabButton({
  tab,
  isActive,
  onTabChange,
}: {
  tab: TabItem;
  isActive: boolean;
  onTabChange: (tab: TabId) => void;
}) {
  const Icon = tab.icon;

  return (
    <motion.button
      onClick={() => onTabChange(tab.id)}
      whileTap={{ scale: 0.9 }}
      className="relative flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-colors touch-manipulation"
    >
      {isActive && (
        <motion.div
          layoutId="activeTabBg"
          className="absolute inset-0 rounded-2xl"
          style={{ background: 'rgba(255, 255, 255, 0.05)' }}
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
        {tab.label}
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
}

export function CustomTabBar({ activeTab, onTabChange, onCenterClick }: CustomTabBarProps) {
  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);
  return (
    <motion.nav
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-4 mb-4">
        <div
          className="rounded-3xl shadow-lg px-2 py-2"
          style={{
            background: 'rgba(26, 26, 34, 0.9)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="flex items-center justify-around">
            {leftTabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onTabChange={onTabChange}
              />
            ))}

            <motion.button
              onClick={onCenterClick}
              whileTap={{ scale: 0.9 }}
              className="relative flex items-center justify-center p-2 rounded-2xl transition-colors touch-manipulation"
            >
              <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-mint-400 to-emerald-500 shadow-[0_0_24px_rgba(52,211,153,0.35)]">
                <Plus className="w-6 h-6 text-obsidian-950" strokeWidth={2.5} />
              </div>
            </motion.button>

            {rightTabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onTabChange={onTabChange}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export type { TabId };
