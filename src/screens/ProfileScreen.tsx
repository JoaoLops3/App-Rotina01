import { motion } from "framer-motion";
import { IonPage, IonContent } from "@ionic/react";
import {
  Bell,
  Settings,
  Lock,
  Download,
  Trash2,
  LogOut,
  Flame,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { OrbBackground } from "../components/OrbBackground";
import { useTasks } from "../lib/tasks-context";

const USER_NAME = "Alex";

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}

function SettingsRow({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.04] transition-colors touch-manipulation"
    >
      <Icon
        className={`w-5 h-5 ${danger ? "text-coral-500" : "text-obsidian-300"}`}
        strokeWidth={1.5}
      />
      <span
        className={`flex-1 text-sm font-medium ${danger ? "text-coral-500" : "text-obsidian-200"}`}
      >
        {label}
      </span>
      <ChevronRight className="w-4 h-4 text-obsidian-500" strokeWidth={1.5} />
    </button>
  );
}

function SectionLabel({
  children,
  danger = false,
}: {
  children: string;
  danger?: boolean;
}) {
  return (
    <p
      className={`mb-2 px-1 text-xs font-medium uppercase tracking-wide ${
        danger ? "text-coral-500" : "text-obsidian-500"
      }`}
    >
      {children}
    </p>
  );
}

export function ProfileScreen() {
  const { streak } = useTasks();

  const noop = () => {};

  return (
    <IonPage>
      <IonContent scrollY={true} className="ion-content-custom">
        <OrbBackground />

        <div className="relative z-10 min-h-screen pb-32">
          <div className="px-4 pt-12 pb-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center text-center"
            >
              <div
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-mint-400 to-electric-500 p-0.5"
                style={{ boxShadow: "0 0 30px rgba(52, 211, 153, 0.25)" }}
              >
                <div className="w-full h-full rounded-[22px] bg-surface-primary flex items-center justify-center">
                  <span
                    className="font-display font-bold text-3xl text-white"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    {USER_NAME.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <h1
                className="mt-4 mb-0 font-display font-semibold text-2xl text-white tracking-tight"
                style={{ fontFamily: "Space Grotesk" }}
              >
                {USER_NAME}
              </h1>
              <p className="text-obsidian-500 text-sm mt-1">
                Construindo uma rotina melhor,
                <br />
                um dia de cada vez.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10">
                <Flame className="w-3.5 h-3.5 text-coral-400" strokeWidth={2} />
                <span className="text-xs font-medium text-obsidian-200">
                  {streak} {streak === 1 ? "dia" : "dias"} de sequência
                </span>
              </div>
            </motion.div>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <SectionLabel>Preferências</SectionLabel>
              <div className="card-glass divide-y divide-white/5 overflow-hidden">
                <SettingsRow icon={Bell} label="Notificações" onClick={noop} />
                <SettingsRow
                  icon={Settings}
                  label="Preferências"
                  onClick={noop}
                />
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <SectionLabel>Conta</SectionLabel>
              <div className="card-glass divide-y divide-white/5 overflow-hidden">
                <SettingsRow icon={Lock} label="Trocar senha" onClick={noop} />
                <SettingsRow
                  icon={Download}
                  label="Exportar meus dados"
                  onClick={noop}
                />
                <SettingsRow
                  icon={Trash2}
                  label="Excluir conta"
                  danger
                  onClick={noop}
                />
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button
                type="button"
                onClick={noop}
                className="flex w-full items-center justify-center gap-2 px-5 py-4 rounded-3xl border border-white/10 text-obsidian-200 text-sm font-medium hover:bg-white/[0.04] transition-colors touch-manipulation"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                Sair
              </button>
            </motion.section>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
