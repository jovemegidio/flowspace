import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  onDone: () => void
}

const FEATURES = ["Kanban offline", "Notas rich-text", "Música local"]

export function SplashScreen({ onDone }: Props) {
  const [progress, setProgress] = useState(0)
  const [featureIndex, setFeatureIndex] = useState(0)
  const [phase, setPhase] = useState<"in" | "out">("in")

  useEffect(() => {
    const duration = 2600
    const start = performance.now()

    const raf = requestAnimationFrame(function tick(now) {
      const p = Math.min((now - start) / duration, 1)
      setProgress(p)
      if (p < 1) {
        requestAnimationFrame(tick)
      } else {
        setPhase("out")
        setTimeout(onDone, 480)
      }
    })

    const featureTimer = setInterval(() => {
      setFeatureIndex((i) => (i + 1) % FEATURES.length)
    }, 900)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(featureTimer)
    }
  }, [onDone])

  const eased = Math.pow(progress, 0.38)

  return (
    <AnimatePresence>
      {phase === "in" && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.48, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
          style={{ background: "#07070f" }}
        >
          {/* Radial glow – primary */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 48%, rgba(99,102,241,0.14) 0%, rgba(139,92,246,0.06) 55%, transparent 80%)",
            }}
          />

          {/* Secondary glow – left */}
          <motion.div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 400,
              height: 400,
              top: "20%",
              left: "10%",
              background: "radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Secondary glow – right */}
          <motion.div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 320,
              height: 320,
              bottom: "20%",
              right: "12%",
              background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
            animate={{ x: [0, -18, 0], y: [0, 12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          />

          {/* Subtle grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
            }}
          />

          {/* Grain */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.035]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px",
            }}
          />

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-7 relative z-10"
          >
            {/* Icon with ring */}
            <motion.div
              className="relative"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute -inset-3 rounded-[36px]"
                style={{
                  background: "rgba(99,102,241,0)",
                  boxShadow: "0 0 0 1px rgba(99,102,241,0.2), 0 0 40px rgba(99,102,241,0.15)",
                  borderRadius: 36,
                }}
                animate={{ boxShadow: [
                  "0 0 0 1px rgba(99,102,241,0.15), 0 0 30px rgba(99,102,241,0.1)",
                  "0 0 0 1px rgba(99,102,241,0.35), 0 0 60px rgba(99,102,241,0.22)",
                  "0 0 0 1px rgba(99,102,241,0.15), 0 0 30px rgba(99,102,241,0.1)",
                ]}}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Blur shadow */}
              <div
                className="absolute inset-0 rounded-[28px] blur-2xl"
                style={{ background: "rgba(99,102,241,0.3)", transform: "scale(0.85) translateY(16px)" }}
              />
              <img
                src="/Icone.png"
                alt="Flowspace"
                className="relative w-[88px] h-[88px] rounded-[28px] shadow-2xl"
                style={{
                  boxShadow: "0 12px 48px rgba(99,102,241,0.35), 0 0 0 1px rgba(255,255,255,0.07)",
                }}
              />
            </motion.div>

            {/* Wordmark + tagline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.55, ease: "easeOut" }}
              className="flex flex-col items-center gap-2.5"
            >
              <img
                src="/Logo.png"
                alt="Flowspace"
                className="h-9 object-contain"
                style={{ filter: "brightness(1.08) saturate(1.1)" }}
              />
              <p
                className="text-[12px] tracking-[0.22em] uppercase font-medium"
                style={{ color: "rgba(255,255,255,0.28)" }}
              >
                seu espaço de foco
              </p>
            </motion.div>

            {/* Feature cycling pill */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="h-6 flex items-center"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={featureIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.18)",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span className="text-[11px] text-indigo-300 font-medium tracking-wide">
                    {FEATURES[featureIndex]}
                  </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex flex-col items-center gap-0"
            >
              <div
                className="relative rounded-full overflow-hidden"
                style={{ width: 200, height: 2, background: "rgba(255,255,255,0.05)" }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${eased * 100}%`,
                    background: "linear-gradient(90deg, #6366f1 0%, #a78bfa 60%, #818cf8 100%)",
                    boxShadow: "0 0 10px rgba(99,102,241,0.7)",
                  }}
                />
                {/* Moving shimmer */}
                <motion.div
                  className="absolute inset-y-0 rounded-full"
                  style={{
                    width: 48,
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                    left: `${Math.max(0, eased * 200 - 48)}px`,
                  }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.22 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-7 text-[10px] font-mono tracking-widest"
            style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em" }}
          >
            v0.1.0
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
