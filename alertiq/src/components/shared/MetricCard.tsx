import { type ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  iconColor?: string;
  accentColor?: string;
}

function AnimatedNumber({ target }: { target: number }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const steps = 40;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCurrent(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <>{current}</>;
}

export default function MetricCard({
  title,
  value,
  icon,
  iconColor = "#EB5928",
  accentColor = "#EB5928",
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ scale: 1.02, y: -2 }}
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 14,
        padding: "20px 22px",
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s",
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {title}
        </span>
        <div
          style={{
            width: 34, height: 34, borderRadius: 9,
            backgroundColor: `${iconColor}15`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
      </div>
      <p style={{ fontSize: 34, fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1 }}>
        <AnimatedNumber target={value} />
      </p>
    </motion.div>
  );
}
