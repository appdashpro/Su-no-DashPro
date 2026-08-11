import { safeStorage } from "../lib/safeStorage";
import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, WifiOff, RefreshCw } from 'lucide-react';
import { OFFLINE_QUEUE_KEY, OFFLINE_DELETE_INTEGRADO_QUEUE, OFFLINE_DELETE_VISIT_QUEUE } from '../lib/storage';

interface NotificationsProps {
  visits?: any;
  integrados?: any;
}

export function Notifications({ visits, integrados }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [lastSyncUser, setLastSyncUser] = useState<string | null>(null);
  const [offlineCount, setOfflineCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkSyncStatus = () => {
    try {
      const q1 = JSON.parse(safeStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      const q2 = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_INTEGRADO_QUEUE) || '[]');
      const q3 = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_VISIT_QUEUE) || '[]');
      
      const totalOffline = q1.length + q2.length + q3.length;
      setHasOfflineData(totalOffline > 0);
      setOfflineCount(totalOffline);
      
      const syncTime = safeStorage.getItem('LAST_SYNC_TIME');
      setLastSyncTime(syncTime);
      
      const syncUser = safeStorage.getItem('LAST_SYNC_USER');
      setLastSyncUser(syncUser);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkSyncStatus();
    
    // Check periodically
    const interval = setInterval(checkSyncStatus, 5000);
    
    // Listen to custom event
    window.addEventListener('sync-completed', checkSyncStatus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('sync-completed', checkSyncStatus);
    };
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition-colors"
        title="Status de Sincronização"
      >
        <Bell className="w-5 h-5" />
        {hasOfflineData && (
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Sincronização de Dados</h3>
          </div>
          
          <div className="p-4">
            {hasOfflineData ? (
              <div className="flex gap-3 bg-amber-50 p-3 rounded-lg border border-amber-100">
                <div className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">Dados pendentes ({offlineCount})</p>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Você possui lançamentos offline que ainda não foram sincronizados. Eles serão enviados quando houver conexão.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <div className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">Sincronizado</p>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Todos os dados estão sincronizados com o servidor.
                  </p>
                  {lastSyncTime && (
                    <div className="mt-3 bg-white p-2 rounded border border-emerald-100">
                      <p className="text-xs text-slate-500 font-medium">Última sincronização:</p>
                      <p className="text-sm text-slate-700 font-semibold">{formatDate(lastSyncTime)}</p>
                      {lastSyncUser && lastSyncUser !== 'offline' && lastSyncUser !== 'Usuário logado' && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                           Por: <span className="text-slate-700 truncate">{lastSyncUser}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
