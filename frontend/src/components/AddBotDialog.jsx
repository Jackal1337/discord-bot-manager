import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';

import { botsAPI } from '@/lib/api';
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
            <Card className="w-full max-w-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Přidat nového bota</CardTitle>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Název bota</Label>
                    <Input
                      id="name"
                      placeholder="např. Music Bot"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Typ</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={formData.type === 'nodejs' ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, type: 'nodejs' })}
                        className="flex-1"
                      >
                        Node.js
                      </Button>
                      <Button
                        type="button"
                        variant={formData.type === 'python' ? 'default' : 'outline'}
                        onClick={() => setFormData({ ...formData, type: 'python' })}
                        className="flex-1"
                      >
                        Python
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="script_path">Cesta ke scriptu</Label>
                    <Input
                      id="script_path"
                      placeholder="/home/user/bots/music-bot/index.js"
                      value={formData.script_path}
                      onChange={(e) => setFormData({ ...formData, script_path: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Absolutní cesta k hlavnímu souboru bota
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="env_vars">ENV Variables (volitelné)</Label>
                    <textarea
                      id="env_vars"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder='{"TOKEN": "xxx", "PREFIX": "!"}'
                      value={formData.env_vars}
                      onChange={(e) => setFormData({ ...formData, env_vars: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">JSON formát</p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Zrušit
                    </Button>
                    <Button type="submit" disabled={loading}>
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
