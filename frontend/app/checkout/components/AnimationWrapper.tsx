'use client'

import { motion } from 'framer-motion';
import { AnimationStyleProps } from '../types';

export default function AnimationWrapper({ children }: AnimationStyleProps) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}
