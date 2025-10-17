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
      online: { variant: 'success', text: 'Online' },
      stopped: { variant: 'error', text: 'Offline' },
      stopping: { variant: 'warning', text: 'Zastavuji' },
      errored: { variant: 'error', text: 'Chyba' },
      offline: { variant: 'outline', text: 'Offline' },
    };

    const config = statusMap[status] || statusMap.offline;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Načítám...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Bot Manager</h1>
            <p className="text-sm text-slate-400">Vítej, {user?.username}</p>
          </div>
          <Button variant="ghost" onClick={logout}>
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
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Celkem botů</CardDescription>
                  <CardTitle className="text-3xl">{stats.total_bots}</CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Online</CardDescription>
                  <CardTitle className="text-3xl text-green-500">{stats.online}</CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>CPU Usage</CardDescription>
                  <CardTitle className="text-3xl">{formatCPU(stats.total_cpu)}</CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Memory</CardDescription>
                  <CardTitle className="text-3xl">{formatMemory(stats.total_memory)}</CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Add Bot Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Moje boty</h2>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Přidat bota
          </Button>
        </div>

        {/* Bots Grid */}
        {bots.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
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
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/bot/${bot.id}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{bot.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {bot.type === 'nodejs' ? '🟢 Node.js' : '🐍 Python'}
                        </CardDescription>
                      </div>
                      {getStatusBadge(bot.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {bot.status === 'online' && (
                      <div className="space-y-1 text-sm text-muted-foreground mb-4">
                        <div className="flex justify-between">
                          <span>Uptime:</span>
                          <span>{formatUptime(Date.now() - bot.uptime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CPU:</span>
                          <span>{formatCPU(bot.cpu)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>RAM:</span>
                          <span>{formatMemory(bot.memory)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {bot.status === 'online' ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStop(bot)}>
                            <Square className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRestart(bot)}>
                            <RotateCw className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => handleStart(bot)}>
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(bot)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/bot/${bot.id}`)}>
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
