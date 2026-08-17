import React from 'react';
import { Home, Activity, Users, ClipboardList, LineChart, AlertCircle, HelpCircle, Shield, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, getRoleLabel } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onStartTutorial?: () => void;
  userProfile?: UserProfile | null;
  onLogout?: () => void;
}

export function Sidebar({ currentTab, setCurrentTab, onStartTutorial, userProfile, onLogout }: SidebarProps) {
  const isMaster = userProfile?.papel === 'MASTER' || userProfile?.papel === 'SUPER_ADMIN';
  const isNutron = userProfile?.papel === 'TECNICO_NUTRON' || userProfile?.papel === 'COORDENADOR';
  const isClientTech = userProfile?.papel === 'TECNICO_CLIENTE' || userProfile?.papel === 'TECNICO';

  const navItems = [
    { id: 'prioridades', label: 'Prioridades', icon: AlertCircle, show: true },
    { id: 'dashboard', label: 'Visão Geral', icon: Home, show: true },
    { id: 'visitas', label: 'Visitas', icon: ClipboardList, show: true },
    { id: 'integrados', label: 'Gestão de Lotes', icon: Users, show: true },
    { id: 'medicamentos', label: 'Medicamentos', icon: Activity, show: true },
    { id: 'curva', label: 'Curva de Referência', icon: LineChart, show: true },
    { id: 'importar', label: 'Importar Dados', icon: ClipboardList, show: isMaster || isNutron },
    { id: 'usuarios', label: 'Equipe & Clientes', icon: ShieldCheck, show: isMaster },
  ].filter(item => item.show);

  const getBadgeStyle = () => {
    if (isMaster) return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
    if (isNutron) return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
    return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
  };

  return (
    <aside className="w-64 bg-[#0F172A] flex flex-col min-h-screen shrink-0 border-r border-slate-800">
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
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 mb-2">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs font-semibold text-slate-200 truncate" title={userProfile.nome}>
                {userProfile.nome}
              </span>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider", getBadgeStyle())}>
                {userProfile.papel === 'MASTER' ? 'Master' : userProfile.papel === 'TECNICO_NUTRON' ? 'Téc. Nutron' : 'Téc. Cliente'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate" title={userProfile.email}>
              {userProfile.email}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-2">
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

      <div className="p-4 border-t border-slate-800/80 mt-auto space-y-2">
        {onStartTutorial && (
          <button
            id="sidebar-item-tutorial"
            onClick={onStartTutorial}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all active:scale-95 shadow-sm"
            title="Iniciar Tutorial Guiado"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Tutorial Guiado</span>
          </button>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Sistema</span>
          </button>
        )}
      </div>
    </aside>
  );
}
