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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">
                Demo režim - Read-only verze
              </p>
              <p className="text-blue-100 text-sm">
                Můžeš prozkoumat funkce, ale modifikační operace jsou zakázané
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href="https://github.com/your-username/bot-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm font-medium">GitHub</span>
            </a>
            <a
              href="https://bots.notjackal.eu"
              className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors text-sm"
            >
              Produkční verze
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
