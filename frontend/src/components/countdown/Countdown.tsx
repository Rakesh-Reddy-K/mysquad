import { useEffect, useState } from 'react';
import { timeUntil } from '@/lib/utils';
import { motion } from 'framer-motion';

export function Countdown({ target }: { target: string }) {
  const [time, setTime] = useState(() => timeUntil(target));

  useEffect(() => {
    const interval = setInterval(() => setTime(timeUntil(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Min', value: time.minutes },
    { label: 'Sec', value: time.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {units.map((unit, i) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="bg-white/15 dark:bg-white/10 backdrop-blur-md rounded-xl py-2.5 text-center"
        >
          <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">
            {String(unit.value).padStart(2, '0')}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-white/70">{unit.label}</p>
        </motion.div>
      ))}
    </div>
  );
}