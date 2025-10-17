import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { botsAPI, envAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AddBotDialog({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'nodejs',
    script_path: '',
    env_vars: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingEnv, setLoadingEnv] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await botsAPI.create(formData);
      toast.success('Bot přidán');
      onSuccess();
      onClose();
      // Reset form
      setFormData({ name: '', type: 'nodejs', script_path: '', env_vars: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chyba při přidávání bota');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadEnv = async () => {
    if (!formData.script_path) {
      toast.error('Nejdřív zadej cestu ke scriptu');
      return;
    }

    setLoadingEnv(true);

    try {
      const response = await envAPI.parseEnv(formData.script_path);

      if (response.data.success) {
        const envVars = response.data.env_vars;

        if (Object.keys(envVars).length > 0) {
          setFormData({
            ...formData,
            env_vars: JSON.stringify(envVars, null, 2)
          });
          toast.success(response.data.message);
        } else {
          toast.info('.env soubor nenalezen nebo je prázdný');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chyba při načítání .env');
    } finally {
      setLoadingEnv(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-lg bg-slate-900 border-slate-800 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Přidat nového bota</CardTitle>
                  <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-200">Název bota</Label>
                    <Input
                      id="name"
                      placeholder="např. Music Bot"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-slate-200">Typ</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={formData.type === 'nodejs' ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, type: 'nodejs' })}
                        className={formData.type === 'nodejs' ? 'flex-1 bg-blue-600 hover:bg-blue-700' : 'flex-1 bg-slate-800 border-slate-700 text-white hover:bg-slate-700'}
                      >
                        Node.js
                      </Button>
                      <Button
                        type="button"
                        variant={formData.type === 'python' ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, type: 'python' })}
                        className={formData.type === 'python' ? 'flex-1 bg-blue-600 hover:bg-blue-700' : 'flex-1 bg-slate-800 border-slate-700 text-white hover:bg-slate-700'}
                      >
                        Python
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="script_path" className="text-slate-200">Cesta ke scriptu</Label>
                    <div className="flex gap-2">
                      <Input
                        id="script_path"
                        placeholder="/home/user/bots/music-bot/index.js"
                        value={formData.script_path}
                        onChange={(e) => setFormData({ ...formData, script_path: e.target.value })}
                        required
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleLoadEnv}
                        disabled={loadingEnv || !formData.script_path}
                        className="bg-slate-700 hover:bg-slate-600 text-white"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {loadingEnv ? 'Načítám...' : 'Načíst .env'}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Absolutní cesta k hlavnímu souboru bota
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="env_vars" className="text-slate-200">ENV Variables (volitelné)</Label>
                    <textarea
                      id="env_vars"
                      className="flex min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder='{"TOKEN": "xxx", "PREFIX": "!"}'
                      value={formData.env_vars}
                      onChange={(e) => setFormData({ ...formData, env_vars: e.target.value })}
                    />
                    <p className="text-xs text-slate-400">JSON formát</p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={onClose} className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                      Zrušit
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                      {loading ? 'Přidávám...' : 'Přidat bota'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
