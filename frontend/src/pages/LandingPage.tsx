import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Candle = { open: number; high: number; low: number; close: number };

// More realistic-looking static candle data (longer series)
const candles: Candle[] = (() => {
  const out: Candle[] = [];
  let price = 1.2000;
  for (let i = 0; i < 48; i++) {
    const drift = (Math.random() - 0.5) * 0.006;
    const open = +(price + drift).toFixed(4);
    const change = (Math.random() - 0.45) * 0.01;
    const close = +(open + change).toFixed(4);
    const high = +Math.max(open, close, open + Math.random() * 0.004).toFixed(4);
    const low = +Math.min(open, close, open - Math.random() * 0.004).toFixed(4);
    out.push({ open, high, low, close });
    price = close + (Math.random() - 0.5) * 0.002;
  }
  return out;
})();

const Chart: React.FC = () => {
  const width = 1200;
  const height = 420;
  const padding = 16;

  const values = candles.flatMap((c) => [c.high, c.low]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const scaleY = (v: number) => {
    const t = (v - min) / (max - min || 1);
    return height - padding - t * (height - padding * 2);
  };

  const candleSlot = (width - padding * 2) / candles.length;
  const candleWidth = Math.max(3, Math.floor(candleSlot * 0.6));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" className="w-full h-full">
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((s, i) => (
        <line
          key={i}
          x1={padding}
          x2={width - padding}
          y1={padding + s * (height - padding * 2)}
          y2={padding + s * (height - padding * 2)}
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={1}
        />
      ))}

      {candles.map((c, i) => {
        const x = padding + i * candleSlot + (candleSlot - candleWidth) / 2;
        const yHigh = scaleY(c.high);
        const yLow = scaleY(c.low);
        const yOpen = scaleY(c.open);
        const yClose = scaleY(c.close);
        const isBull = c.close >= c.open;
        const rectY = Math.min(yOpen, yClose);
        const rectH = Math.max(2, Math.abs(yClose - yOpen));
        const color = isBull ? "#16a34a" : "#ef4444";

        return (
          <g key={i} className="transition-transform duration-300 ease-[cubic-bezier(.2,.9,.2,1)] hover:scale-105" aria-hidden>
            <line
              x1={x + candleWidth / 2}
              x2={x + candleWidth / 2}
              y1={yHigh}
              y2={yLow}
              stroke={color}
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.95}
            />
            <rect x={x} y={rectY} width={candleWidth} height={rectH} rx={2} fill={color} opacity={0.95} />
          </g>
        );
      })}

      {/* only candlesticks */}
    </svg>
  );
};

const features = [
  {
    title: "Real-time Price Streaming",
    desc: "Live simulated tick data to practice fast decision-making.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 12h3l3 8 4-16 3 10h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Margin & Risk Controls",
    desc: "Leverage scenarios, stop-loss/take-profit and automated position sizing guidance.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 8h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Live Trading Charts",
    desc: "Candles, depth, and indicators — all in one unified view.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: "Historical Data Analysis",
    desc: "Backtest strategies using minute, hourly and daily history.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 7h.01M11 11h.01M15 15h.01" strokeLinecap="round" />
      </svg>
    ),
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 px-4">
      {/* HERO - full width, full height */}
      <section className="w-full relative overflow-hidden bg-white h-screen">
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-[cubic-bezier(.2,.9,.2,1)] ${
            mounted ? "opacity-18" : "opacity-0"
          }`}
          aria-hidden
        >
          <div className="absolute inset-0">
            <div className="w-full h-full">
              <Chart />
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col items-center justify-center h-full text-center">
          <div className={`max-w-xl transition-all duration-800 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"}`}>
            <div className="inline-flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="XNESS" className="w-14 h-14 object-contain" />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">XNESS</h1>
            <p className="text-lg text-gray-600 mb-6">Smart trading, simplified for everyone</p>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate("/signin")}
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-2xl transform transition-transform duration-300 ease-[cubic-bezier(.2,.9,.2,1)] hover:-translate-y-1 hover:scale-101"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* centered subtle divider below hero */}
      <div className="flex justify-center">
        <div className="w-32 h-px bg-gray-200 rounded-full mt-4" />
      </div>

      {/* main content container */}
      <div className="w-full max-w-6xl mx-auto mt-20">
        {/* FEATURES */}
        <section>
          <h2 className="text-2xl font-semibold text-center mb-10">Features</h2>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className={`group bg-white rounded-xl p-5 shadow-sm transform transition-all duration-500 ease-[cubic-bezier(.22,.95,.2,1)] hover:shadow-lg hover:-translate-y-1`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-green-600 flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <div className="font-medium">{f.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{f.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-32 text-center text-gray-500 mb-8">
          <div className="text-sm font-medium">xness</div>
          <div className="mt-2">
            <a
              href="https://github.com/tims-exe/xness"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 hover:underline"
            >
              Source code
            </a>
          </div>
        </footer>
      </div>

      {/* subtle float animation style + opacity utility */}
      <style>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .opacity-18 { opacity: 0.18 !important; }
      `}</style>
    </div>
  );
};

export default LandingPage;
