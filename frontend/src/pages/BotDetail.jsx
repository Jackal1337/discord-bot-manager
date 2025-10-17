import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Square, RotateCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { botsAPI } from '@/lib/api';
import { formatUptime, formatMemory, formatCPU } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function BotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bot, setBot] = useState(null);
  const [logs, setLogs] = useState({ stdout: '', stderr: '' });
  const [loading, setLoading] = useState(true);

  const loadBot = async () => {
    try {
      const response = await botsAPI.getOne(id);
      setBot(response.data.bot);
    } catch (error) {
      toast.error('Chyba při načítání bota');
      navigate('/');
    }
  };

  const loadLogs = async () => {
    try {
      const response = await botsAPI.getLogs(id, 200);
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Chyba při načítání logů:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadBot();
      await loadLogs();
      setLoading(false);
    };
    load();

    // Auto-refresh každých 3 sekundy
    const interval = setInterval(() => {
      loadBot();
      loadLogs();
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  const handleStart = async () => {
    try {
      await botsAPI.start(id);
      toast.success('Bot spuštěn');
      loadBot();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chyba při spuštění');
    }
  };

  const handleStop = async () => {
    try {
      await botsAPI.stop(id);
      toast.success('Bot zastaven');
      loadBot();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chyba při zastavení');
    }
  };

  const handleRestart = async () => {
    try {
      await botsAPI.restart(id);
      toast.success('Bot restartován');
      loadBot();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chyba při restartu');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Opravdu smazat bota "${bot.name}"?`)) return;

    try {
      await botsAPI.delete(id);
      toast.success('Bot smazán');
      navigate('/');
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

  if (loading || !bot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <p className="text-muted-foreground">Načítám...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{bot.name}</h1>
              <p className="text-sm text-slate-400 mt-1">
                {bot.type === 'nodejs' ? '🟢 Node.js' : '🐍 Python'} • {bot.script_path}
              </p>
            </div>
            {getStatusBadge(bot.status)}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        {bot.status === 'online' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Uptime</CardDescription>
                <CardTitle className="text-2xl">{formatUptime(Date.now() - bot.uptime)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>CPU</CardDescription>
                <CardTitle className="text-2xl">{formatCPU(bot.cpu)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Memory</CardDescription>
                <CardTitle className="text-2xl">{formatMemory(bot.memory)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Restarty</CardDescription>
                <CardTitle className="text-2xl">{bot.restarts || 0}</CardTitle>
              </CardHeader>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-3 mb-6">
          {bot.status === 'online' ? (
            <>
              <Button variant="outline" onClick={handleStop}>
                <Square className="w-4 h-4 mr-2" />
                Zastavit
              </Button>
              <Button variant="outline" onClick={handleRestart}>
                <RotateCw className="w-4 h-4 mr-2" />
                Restartovat
              </Button>
            </>
          ) : (
            <Button onClick={handleStart}>
              <Play className="w-4 h-4 mr-2" />
              Spustit
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Smazat
          </Button>
        </motion.div>

        {/* Logy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Logy</CardTitle>
              <CardDescription>Poslední výstupy z konzole</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-950 rounded-md p-4 font-mono text-sm max-h-[500px] overflow-y-auto">
                {logs.stdout && (
                  <div className="text-green-400 whitespace-pre-wrap mb-4">
                    <div className="text-slate-500 mb-2">STDOUT:</div>
                    {logs.stdout}
                  </div>
                )}
                {logs.stderr && (
                  <div className="text-red-400 whitespace-pre-wrap">
                    <div className="text-slate-500 mb-2">STDERR:</div>
                    {logs.stderr}
                  </div>
                )}
                {!logs.stdout && !logs.stderr && (
                  <div className="text-slate-500">Zatím žádné logy...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
