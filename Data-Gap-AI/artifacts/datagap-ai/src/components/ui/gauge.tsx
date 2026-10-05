import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GaugeProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
}

export function Gauge({ value, size = 160, strokeWidth = 12 }: GaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timeout);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Arc goes from 140deg to 40deg (260 deg total)
  const arcLength = circumference * (260 / 360);
  const strokeDasharray = `${arcLength} ${circumference}`;
  const strokeDashoffset = arcLength - (animatedValue / 100) * arcLength;

  let colorClass = "text-primary";
  let glowClass = "shadow-[0_0_20px_rgba(var(--primary),0.4)]";
  
  if (value <= 40) {
    colorClass = "text-destructive";
    glowClass = "shadow-[0_0_20px_rgba(var(--destructive),0.4)]";
  } else if (value <= 70) {
    colorClass = "text-amber-500";
    glowClass = "shadow-[0_0_20px_rgba(245,158,11,0.4)]";
  } else {
    colorClass = "text-emerald-500";
    glowClass = "shadow-[0_0_20px_rgba(16,185,129,0.4)]";
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Track */}
      <svg className="absolute inset-0 rotate-[140deg]" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Animated Foreground Track */}
      <svg className="absolute inset-0 rotate-[140deg]" width={size} height={size}>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={colorClass}
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>

      {/* Value Text */}
      <div className="absolute flex flex-col items-center justify-center pb-4">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`text-5xl font-display font-bold ${colorClass}`}
        >
          {Math.round(animatedValue)}
        </motion.span>
        <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Readiness</span>
      </div>
      
      {/* Inner Glow center */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full blur-[30px] opacity-20 bg-current ${colorClass} pointer-events-none`} />
    </div>
  );
}
