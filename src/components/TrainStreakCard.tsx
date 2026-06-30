import { useEffect } from "react";
import type { DayDot } from "../lib/day-stats";

type StreakState = "on-time" | "delayed" | "stopped";

interface TrainStreakCardProps {
  streakDays: number;
  recordDays: number;
  weekDots?: DayDot[];
  streakState?: StreakState;
}

function resolveState(days: number, dots: DayDot[]): StreakState {
  if (days === 0) return "stopped";
  const today = dots[dots.length - 1];
  if (today?.status === "today-partial") return "delayed";
  return "on-time";
}

const STATE_COLORS: Record<
  StreakState,
  {
    primary: string;
    dark: string;
    mid: string;
    light: string;
    label: string;
    trackSpeed: string;
  }
> = {
  "on-time": {
    primary: "#1D9E75",
    dark: "#085041",
    mid: "#0F6E56",
    light: "#9FE1CB",
    label: "trem no horário",
    trackSpeed: "0.55s",
  },
  delayed: {
    primary: "#BA7517",
    dark: "#633806",
    mid: "#854F0B",
    light: "#FAC775",
    label: "trem atrasado",
    trackSpeed: "0.9s",
  },
  stopped: {
    primary: "#888780",
    dark: "#444441",
    mid: "#5F5E5A",
    light: "#D3D1C7",
    label: "o trem voltou aos trilhos",
    trackSpeed: "0s",
  },
};

const DOT_COLORS: Record<DayDot["status"], { bg: string; outline?: string }> = {
  full: { bg: "#1D9E75" },
  partial: { bg: "#BA7517" },
  empty: { bg: "transparent" },
  "today-full": { bg: "#1D9E75", outline: "#1D9E75" },
  "today-partial": { bg: "#BA7517", outline: "#BA7517" },
};

function TrainSVG({
  colors,
  animate,
  trackSpeed,
}: {
  colors: (typeof STATE_COLORS)["on-time"];
  animate: boolean;
  trackSpeed: string;
}) {
  const { primary, dark, mid, light } = colors;

  const styleId = "trilho-train-anim";
  useEffect(() => {
    if (!animate) return;
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes trilho-wheels {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes trilho-chug {
        0%,100% { transform: translateY(0px); }
        50%      { transform: translateY(-1.5px); }
      }
      @keyframes trilho-track {
        from { transform: translateX(0px); }
        to   { transform: translateX(-32px); }
      }
      @keyframes trilho-smoke1 {
        0%   { opacity: 0.9; transform: translate(0,0) scale(1); }
        100% { opacity: 0;   transform: translate(-22px,-14px) scale(1.6); }
      }
      @keyframes trilho-smoke2 {
        0%   { opacity: 0.55; transform: translate(0,0) scale(1); }
        100% { opacity: 0;    transform: translate(-28px,-18px) scale(1.8); }
      }
      @keyframes trilho-smoke3 {
        0%   { opacity: 0.28; transform: translate(0,0) scale(1); }
        100% { opacity: 0;    transform: translate(-34px,-22px) scale(2); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, [animate]);

  const trackAnim =
    animate && trackSpeed !== "0s"
      ? { animation: `trilho-track ${trackSpeed} linear infinite` }
      : {};

  const chugStyle = animate
    ? { animation: "trilho-chug 0.5s ease-in-out infinite" }
    : {};
  const smoke1Style = animate
    ? {
        transformOrigin: "208px 13px",
        animation: "trilho-smoke1 1.2s ease-out infinite",
      }
    : { opacity: 0.9 };
  const smoke2Style = animate
    ? {
        transformOrigin: "207px 14px",
        animation: "trilho-smoke2 1.2s ease-out 0.3s infinite",
      }
    : { opacity: 0.55 };
  const smoke3Style = animate
    ? {
        transformOrigin: "206px 15px",
        animation: "trilho-smoke3 1.2s ease-out 0.6s infinite",
      }
    : { opacity: 0.28 };

  function Wheel({
    cx,
    cy,
    r,
    big,
  }: {
    cx: number;
    cy: number;
    r: number;
    big?: boolean;
  }) {
    const wheelStyle = animate
      ? {
          transformOrigin: `${cx}px ${cy}px`,
          animation: `trilho-wheels ${big ? "0.55" : "0.6"}s linear infinite`,
        }
      : {};
    return (
      <g style={wheelStyle}>
        <circle cx={cx} cy={cy} r={r} fill={dark} />
        <circle cx={cx} cy={cy} r={r * 0.5} fill={primary} />
        <line
          x1={cx}
          y1={cy - r}
          x2={cx}
          y2={cy + r}
          stroke={primary}
          strokeWidth={big ? 1.2 : 1}
        />
        <line
          x1={cx - r}
          y1={cy}
          x2={cx + r}
          y2={cy}
          stroke={primary}
          strokeWidth={big ? 1.2 : 1}
        />
      </g>
    );
  }

  const sleepers = Array.from({ length: 13 }, (_, i) => -16 + i * 32);

  return (
    <svg
      width="100%"
      viewBox="0 -24 320 92"
      role="img"
      aria-label="Ilustração do trem representando a sequência"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <clipPath id="trilho-clip">
          <rect x="0" y="44" width="320" height="16" />
        </clipPath>
      </defs>

      <line
        x1="0"
        y1="50"
        x2="320"
        y2="50"
        stroke={primary}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="0"
        y1="56"
        x2="320"
        y2="56"
        stroke={primary}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <g clipPath="url(#trilho-clip)">
        <g style={trackAnim}>
          {sleepers.map((x) => (
            <line
              key={x}
              x1={x}
              y1="48"
              x2={x}
              y2="58"
              stroke={mid}
              strokeWidth="2.5"
            />
          ))}
        </g>
      </g>

      <g style={chugStyle}>
        <rect x="8" y="31" width="56" height="20" rx="3" fill={primary} />
        <rect x="6" y="46" width="60" height="5" rx="2" fill={mid} />
        <Wheel cx={20} cy={51} r={5} />
        <Wheel cx={56} cy={51} r={5} />
        <line x1="66" y1="41" x2="76" y2="41" stroke={dark} strokeWidth="2" />

        <rect x="76" y="31" width="62" height="20" rx="3" fill={primary} />
        <rect x="74" y="46" width="66" height="5" rx="2" fill={mid} />
        <Wheel cx={90} cy={51} r={5} />
        <Wheel cx={130} cy={51} r={5} />
        <line x1="140" y1="41" x2="150" y2="41" stroke={dark} strokeWidth="2" />

        <rect x="150" y="26" width="90" height="25" rx="3" fill={primary} />
        <rect x="148" y="17" width="30" height="34" rx="3" fill={mid} />
        <rect x="153" y="21" width="11" height="9" rx="1" fill={light} />
        <rect x="205" y="16" width="8" height="11" rx="2" fill={dark} />
        <line
          style={smoke1Style}
          x1="208"
          y1="13"
          x2="192"
          y2="5"
          stroke={light}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          style={smoke2Style}
          x1="207"
          y1="14"
          x2="188"
          y2="7"
          stroke={light}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          style={smoke3Style}
          x1="206"
          y1="15"
          x2="184"
          y2="10"
          stroke={light}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <rect x="236" y="30" width="12" height="17" rx="6" fill={dark} />
        <rect x="146" y="46" width="106" height="5" rx="2" fill={dark} />
        <Wheel cx={162} cy={51} r={6} big />
        <Wheel cx={186} cy={51} r={6} big />
        <Wheel cx={210} cy={51} r={6} big />
        <Wheel cx={234} cy={51} r={5} />
      </g>
    </svg>
  );
}

export function TrainStreakCard({
  streakDays,
  recordDays,
  weekDots,
  streakState,
}: TrainStreakCardProps) {
  const dots = weekDots ?? [];
  const state = streakState ?? resolveState(streakDays, dots);
  const colors = STATE_COLORS[state];
  const pct =
    recordDays > 0 ? Math.min(100, (streakDays / recordDays) * 100) : 0;

  return (
    <div
      style={{
        backgroundColor: "#1e1e1e",
        borderRadius: 16,
        border: "0.5px solid #333",
        padding: "1rem 1.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              color: "#888",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              margin: "0 0 4px",
            }}
          >
            Sequência
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: "#fff",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {streakDays} {streakDays === 1 ? "dia" : "dias"}
          </p>
          <p style={{ fontSize: 13, color: colors.mid, margin: "4px 0 0" }}>
            {colors.label}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, color: "#888", margin: "0 0 2px" }}>
            recorde
          </p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: "#888",
              margin: 0,
            }}
          >
            {recordDays} dias
          </p>
        </div>
      </div>

      <div style={{ margin: "12px 0 6px", overflow: "visible" }}>
        <TrainSVG
          colors={colors}
          animate={state !== "stopped"}
          trackSpeed={colors.trackSpeed}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          marginTop: 10,
        }}
      >
        {dots.map((dot, i) => {
          const c = DOT_COLORS[dot.status];
          return (
            <div
              key={i}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: c.bg,
                border: dot.status === "empty" ? "0.5px solid #555" : "none",
                outline: c.outline ? `2.5px solid ${c.outline}` : "none",
                outlineOffset: c.outline ? 2 : 0,
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          height: 5,
          borderRadius: 3,
          backgroundColor: "#111",
          marginTop: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 3,
            backgroundColor: colors.primary,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}
