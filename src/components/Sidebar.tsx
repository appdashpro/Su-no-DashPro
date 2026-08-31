import React from 'react';
import { Home, Activity, Users, ClipboardList, LineChart, AlertCircle, HelpCircle, Shield, ShieldCheck, RefreshCw, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, getRoleLabel } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onStartTutorial?: () => void;
  userProfile?: UserProfile | null;
  onLogout?: () => void;
  lastSyncTime?: string | null;
  isOnline?: boolean;
  isSyncing?: boolean;
  onForceSync?: () => void;
}

export function Sidebar({ currentTab, setCurrentTab, onStartTutorial, userProfile, onLogout, lastSyncTime, isOnline, isSyncing, onForceSync }: SidebarProps) {
  const isMaster = userProfile?.papel === 'MASTER' || userProfile?.papel === 'SUPER_ADMIN';
  const isNutron = userProfile?.papel === 'TECNICO_NUTRON' || userProfile?.papel === 'COORDENADOR';
  const isClientTech = userProfile?.papel === 'TECNICO_CLIENTE' || userProfile?.papel === 'TECNICO';

  const navItems = [
    { id: 'prioridades', label: 'Prioridades', icon: AlertCircle, show: true },
    { id: 'dashboard', label: 'Visão Geral', icon: Home, show: true },
    { id: 'visitas', label: 'Visitas', icon: ClipboardList, show: true },
    { id: 'integrados', label: 'Gestão de Lotes', icon: Users, show: true },
    { id: 'medicamentos', label: 'Medicamentos', icon: Activity, show: true },
    { id: 'curva', label: 'Curvas de Consumo', icon: LineChart, show: true },
    { id: 'importar', label: 'Importar Dados', icon: ClipboardList, show: isMaster },
    { id: 'usuarios', label: 'Equipe & Clientes', icon: ShieldCheck, show: isMaster },
    { id: 'parametros', label: 'Parâmetros por Cliente', icon: Settings, show: isMaster || isNutron || isClientTech },
  ].filter(item => item.show);

  const getBadgeStyle = () => {
    if (isMaster) return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
    if (isNutron) return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
    return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
  };

  return (
    <aside className="w-64 bg-[#0F172A] flex flex-col h-full shrink-0 border-r border-slate-800">
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            S
          </div>
          <div>
            <span className="text-white font-semibold text-base tracking-tight block">Suíno DashPro</span>
            <span className="text-[10px] text-slate-400 font-medium">Gestão Agropecuária</span>
          </div>
        </div>

        {/* User Profile Card & RBAC Badge */}
        {userProfile && (
          <div className="px-1 mt-4 mb-1">
            <div className="flex flex-col justify-center gap-0.5">
              <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider pl-1">Usuário Logado</span>
              <div className="flex items-center justify-between gap-1 pl-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isMaster ? 'bg-purple-400' : isNutron ? 'bg-blue-400' : 'bg-emerald-400'}`}></div>
                  <span className="text-xs font-semibold text-slate-300 truncate" title={userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\s+/i.test(userProfile.nome) ? userProfile.nome : `Técnico ${userProfile.nome}`) : userProfile.nome}>
                    {userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\s+/i.test(userProfile.nome) ? userProfile.nome : `Técnico ${userProfile.nome}`) : userProfile.nome}
                  </span>
                </div>
                {(userProfile.papel === 'MASTER' || userProfile.papel === 'TECNICO_NUTRON' || userProfile.papel === 'COORDENADOR') && (
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider opacity-90 shrink-0", getBadgeStyle())}>
                    {userProfile.papel === 'MASTER' ? 'Master' : 'Nutron'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-2 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-800/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-700/60">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium",
                isActive 
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold" 
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800/80 mt-auto">
        <div className="flex gap-2 mb-3">
          {onForceSync && (
            <button
              onClick={onForceSync}
              disabled={!isOnline || isSyncing}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-medium border transition-colors ${
                isOnline 
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/40' 
                  : 'bg-slate-800/30 border-slate-700/50 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isOnline ? (isSyncing ? '...' : 'Sincronizar') : 'Offline'}</span>
            </button>
          )}

          {onStartTutorial && (
            <button
              id="sidebar-item-tutorial"
              onClick={onStartTutorial}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-medium bg-blue-950/30 border border-blue-800/50 text-blue-300 hover:bg-blue-900/40 transition-colors"
              title="Iniciar Tutorial Guiado"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Tutorial</span>
            </button>
          )}
        </div>

        {lastSyncTime && (
          <div className="text-center text-[10px] text-slate-500/80 font-medium">
            Última sinc: {new Date(lastSyncTime).toLocaleDateString('pt-BR')} {new Date(lastSyncTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </aside>
  );
}
