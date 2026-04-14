"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function TypingText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    setShown("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 12);
    return () => window.clearInterval(id);
  }, [text]);

  return (
    <motion.p
      initial={{ opacity: 0.2 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {shown}
      <span className="inline-block w-2 animate-pulse">▍</span>
    </motion.p>
  );
}
