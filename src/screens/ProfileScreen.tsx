import { motion } from "framer-motion";
import { IonPage, IonContent } from "@ionic/react";
import { Bell, Settings } from "lucide-react";
import { OrbBackground } from "../components/OrbBackground";

const USER_NAME = "Alex";

export function ProfileScreen() {
  const settingsRows = [
    { icon: Bell, label: "Notificações" },
    { icon: Settings, label: "Preferências" },
  ];

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
                Construindo uma rotina melhor, um dia de cada vez.
              </p>
            </motion.div>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="card-glass divide-y divide-white/5 overflow-hidden"
            >
              {settingsRows.map((row) => {
                const Icon = row.icon;
                return (
                  <button
                    key={row.label}
                    type="button"
                    className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.04] transition-colors touch-manipulation"
                  >
                    <Icon
                      className="w-5 h-5 text-obsidian-300"
                      strokeWidth={1.5}
                    />
                    <span className="text-obsidian-200 text-sm font-medium">
                      {row.label}
                    </span>
                  </button>
                );
              })}
            </motion.section>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
