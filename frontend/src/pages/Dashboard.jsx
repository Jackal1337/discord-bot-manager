import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Square, RotateCw, Trash2, Plus, LogOut, Activity } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/lib/auth';
import { botsAPI, statsAPI } from '@/lib/api';
import { formatUptime, formatMemory, formatCPU } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import AddBotDialog from '@/components/AddBotDialog';

export default function Dashboard() {
  const [bots, setBots] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [botsRes, statsRes] = await Promise.all([
        botsAPI.getAll(),
        statsAPI.get(),
      ]);
      setBots(botsRes.data.bots);
      setStats(statsRes.data.stats);
    } catch (error) {
      toast.error('Chyba při načítání dat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh každých 5 sekund
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async (bot) => {
    try {
      await botsAPI.start(bot.id);
      toast.success(`Bot "${bot.name}" spuštěn`);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chyba při spuštění');
    }
  };

  const handleStop = async (bot) => {
    try {
      await botsAPI.stop(bot.id);
      toast.success(`Bot "${bot.name}" zastaven`);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chyba při zastavení');
    }
  };

  const handleRestart = async (bot) => {
    try {
      await botsAPI.restart(bot.id);
      toast.success(`Bot "${bot.name}" restartován`);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chyba při restartu');
    }
  };

  const handleDelete = async (bot) => {
    if (!confirm(`Opravdu smazat bota "${bot.name}"?`)) return;

    try {
      await botsAPI.delete(bot.id);
      toast.success(`Bot "${bot.name}" smazán`);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chyba při mazání');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      online: { className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', text: 'Online', dot: 'bg-emerald-500' },
      stopped: { className: 'bg-slate-500/20 text-slate-400 border-slate-500/30', text: 'Offline', dot: 'bg-slate-500' },
      stopping: { className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', text: 'Zastavuji', dot: 'bg-yellow-500' },
      errored: { className: 'bg-red-500/20 text-red-400 border-red-500/30', text: 'Chyba', dot: 'bg-red-500' },
      offline: { className: 'bg-slate-500/20 text-slate-400 border-slate-500/30', text: 'Offline', dot: 'bg-slate-500' },
    };

    const config = statusMap[status] || statusMap.offline;
    return (
      <Badge className={config.className}>
        <span className={`inline-block w-2 h-2 rounded-full ${config.dot} mr-2`}></span>
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Načítám...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Bot Manager</h1>
            <p className="text-sm text-slate-400">Vítej, {user?.username}</p>
          </div>
          <Button variant="ghost" onClick={logout} className="text-slate-300 hover:text-white hover:bg-slate-800">
            <LogOut className="w-4 h-4 mr-2" />
            Odhlásit
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardDescription className="text-slate-400">Celkem botů</CardDescription>
                  <CardTitle className="text-3xl text-white">{stats.total_bots}</CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardDescription className="text-slate-400">Online</CardDescription>
                  <CardTitle className="text-3xl text-emerald-400">{stats.online}</CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardDescription className="text-slate-400">CPU Usage</CardDescription>
                  <CardTitle className="text-3xl text-blue-400">{formatCPU(stats.total_cpu)}</CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardDescription className="text-slate-400">Memory</CardDescription>
                  <CardTitle className="text-3xl text-purple-400">{formatMemory(stats.total_memory)}</CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Add Bot Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Moji boti</h2>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Přidat bota
          </Button>
        </div>

        {/* Bots Grid */}
        {bots.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12 text-center text-slate-400">
              Zatím nemáš žádné boty. Přidej prvního!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.map((bot, index) => (
              <motion.div
                key={bot.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-2xl transition-all cursor-pointer" onClick={() => navigate(`/bot/${bot.id}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-white">{bot.name}</CardTitle>
                        <CardDescription className="mt-1 text-slate-400">
                          {bot.type === 'nodejs' ? 'Node.js' : 'Python'}
                        </CardDescription>
                      </div>
                      {getStatusBadge(bot.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {bot.status === 'online' && (
                      <div className="space-y-1 text-sm text-slate-300 mb-4 bg-slate-800/50 rounded-lg p-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Uptime:</span>
                          <span className="font-medium">{formatUptime(Date.now() - bot.uptime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">CPU:</span>
                          <span className="font-medium text-blue-400">{formatCPU(bot.cpu)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">RAM:</span>
                          <span className="font-medium text-purple-400">{formatMemory(bot.memory)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {bot.status === 'online' ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStop(bot)} className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white">
                            <Square className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRestart(bot)} className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white">
                            <RotateCw className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => handleStart(bot)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(bot)} className="bg-red-600 hover:bg-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/bot/${bot.id}`)} className="hover:bg-slate-800 text-slate-300">
                        <Activity className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Bot Dialog */}
      <AddBotDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} onSuccess={loadData} />
    </div>
  );
}
