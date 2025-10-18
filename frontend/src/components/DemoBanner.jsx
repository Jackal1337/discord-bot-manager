import React from 'react';
import { Info, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DemoBanner() {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-500"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-4">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div className="text-center flex-1">
            <p className="text-white font-medium">
              {t('demoMode')}
            </p>
            <p className="text-blue-100 text-sm">
              {t('demoDescription')}
            </p>
          </div>
          <a
            href="https://github.com/Jackal1337/discord-bot-manager"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-white font-medium"
          >
            <Github className="w-4 h-4" />
            {t('viewGithub')}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
