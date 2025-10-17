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
      online: { className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', text: 'Online' },
      stopped: { className: 'bg-slate-500/20 text-slate-400 border-slate-500/30', text: 'Offline' },
      stopping: { className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', text: 'Zastavuji' },
      errored: { className: 'bg-red-500/20 text-red-400 border-red-500/30', text: 'Chyba' },
      offline: { className: 'bg-slate-500/20 text-slate-400 border-slate-500/30', text: 'Offline' },
    };

    const config = statusMap[status] || statusMap.offline;
    return <Badge className={config.className}>{config.text}</Badge>;
  };

  if (loading || !bot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-400">Načítám...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 text-slate-300 hover:text-white hover:bg-slate-800">
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
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-400">Uptime</CardDescription>
                <CardTitle className="text-2xl text-white">{formatUptime(Date.now() - bot.uptime)}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-400">CPU</CardDescription>
                <CardTitle className="text-2xl text-blue-400">{formatCPU(bot.cpu)}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-400">Memory</CardDescription>
                <CardTitle className="text-2xl text-purple-400">{formatMemory(bot.memory)}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-400">Restarty</CardDescription>
                <CardTitle className="text-2xl text-emerald-400">{bot.restarts || 0}</CardTitle>
              </CardHeader>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-3 mb-6">
          {bot.status === 'online' ? (
            <>
              <Button variant="outline" onClick={handleStop} className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white">
                <Square className="w-4 h-4 mr-2" />
                Zastavit
              </Button>
              <Button variant="outline" onClick={handleRestart} className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white">
                <RotateCw className="w-4 h-4 mr-2" />
                Restartovat
              </Button>
            </>
          ) : (
            <Button onClick={handleStart} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Play className="w-4 h-4 mr-2" />
              Spustit
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Smazat
          </Button>
        </motion.div>

        {/* Logy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Logy</CardTitle>
              <CardDescription className="text-slate-400">Poslední výstupy z konzole</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black/50 border border-slate-800 rounded-lg p-4 font-mono text-sm max-h-[500px] overflow-y-auto">
                {logs.stdout && (
                  <div className="text-emerald-400 whitespace-pre-wrap mb-4">
                    <div className="text-slate-500 mb-2 font-bold">STDOUT:</div>
                    {logs.stdout}
                  </div>
                )}
                {logs.stderr && (
                  <div className="text-red-400 whitespace-pre-wrap">
                    <div className="text-slate-500 mb-2 font-bold">STDERR:</div>
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
