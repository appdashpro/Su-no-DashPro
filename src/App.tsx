import { safeStorage } from "./lib/safeStorage";
import { ErrorBoundary } from './components/ErrorBoundary';
import { Tutorial } from './components/Tutorial';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Prioridades } from './components/Prioridades';
import { Dashboard } from './components/Dashboard';
import { VisitaForm } from './components/VisitForm';
import { VisitsList } from './components/Visits';
import { IntegradoDetailsModal } from './components/IntegradoDetailsModal';
import { Integrados } from './components/Integrados';
import { IntegradoForm } from './components/IntegradoForm';
import { ReferenceCurve } from './components/ReferenceCurve';
import { EmpresaConfigGestao } from './components/EmpresaConfigGestao';
import { ImportData } from './components/ImportData';
import { Login } from './components/Login';
import { Notifications } from './components/Notifications';
import { MedicationAnalysis } from './components/MedicationAnalysis';
import { UsuariosGestao } from './components/UsuariosGestao';
import { Visit, Integrado, UserProfile, getRoleLabel } from './types';
import { Menu, X, LogOut, Download, Wifi, WifiOff, RefreshCw, Moon, Sun, Users, ClipboardList, Shield } from 'lucide-react';
import * as XLSX from 'xlsx';
import { storage } from './lib/storage';
import { supabase } from './lib/supabase';
import { saveBackupToIndexedDB, restoreBackupFromIndexedDB } from './lib/backup';
import { seedTestLots } from './lib/seeder';
import { 
  getSavedUserProfile, 
  saveUserProfile, 
  resolveUserProfile, 
  cacheAuthSession, 
  clearAuthCache, 
  filterIntegradosForUser, 
  filterVisitsForUser, getCachedAuthSession 
} from './lib/auth';

// Exponential backoff helper for network requests
async function executeWithExponentialBackoff<T>(
  task: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    onRetry?: (attempt: number, delayMs: number, error: any) => void;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1200,
    maxDelayMs = 15000,
    onRetry,
    shouldRetry = (err: any) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
      const msg = String(err?.message || err || '');
      // Non-retryable database schema / permission errors
      if (err?.code && String(err.code).startsWith('PGRST') && !msg.includes('fetch') && !msg.includes('Failed')) return false;
      if (msg.includes('relation') || msg.includes('column') || msg.includes('constraint')) return false;
      return true;
    }
  } = options;

  let attempt = 0;
  while (true) {
    try {
      return await task();
    } catch (err: any) {
      attempt++;
      if (attempt > maxRetries || !shouldRetry(err)) {
        throw err;
      }
      const exponentialDelay = initialDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.random() * (exponentialDelay * 0.25);
      const delay = Math.min(maxDelayMs, Math.round(exponentialDelay + jitter));

      if (onRetry) {
        onRetry(attempt, delay, err);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export default function App() {
  

 const [currentTab, setCurrentTab] = useState('prioridades');
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
 const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
 const [isNewLoteMode, setIsNewLoteMode] = useState(false);
 const [viewingIntegradoId, setViewingIntegradoId] = useState<string | null>(null);
 const [selectedEmpresaFilter, setSelectedEmpresaFilter] = useState<string | null>(null);
 
 const [integrados, setIntegrados] = useState<Integrado[]>([]);
 const [empresas, setEmpresas] = useState<any[]>([]);

 const loadEmpresas = useCallback(async () => {
   if (typeof window !== "undefined") {
     const cached = safeStorage.getItem('CACHED_EMPRESAS');
     if (cached) {
       try { setEmpresas(JSON.parse(cached)); } catch(e) {}
     }
   }
   if (typeof window !== "undefined" && !navigator.onLine) return;
   try {
     const { data, error } = await supabase.from("empresas").select("*");
     console.log("LOAD EMPRESAS RESULT:", data, error);
     if (!error && data) {
       setEmpresas(data);
       if (typeof window !== "undefined") safeStorage.setItem('CACHED_EMPRESAS', JSON.stringify(data));
     }
   } catch(e) {
     console.warn("Failed to load empresas", e);
   }
 }, []);
 const [visits, setVisits] = useState<Visit[]>([]);
 const [pendingSyncIds, setPendingSyncIds] = useState<string[]>([]);
 const [loading, setLoading] = useState(true);
 const [session, setSession] = useState<any>(null);
 const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(() => getSavedUserProfile());
  const [masterUserProfile, setMasterUserProfile] = useState<UserProfile | null>(null);
 const [dbError, setDbError] = useState<string | null>(null);
 const [runTutorial, setRunTutorial] = useState(() => {
 if (typeof window !== 'undefined') {
 return safeStorage.getItem('tutorial_completed') !== 'true';
 }
 return true;
 });
 const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);

 const [isSyncing, setIsSyncing] = useState(false);
 const [syncRetryStatus, setSyncRetryStatus] = useState<string | null>(null);
 const [lastSyncTime, setLastSyncTime] = useState<string | null>(typeof window !== 'undefined' ? safeStorage.getItem('LAST_SYNC_TIME') : null);
 const [lastSyncUser, setLastSyncUser] = useState<string | null>(typeof window !== 'undefined' ? safeStorage.getItem('LAST_SYNC_USER') : null);

 const retryTimeoutRef = useRef<any>(null);
 const isSyncInProgressRef = useRef(false);

 useEffect(() => {
 if (isVisitFormOpen) {
 safeStorage.setItem('EDITING_LOCK', 'true');
 if (editingVisitId) {
 safeStorage.setItem('EDITING_VISIT_ID', editingVisitId);
 } else {
 safeStorage.removeItem('EDITING_VISIT_ID');
 }
 } else {
 safeStorage.removeItem('EDITING_LOCK');
 safeStorage.removeItem('EDITING_VISIT_ID');
 }
 }, [isVisitFormOpen, editingVisitId]);

 useEffect(() => {
 const handleSyncCompleted = () => {
 setLastSyncTime(safeStorage.getItem('LAST_SYNC_TIME'));
 setLastSyncUser(safeStorage.getItem('LAST_SYNC_USER'));
 };
 window.addEventListener('sync-completed', handleSyncCompleted);
 
  return () => window.removeEventListener('sync-completed', handleSyncCompleted);
 }, []);

 const [isDarkMode, setIsDarkMode] = useState(() => {
 if (typeof window !== 'undefined') {
 return safeStorage.getItem('theme') === 'dark' || (!(safeStorage.hasItem('theme')) && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });

 useEffect(() => {
 if (isDarkMode) {
 document.documentElement.classList.add('dark');
 safeStorage.setItem('theme', 'dark');
 } else {
 document.documentElement.classList.remove('dark');
 safeStorage.setItem('theme', 'light');
 }
 }, [isDarkMode]);

 const checkConnection = useCallback(async () => {
 try {
 const { error } = await supabase.from('visitas').select('id').limit(1);
 if (error) {
 if ((error?.message?.includes('fetch') || error?.message?.includes('Failed') || error?.code === '0' || String(error).includes('fetch') || String(error).includes('Failed'))) {
 setDbError(null); // Ignore in offline / network drop mode
 } else if (error?.message?.includes('relation "public.profiles" does not exist')) {
 setDbError(`Erro de permissão no Supabase. Verifique se o RLS está configurado corretamente.`);
 } else if (error?.message?.includes('coluna') || error?.message?.includes('column')) {
 setDbError(`Erro no banco de dados (coluna não encontrada). Erro original: ${error.message}`);
 } else {
 setDbError(`Erro ao conectar com o banco de dados: ${error.message}`);
 }
 } else {
 setDbError(null);
 }
 } catch (err: any) {
 if (!(err?.message?.includes('fetch') || err?.message?.includes('Failed') || err?.code === '0' || String(err).includes('fetch') || String(err).includes('Failed'))) {
 setDbError(`Falha inesperada ao conectar: ${err.message}`);
 }
 }
 }, []);

 // Non-blocking background sync using exponential backoff
 const syncInBackground = useCallback(async (isManual = false) => {
 if (isSyncInProgressRef.current) return;
 
 // Se estivermos usando uma sessão offline mockada, não tentamos sincronizar
 const cachedSession = getCachedAuthSession();
 if (cachedSession?.user?.id?.includes('offline')) {
    setIsSyncing(false);
    return;
 }
 
 if (typeof navigator !== 'undefined' && !navigator.onLine) {
   setIsOnline(false);
   setIsSyncing(false);
   return;
 }

 if (retryTimeoutRef.current) {
   clearTimeout(retryTimeoutRef.current);
   retryTimeoutRef.current = null;
 }

 isSyncInProgressRef.current = true;
 setIsSyncing(true);
 setSyncRetryStatus(null);

 try {
   await executeWithExponentialBackoff(
     async () => {
       await checkConnection();
       await storage.syncFromSupabase();
     },
     {
       maxRetries: isManual ? 2 : 3,
       initialDelayMs: 1500,
       maxDelayMs: 15000,
       onRetry: (attempt, delayMs) => {
         setSyncRetryStatus(`Tentativa ${attempt}...`);
       }
     }
   );

   setSyncRetryStatus(null);
 } catch (err: any) {
   // Even if it throws (e.g., offline queue partially failed), we might have downloaded new data.
   // So we still want to update the in-memory state!

   console.warn('Sync attempt completed with warnings (persisting offline):', err);
   if (isManual) {
     if (!(err?.message?.includes('fetch') || err?.message?.includes('Failed') || String(err).includes('fetch') || String(err).includes('Failed'))) {
       alert("Erro ao sincronizar: " + (err.message || String(err)));
     }
   }
 } finally {
   const dataIntegrados = await storage.getIntegrados();
   const dataVisits = await storage.getVisits();
   setIntegrados(Array.isArray(dataIntegrados) ? dataIntegrados : []);
   setVisits(Array.isArray(dataVisits) ? dataVisits : []);
   setPendingSyncIds(storage.getPendingSyncIds());
   isSyncInProgressRef.current = false;
   setIsSyncing(false);
   setSyncRetryStatus(null);
 }
 }, [checkConnection]);

 // Fast, offline-first local data load (never blocks UI on network)
 const loadData = useCallback(async () => {
 await restoreBackupFromIndexedDB();
 storage.migrateIds();
 // seedTestLots(); // Removed to prevent demo data from respawning after deletion

 try {
   // Immediately populate UI from fast local cache
   const dataIntegrados = await storage.getIntegrados();
   const dataVisits = await storage.getVisits();
   setIntegrados(Array.isArray(dataIntegrados) ? dataIntegrados : []);
   setVisits(Array.isArray(dataVisits) ? dataVisits : []);
   setPendingSyncIds(storage.getPendingSyncIds());
 } catch (e) {
   console.warn('Local storage load warning:', e);
 } finally {
   // Unlock UI immediately so the user can interact instantly
   setLoading(false);
 }

 // Trigger non-blocking background sync with exponential backoff if online
 if (typeof navigator !== 'undefined' && navigator.onLine) {
   syncInBackground(false);
 }
 }, [syncInBackground]);

 useEffect(() => {
 const handleOnline = () => {
 setIsOnline(true);
 syncInBackground(false);
 };
 const handleOffline = () => {
 setIsOnline(false);
 setIsSyncing(false);
 if (retryTimeoutRef.current) {
   clearTimeout(retryTimeoutRef.current);
   retryTimeoutRef.current = null;
 }
 };

 window.addEventListener('online', handleOnline);
 window.addEventListener('sync-completed', () => setPendingSyncIds(storage.getPendingSyncIds()));
 window.addEventListener('offline', handleOffline);

 return () => {
 window.removeEventListener('online', handleOnline);
 window.removeEventListener('offline', handleOffline);
 if (retryTimeoutRef.current) {
   clearTimeout(retryTimeoutRef.current);
 }
 };
 }, [syncInBackground]);

 const handleForceSync = async () => {
 if (!isOnline) return;
 await syncInBackground(true);
 };

 useEffect(() => {
 const handleOfflineLogin = (e?: Event) => {
   const customEvent = e as CustomEvent;
   const profile = customEvent?.detail?.profile || getSavedUserProfile() || {
     id: 'offline_user',
     email: 'campo@suinodashpro.com',
     nome: 'Técnico de Campo',
     papel: 'TECNICO_NUTRON' as const
   };
   setCurrentUserProfile(profile);
   setSession({ user: { id: profile.id, email: profile.email } });
   loadData();
   loadEmpresas();
 };

 window.addEventListener('offline-login', handleOfflineLogin);

 supabase.auth.getSession().then(async ({ data: { session }, error }) => {
   if (error && (error?.message?.includes('fetch') || error?.message?.includes('Failed') || error?.code === '0' || String(error).includes('fetch') || String(error).includes('Failed'))) {
     handleOfflineLogin();
   } else if (session) {
     setSession(session);
     cacheAuthSession(session);
     try {
       const profile = await resolveUserProfile(session.user.email || '', session.user.id);
       setCurrentUserProfile(profile);
     } catch (e) {
       console.warn('Error resolving user profile:', e);
     }
     loadData();
     loadEmpresas();
   } else {
     const saved = getSavedUserProfile();
     if (saved && typeof navigator !== 'undefined' && !navigator.onLine) {
       handleOfflineLogin();
     } else {
       setLoading(false);
     }
   }
 }).catch((err) => {
   if (err?.message?.includes('fetch') || err?.message?.includes('Failed') || err?.code === '0' || String(err).includes('fetch') || String(err).includes('Failed')) {
     handleOfflineLogin();
   } else {
     setLoading(false);
   }
 });

 const {
   data: { subscription },
 } = supabase.auth.onAuthStateChange(async (_event, session) => {
   if (!session) {
     setSession((prev: any) => {
       if (prev && prev.user?.id === 'offline') return prev;
       if (typeof window !== 'undefined' && !window.navigator.onLine) {
         return { user: { id: 'offline' } };
       }
       return null;
     });
   } else {
     setSession(session);
     cacheAuthSession(session);
     try {
       const profile = await resolveUserProfile(session.user.email || '', session.user.id);
       setCurrentUserProfile(profile);
     } catch (e) {
       console.warn('Error resolving profile on auth state change:', e);
     }
     loadData();
     loadEmpresas();
   }
 });

 return () => {
   subscription.unsubscribe();
   window.removeEventListener('offline-login', handleOfflineLogin);
 };
 }, [loadData]);

 useEffect(() => {
 let hasChanges = false;
 const today = new Date();
 today.setHours(0, 0, 0, 0);

 const updatedIntegrados = integrados.map(i => {
 if (i.status === 'Em andamento' && i.alojamentoDate) {
 const [year, month, day] = i.alojamentoDate.split('-');
 const alojamento = new Date(Number(year), Number(month) - 1, Number(day));
 
 const diffTime = today.getTime() - alojamento.getTime();
 const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
 
 if (diffDays > 110) {
 hasChanges = true;
 return { 
 ...i, 
 status: 'Fechado' as const, 
 fechamentoDate: new Date().toISOString().split('T')[0] 
 };
 }
 }
 return i;
 });

 if (hasChanges) {
 setIntegrados(updatedIntegrados);
 storage.saveIntegrados(updatedIntegrados);
 }

 }, [integrados]);

 const processIntegradoFromVisit = async (newVisit: Visit, integradoNome?: string, alojamentoDate?: string, empresaId?: string) => {
 if (!integradoNome || !alojamentoDate) return;
 const existing = integrados.find(i => i.id === newVisit.integradoId);
 if (!existing) {
   const empresaFound = empresaId ? empresas.find(e => e.id === empresaId) : undefined;
   const newIntegrado: Integrado = {
     id: newVisit.integradoId,
     name: integradoNome,
     alojamentoDate,
     status: 'Em andamento',
     empresaId: empresaId || undefined,
     empresaName: empresaFound ? empresaFound.nome : undefined
   };
   const updatedIntegrados = [...integrados, newIntegrado];
   setIntegrados(updatedIntegrados);
   await storage.saveIntegrados(updatedIntegrados);
 } else if (existing.name !== integradoNome || existing.alojamentoDate !== alojamentoDate || (empresaId && existing.empresaId !== empresaId)) {
   const empresaFound = empresaId ? empresas.find(e => e.id === empresaId) : undefined;
   const updatedIntegrados = integrados.map(i => i.id === existing.id ? { ...i, name: integradoNome, alojamentoDate, empresaId: empresaId || i.empresaId, empresaName: empresaFound ? empresaFound.nome : i.empresaName } : i);
   setIntegrados(updatedIntegrados);
   await storage.saveIntegrados(updatedIntegrados);
 }
 };

 const handleAddVisit = async (newVisit: Visit, integradoNome?: string, alojamentoDate?: string, empresaId?: string) => {
 setIsVisitFormOpen(false);
 try {
 await processIntegradoFromVisit(newVisit, integradoNome, alojamentoDate, empresaId);
 const updatedVisits = [...visits, newVisit];
 setVisits(updatedVisits);
 const savedVisits = await storage.saveVisits(updatedVisits, [newVisit]);
 setVisits([...savedVisits]);
    setPendingSyncIds(storage.getPendingSyncIds());
 
 // Create local backup to IndexedDB
 await saveBackupToIndexedDB();
 } catch (error: any) {
 alert(`Erro ao salvar lançamento:\n\n${error.message}`);
 // Revert the optimistic update if needed, but for now we just show the error.
 }
 };

 const handleUpdateVisit = async (updatedVisit: Visit, integradoNome?: string, alojamentoDate?: string, empresaId?: string) => {
 setEditingVisitId(null);
 setIsVisitFormOpen(false);
 try {
 await processIntegradoFromVisit(updatedVisit, integradoNome, alojamentoDate, empresaId);
 const updatedVisits = visits.map(v => v.id === updatedVisit.id ? updatedVisit : v);
 setVisits(updatedVisits);
 const savedVisits = await storage.saveVisits(updatedVisits, [updatedVisit]);
 setVisits([...savedVisits]);
    setPendingSyncIds(storage.getPendingSyncIds());
 
 // Create local backup to IndexedDB
 await saveBackupToIndexedDB();
 } catch (error: any) {
 alert(`Erro ao atualizar lançamento:\n\n${error.message}`);
 }
 };

 const handleDeleteVisit = async (id: string) => {
 try {
 const visitToDelete = visits.find(v => v.id === id);
 const updatedVisits = visits.filter(v => v.id !== id);
 setVisits(updatedVisits);
 await storage.deleteVisit(id);
 setPendingSyncIds(storage.getPendingSyncIds());
 await saveBackupToIndexedDB();
 
 if (visitToDelete) {
 const remainingVisits = updatedVisits.filter(v => v.integradoId === visitToDelete.integradoId);
 if (remainingVisits.length === 0) {
 await handleDeleteIntegrado(visitToDelete.integradoId);
 }
 }
 } catch (error: any) {
 alert(`Erro ao deletar lançamento:\n\n${error?.message || error}`);
 }
 };

 const handleEditVisitClick = (id: string) => {
 setEditingVisitId(id);
 setIsVisitFormOpen(true);
 };

 const handleNavigateToViewIntegrado = (visitId: string) => {
 const visit = visits.find(v => v.id === visitId);
 if (visit) {
 setViewingIntegradoId(visit.integradoId);
 }
 };

  const handleUpdateIntegrado = async (integrado: Integrado) => {
    try {
      let syncFailed = false;
      if (isOnline) {
        const { error } = await supabase
          .from('lotes')
          .update({
            data_alojamento: integrado.alojamentoDate,
            status: integrado.status === 'Em andamento' ? 'Ativo' : 'Encerrado',
            ...(integrado.empresaId ? { empresa_id: integrado.empresaId } : {})
          })
          .eq('id', integrado.id);
        
        if (error) {
          console.error('Erro ao atualizar lote no Supabase. Detalhes:', JSON.stringify(error, null, 2));
       syncFailed = true;
     }
   } else {
     syncFailed = true;
   }

   if (syncFailed) {
     const OFFLINE_EDIT_INTEGRADO_QUEUE = 'suino_dashpro_offline_edit_integrado';
     let q = [];
     try {
       q = JSON.parse(safeStorage.getItem(OFFLINE_EDIT_INTEGRADO_QUEUE) || '[]');
     } catch (e) {}
     const newQ = q.filter((i: Integrado) => i.id !== integrado.id);
     newQ.push(integrado);
     safeStorage.setItem(OFFLINE_EDIT_INTEGRADO_QUEUE, JSON.stringify(newQ));
   }

 const updatedList = integrados.map(i => i.id === integrado.id ? integrado : i);
 setIntegrados(updatedList);
 await storage.saveIntegrados(updatedList);
 await saveBackupToIndexedDB();
 } catch (err: any) {
 console.error('Erro ao atualizar lote:', err);
 }
 };

 const handleDeleteIntegrado = async (id: string) => {
 try {
 await storage.deleteIntegrado(id);
 setIntegrados(prev => prev.filter(i => i.id !== id));
 setVisits(prev => prev.filter(v => v.integradoId !== id));
 setPendingSyncIds(storage.getPendingSyncIds());
 await saveBackupToIndexedDB();
 } catch (err: any) {
 console.error('Erro ao deletar lote:', err);
 alert(`Erro ao deletar lote:\n\n${err?.message || err}`);
 }
 };

 const handleTabChange = (tab: string) => {
 setCurrentTab(tab);
 setIsSidebarOpen(false);
 setIsVisitFormOpen(false);
 setEditingVisitId(null);
 };


 const handleExport = (filteredVisits?: Visit[] | any) => {
 // Check if filteredVisits is truly an array (and not an Event object)
 const isArray = Array.isArray(filteredVisits);
 const listToExport = isArray && filteredVisits.length > 0 ? filteredVisits : visits;
 
 if (!listToExport || listToExport.length === 0) {
 alert('Não há dados para exportar.');
 return;
 }
 
 // Explicit headers
 const header = [
 'Data', 'Integrado', 'Alojamento', 'Tipo Lote', 'Idade', 'Animais Alojados', 
 'Animais Mortos', 'Vol. Cargas (kg)', 'Recomendação', 'Consumo acumulado', 
 'Comedouro', 'Colaborador', 'Meta Aloj', 'Cons. Aloj', 
 'Meta Cresc 1', 'Cons. Cresc 1', 'Meta Cresc 2', 'Cons. Cresc 2', 
 'Meta Cresc 3', 'Cons. Cresc 3', 'Meta Term 1', 'Cons. Term 1', 
 'Meta Term 2', 'Cons. Term 2', 'Meta Acum.', 'Peso aloj', 'Pontuação Sanitária'
 ];

 // Explicit data matrix
 const dataToExport = [
 header,
 ...listToExport.map((v: Visit) => {
 const integrado = integrados.find(i => i.id === v.integradoId);
 
 let dataFormatada = '';
 if (v.date) {
 const parts = v.date.split('-');
 if (parts.length === 3) {
 dataFormatada = `${parts[2]}/${parts[1]}/${parts[0]}`;
 } else {
 dataFormatada = v.date;
 }
 }
 
 let alojamentoFormatado = '';
 if (integrado?.alojamentoDate) {
 const parts = integrado.alojamentoDate.split('-');
 if (parts.length === 3) {
 alojamentoFormatado = `${parts[2]}/${parts[1]}/${parts[0]}`;
 } else {
 alojamentoFormatado = integrado.alojamentoDate;
 }
 }
 
 return [
 dataFormatada,
 integrado?.name || '',
 alojamentoFormatado,
 v.tipoLote || 'Misto',
 v.idade !== undefined && v.idade !== null ? String(v.idade) : '',
 v.animaisAlojados !== undefined && v.animaisAlojados !== null ? String(v.animaisAlojados) : '',
 v.animaisMortos !== undefined && v.animaisMortos !== null ? String(v.animaisMortos) : '',
 v.volumeTotalCargas !== undefined && v.volumeTotalCargas !== null ? String(v.volumeTotalCargas) : '',
 v.recomendacao || '',
 v.consumoAcumuladoReal !== undefined && v.consumoAcumuladoReal !== null ? String(v.consumoAcumuladoReal) : '',
 
 v.comedouro || '',
 v.colaborador ? v.colaborador.replace(/\s*,\s*/g, ' / ') : '',
 v.metaAlojamento !== undefined && v.metaAlojamento !== null ? String(v.metaAlojamento) : '',
 v.consumoAlojamento !== undefined && v.consumoAlojamento !== null ? String(v.consumoAlojamento) : '',
 v.metaCrescimento1 !== undefined && v.metaCrescimento1 !== null ? String(v.metaCrescimento1) : '',
 v.consumoCrescimento1 !== undefined && v.consumoCrescimento1 !== null ? String(v.consumoCrescimento1) : '',
 v.metaCrescimento2 !== undefined && v.metaCrescimento2 !== null ? String(v.metaCrescimento2) : '',
 v.consumoCrescimento2 !== undefined && v.consumoCrescimento2 !== null ? String(v.consumoCrescimento2) : '',
 v.metaCrescimento3 !== undefined && v.metaCrescimento3 !== null ? String(v.metaCrescimento3) : '',
 v.consumoCrescimento3 !== undefined && v.consumoCrescimento3 !== null ? String(v.consumoCrescimento3) : '',
 v.metaTerminacao1 !== undefined && v.metaTerminacao1 !== null ? String(v.metaTerminacao1) : '',
 v.consumoTerminacao1 !== undefined && v.consumoTerminacao1 !== null ? String(v.consumoTerminacao1) : '',
 v.metaTerminacao2 !== undefined && v.metaTerminacao2 !== null ? String(v.metaTerminacao2) : '',
 v.consumoTerminacao2 !== undefined && v.consumoTerminacao2 !== null ? String(v.consumoTerminacao2) : '',
 v.metaAcumulada !== undefined && v.metaAcumulada !== null ? String(v.metaAcumulada) : '',
 v.pesoAloj !== undefined && v.pesoAloj !== null ? String(v.pesoAloj) : '',
 v.pontuacaoSanitaria || ''
 ];
 })
 ];

 const worksheet = XLSX.utils.aoa_to_sheet(dataToExport);
 const workbook = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook, worksheet, "Visitas");
 
 // Fallback manual blob download for better mobile support
 try {
 const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
 const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
 
 const url = window.URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.setAttribute('download', `relatorio_visitas_${new Date().toISOString().split('T')[0]}.xlsx`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 window.URL.revokeObjectURL(url);
 } catch (err) {
 console.error('Error exporting:', err);
 XLSX.writeFile(workbook, `relatorio_visitas_${new Date().toISOString().split('T')[0]}.xlsx`);
 }
 };

 const visibleEmpresas = React.useMemo(() => {
  const defaultEmpresas = [
    { id: '00000000-0000-0000-0000-000000000001', nome: 'Rações Pastre', tipo: 'CLIENTE', ativo: true },
    { id: '00000000-0000-0000-0000-000000000002', nome: 'Grupo Bugio', tipo: 'CLIENTE', ativo: true },
    { id: '00000000-0000-0000-0000-000000000003', nome: 'Agropecuaria Mugnol', tipo: 'CLIENTE', ativo: true }
  ];

  const baseEmpresas = (empresas && empresas.length > 0) 
    ? empresas 
    : (() => {
        // Fallback para quando o RLS da tabela empresas no Supabase bloqueia a leitura (retornando array vazio)
        const map = new Map();
        defaultEmpresas.forEach(e => map.set(e.id, e));
        integrados.filter(i => i.empresaId && i.empresaName).forEach(i => {
          if (!map.has(i.empresaId)) {
             map.set(i.empresaId, { id: i.empresaId, nome: i.empresaName, ativo: true });
          }
        });
        return Array.from(map.values());
      })();

  if (!currentUserProfile || currentUserProfile.papel === 'MASTER' || currentUserProfile.papel === 'SUPER_ADMIN') {
    return baseEmpresas;
  }

  const permitidos = currentUserProfile.clientes_permitidos || [];
  const empresaLogada = currentUserProfile.empresa_id;
  
  const isNutronOrCoord = currentUserProfile.papel === 'TECNICO_NUTRON' || currentUserProfile.papel === 'COORDENADOR';
  if (isNutronOrCoord && permitidos.length === 0) {
    return baseEmpresas;
  }

  return baseEmpresas.filter(e => {
    const isPermitido = permitidos.includes(e.id);
    const isPropria = empresaLogada === e.id;
    return isPermitido || isPropria;
  });
}, [empresas, currentUserProfile, integrados]);

 const visibleIntegrados = React.useMemo(() => {
   let filtered = filterIntegradosForUser(integrados, currentUserProfile);
   if (selectedEmpresaFilter) {
     filtered = filtered.filter(i => i.empresaId === selectedEmpresaFilter);
   }
   return filtered;
 }, [integrados, currentUserProfile, selectedEmpresaFilter]);
 
 const visibleVisits = React.useMemo(() => filterVisitsForUser(visits, visibleIntegrados, currentUserProfile, !!selectedEmpresaFilter), [visits, visibleIntegrados, currentUserProfile, selectedEmpresaFilter]);

 const renderContent = () => {
 
  return (
 <>
 <div style={{ display: currentTab === 'prioridades' ? 'block' : 'none' }}>
 <Prioridades integrados={visibleIntegrados} visits={visibleVisits} onNavigateToIntegrado={(id) => setViewingIntegradoId(id)} />
 </div>

 <div style={{ display: currentTab === 'dashboard' ? 'block' : 'none' }}>
 <Dashboard visits={visibleVisits} integrados={visibleIntegrados} onNavigateToVisit={handleNavigateToViewIntegrado} />
 </div>
 
 {currentTab === 'visitas' && (
 isVisitFormOpen ? (
 <div className="space-y-6">
 <VisitaForm 
 integrados={visibleIntegrados} 
 empresas={visibleEmpresas}
 visits={visibleVisits}
 initialData={editingVisitId ? visits.find(v => v.id === editingVisitId) : undefined}
 isNewLote={isNewLoteMode}
 onSave={editingVisitId ? handleUpdateVisit : handleAddVisit} 
 onCancel={() => { setIsVisitFormOpen(false); setEditingVisitId(null); setIsNewLoteMode(false); }}
 />
 </div>
 ) : (
 <div className="space-y-4">
 <VisitsList 
 visits={visibleVisits} 
 integrados={visibleIntegrados} 
 onEditVisit={handleEditVisitClick} 
 onDeleteVisit={handleDeleteVisit} 
 onExport={handleExport}
 onNewVisit={() => { setEditingVisitId(null); setIsNewLoteMode(false); setIsVisitFormOpen(true); }}
 onNewLote={() => { setEditingVisitId(null); setIsNewLoteMode(true); setIsVisitFormOpen(true); }}
 viewingIntegradoId={viewingIntegradoId}
 onSetViewingIntegradoId={setViewingIntegradoId} empresas={visibleEmpresas} pendingSyncIds={pendingSyncIds}
 />
 </div>
 )
 )}
 
 {currentTab === 'integrados' && (
 <Integrados
 integrados={visibleIntegrados}
 visits={visibleVisits}
 totalVisits={visibleVisits.length}
 onUpdate={handleUpdateIntegrado}
 onDelete={handleDeleteIntegrado} empresas={empresas} />
 )}
 
 {currentTab === 'medicamentos' && <MedicationAnalysis visits={visibleVisits} integrados={visibleIntegrados} />}
 {currentTab === 'curva' && <ReferenceCurve currentUser={currentUserProfile} empresas={visibleEmpresas} />}
 {currentTab === 'importar' && <ImportData onImportComplete={() => { loadData(); setCurrentTab('dashboard'); }} />}
 {currentTab === 'parametros' && <EmpresaConfigGestao currentUser={currentUserProfile} empresas={visibleEmpresas} />}
 {currentTab === 'usuarios' && <UsuariosGestao integrados={integrados} currentUser={currentUserProfile} onImpersonate={(user) => {
  setMasterUserProfile(currentUserProfile);
  setCurrentUserProfile(user);
  setCurrentTab('dashboard');
}} />}

 {viewingIntegradoId && (
 <IntegradoDetailsModal
 integradoId={viewingIntegradoId}
 visits={visibleVisits}
 integrados={visibleIntegrados}
 onClose={() => setViewingIntegradoId(null)}
 />
 )}
 </>
 );
 };

 const getPageTitle = () => {
 switch(currentTab) {
 case 'prioridades': return 'Fila de Prioridades';
 case 'dashboard': return 'Dashboard de Desempenho';
 case 'visitas': return isVisitFormOpen ? (editingVisitId ? 'Editar Lançamento' : (isNewLoteMode ? 'Novo Lote' : 'Novo Lançamento')) : 'Visitas';
 case 'integrados': return 'Gestão de Lotes';
 case 'medicamentos': return 'Análise de Medicamentos';
 case 'curva': return 'Curvas de Consumo';
 case 'importar': return 'Importar Base de Dados';
 case 'usuarios': return 'Equipe & Controle de Clientes (RLS)';
 case 'parametros': return 'Parâmetros por Cliente';
 default: return 'Visão Geral';
 }
 }

 
  
 const handleLogout = useCallback(async () => {
   clearAuthCache();
   setCurrentUserProfile(null);
    setMasterUserProfile(null);
   setSession(null);
   try {
     await supabase.auth.signOut();
   } catch (e) {
     console.warn('Logout error:', e);
   }
 }, []);

 useEffect(() => {
   const onSessionExpired = () => {
     handleLogout();
     alert("Sua sessão expirou ou você acessou a rede após trabalhar offline. Por favor, faça login novamente para sincronizar seus dados.");
   };
   window.addEventListener('session-expired', onSessionExpired);
   return () => window.removeEventListener('session-expired', onSessionExpired);
 }, [handleLogout]);

if (loading) {
 
  return (
 <div className="flex h-screen items-center justify-center bg-slate-50">
 <p className="text-slate-500 font-medium">Carregando dados...</p>
 </div>
 );
 }

 
  if (!session) {
 return <Login onLoginSuccess={(profile) => {
   setCurrentUserProfile(profile);
   setSession({ user: { id: profile.id, email: profile.email } });
   loadData();
 }} />;
 }


 return (
 <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
 {/* Mobile overlay */}
 {isSidebarOpen && (
 <div 
 className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
 onClick={() => setIsSidebarOpen(false)}
 />
 )}
 
 <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-30 transition-transform duration-300 ease-in-out`}>
 <Sidebar 
   currentTab={currentTab.startsWith('visitas') ? 'visitas' : currentTab} 
   setCurrentTab={handleTabChange} 
   onStartTutorial={() => { setRunTutorial(true); setIsSidebarOpen(false); }}
   userProfile={currentUserProfile}
   onLogout={handleLogout}
   lastSyncTime={lastSyncTime}
   isOnline={isOnline}
   isSyncing={isSyncing}
   onForceSync={handleForceSync}
 />
 </div>

 <main className="flex-1 flex flex-col w-full min-w-0">
 <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm shrink-0">
 <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
 <button 
 className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
 onClick={() => setIsSidebarOpen(true)}
 >
 <Menu className="w-6 h-6" />
 </button>
 <h1 id="header-title" className="text-lg md:text-xl font-bold text-slate-800 truncate">{getPageTitle()}</h1>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 {visibleEmpresas.length > 1 && (
   <div className="hidden sm:flex items-center mr-2">
     <select
       value={selectedEmpresaFilter || ""}
       onChange={(e) => setSelectedEmpresaFilter(e.target.value || null)}
       className="text-sm border border-slate-200 rounded-md py-1.5 px-3 bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
     >
       <option value="">Todos os Clientes</option>
       {visibleEmpresas.filter(e => e.ativo !== false).map(emp => (
         <option key={emp.id} value={emp.id}>{emp.nome}</option>
       ))}
     </select>
   </div>
 )}
 {currentTab === 'integrados' && (
 <div className="hidden sm:flex items-center gap-3 text-xs text-slate-600 ml-2 border-l border-slate-200 pl-4">
 <div className="flex items-center gap-1.5">
 <Users className="w-4 h-4 text-blue-500" />
 <span>Lotes: <strong className="text-slate-800">{visibleIntegrados.length}</strong></span>
 </div>
 <div className="flex items-center gap-1.5">
 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
 <span>Ativos: <strong className="text-slate-800">{visibleIntegrados.filter(i => i.status === 'Em andamento').length}</strong></span>
 </div>
 </div>
 )}
 {currentTab === 'visitas' && !isVisitFormOpen && (
 <div className="hidden sm:flex items-center gap-3 text-xs text-slate-600 ml-2 border-l border-slate-200 pl-4">
 <div className="flex items-center gap-1.5">
 <ClipboardList className="w-4 h-4 text-blue-500" />
 <span>Lançamentos: <strong className="text-slate-800">{visibleVisits.length}</strong></span>
 </div>
 </div>
 )}
 </div>
 <div className="flex items-center gap-1 sm:gap-4 shrink-0">
 <div className="hidden lg:flex flex-col items-end justify-center mr-2">
 <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Hoje: {new Date().toLocaleDateString('pt-BR')}</span>
 </div>
 

 
 <button 
 onClick={() => setIsDarkMode(!isDarkMode)} 
 className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors" 
 title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
 >
 {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
 </button>

 {masterUserProfile && (
              <button 
                onClick={() => {
                  setCurrentUserProfile(masterUserProfile);
                  setMasterUserProfile(null);
                }}
                className="flex items-center gap-1 sm:gap-1.5 bg-purple-100 text-purple-800 text-[10px] sm:text-[11px] font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-purple-300 hover:bg-purple-200 transition-colors mr-1 sm:mr-2"
                title="Você está visualizando o sistema como outro usuário. Clique para retornar ao seu acesso."
              >
                <span>👑 Retornar ao Master</span>
              </button>
            )}
            <Notifications visits={visits} integrados={integrados} />
 <button onClick={handleLogout} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm font-medium transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg" title="Sair do Sistema">
 <LogOut className="w-4 h-4" />
 <span className="hidden sm:inline text-xs font-semibold">Sair</span>
 </button>
 </div>
 </header>
 <div className="flex-1 p-2 md:p-6 overflow-y-auto w-full">
 <div className="max-w-[1600px] mx-auto w-full">
 {dbError && (
 <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
 <div className="flex">
 <div className="flex-shrink-0">
 <X className="h-5 w-5 text-red-400" aria-hidden="true" />
 </div>
 <div className="ml-3">
 <h3 className="text-sm font-medium text-red-800">Falha na conexão com banco de dados</h3>
 <div className="mt-2 text-sm text-red-700">
 <p>{dbError}</p>
 </div>
 </div>
 </div>
 </div>
 )}
 <ErrorBoundary>
 {renderContent()}
 </ErrorBoundary>
 </div>
 </div>
 </main>
 {runTutorial && <Tutorial 
 run={true} 
 onChangeTab={setCurrentTab}
 onOpenVisitForm={() => { setIsVisitFormOpen(true); setIsNewLoteMode(false); }}
 onCloseVisitForm={() => setIsVisitFormOpen(false)}
 onOpenSidebar={() => setIsSidebarOpen(true)}
 onCloseSidebar={() => setIsSidebarOpen(false)}
 onFinish={() => {
 setRunTutorial(false);
 safeStorage.setItem('tutorial_completed', 'true');
 }} 
 />}
 </div>
 );
}
