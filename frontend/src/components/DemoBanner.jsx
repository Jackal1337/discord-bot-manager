import React from 'react';
import { Info, Github } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DemoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-500"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium">
              Demo režim
            </p>
            <p className="text-blue-100 text-sm">
              Data se resetují při obnovení stránky - vyzkoušej všechny funkce!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
