import { safeStorage } from './safeStorage';
import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';
import { UserProfile, PapelUsuario, Integrado, Visit } from '../types';
import { generateUUID } from '../utils/uuid';

const PROFILE_KEY = 'suino_dashpro_user_profile';
const SESSION_CACHE_KEY = 'suino_dashpro_cached_session';

export const MASTER_EMAILS = [
  'rogerfrancescon@gmail.com',
  'admin@nutron.com.br',
  'admin@suinodashpro.com'
];

/**
 * Returns currently saved user profile from local storage.
 */
export function getSavedUserProfile(): UserProfile | null {
  try {
    const raw = safeStorage.getItem(PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading saved user profile', e);
  }
  return null;
}

/**
 * Saves user profile to local storage for offline resilience.
 */
export function saveUserProfile(profile: UserProfile): void {
  try {
    safeStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving user profile', e);
  }
}

/**
 * Caches auth session for offline field operations.
 */
export function cacheAuthSession(session: any): void {
  try {
    if (session) {
      safeStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
        user: {
          id: session.user?.id || 'offline_user',
          email: session.user?.email || '',
          user_metadata: session.user?.user_metadata || {}
        },
        cached_at: new Date().toISOString()
      }));
    }
  } catch (e) {
    console.error('Error caching auth session', e);
  }
}

/**
 * Retrieves cached auth session when offline in the field.
 */
export function getCachedAuthSession(): any | null {
  try {
    const raw = safeStorage.getItem(SESSION_CACHE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading cached auth session', e);
  }
  return null;
}

/**
 * Clears saved session and profile on explicit logout.
 */
export function clearAuthCache(): void {
  safeStorage.removeItem(PROFILE_KEY);
  safeStorage.removeItem(SESSION_CACHE_KEY);
}

const USERS_LIST_KEY = 'suino_dashpro_users_list';
const TECNICO_INTEGRADOS_KEY = 'suino_dashpro_tecnico_integrados';

/**
 * Resolves user profile from Supabase with fallback to local rules and cache.
 */
export async function resolveUserProfile(email: string, auth_uid?: string): Promise<UserProfile> {
  const normEmail = (email || '').trim().toLowerCase();

  // Check if we already have a locally cached profile with this email
  const existingLocal = getSavedUserProfile();
  
  // 1. Determine role based on Master emails and rules
  let role: PapelUsuario = 'TECNICO_CLIENTE';
  let nome = email.split('@')[0] || 'Usuário';

  if (MASTER_EMAILS.includes(normEmail)) {
    role = 'MASTER';
    nome = 'Roger Francescon (Master)';
  } else if (normEmail.includes('nutron') || normEmail.includes('cargill') || normEmail.includes('consultor')) {
    role = 'TECNICO_NUTRON';
    nome = `Técnico Nutron (${email.split('@')[0]})`;
  } else {
    role = 'TECNICO_CLIENTE';
    nome = `Técnico (${email.split('@')[0]})`;
  }

  let profile: UserProfile = {
    id: auth_uid || (existingLocal?.id || 'usr_' + Math.random().toString(36).substring(2, 9)),
    auth_uid: auth_uid || existingLocal?.auth_uid,
    email: normEmail,
    nome: existingLocal?.nome || nome,
    papel: existingLocal?.papel || role,
    empresa_id: existingLocal?.empresa_id,
    empresa_nome: existingLocal?.empresa_nome,
    integrado_padrao_id: existingLocal?.integrado_padrao_id,
    clientes_permitidos: existingLocal?.clientes_permitidos || []
  };

  // If online, try to query Supabase usuarios table for official profile
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .or(`auth_uid.eq.${auth_uid || '00000000-0000-0000-0000-000000000000'},email.eq.${normEmail}`)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        let permissoes = data.integrado_padrao_id ? [data.integrado_padrao_id] : [];
        try {
          const { data: permData } = await supabase
            .from('usuario_empresas_permitidas')
            .select('empresa_id')
            .eq('usuario_id', data.id);
          if (permData && permData.length > 0) {
            permissoes = Array.from(new Set([...permissoes, ...permData.map(p => p.empresa_id)]));
          }
        } catch(e) { /* ignore */ }

        profile = {
          id: data.id,
          auth_uid: data.auth_uid || auth_uid,
          email: data.email || normEmail,
          nome: data.nome || profile.nome,
          papel: (data.papel as PapelUsuario) || profile.papel,
          empresa_id: data.empresa_id,
          integrado_padrao_id: data.integrado_padrao_id,
          clientes_permitidos: permissoes
        };
      }
    } catch (e) {
      console.warn('Could not fetch online profile, using cached/derived profile:', e);
    }
  }

  // Enforce Master role for master emails even if database had a different flag
  if (MASTER_EMAILS.includes(normEmail)) {
    profile.papel = 'MASTER';
  }

  saveUserProfile(profile);
  return profile;
}

/**
 * Fetches all registered users for administration (Master access).
 */
export async function fetchAllUsers(): Promise<UserProfile[]> {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const { data: usersData, error: uErr } = await supabase
        .from('usuarios')
        .select('*')
        .is('deleted_at', null)
        .order('nome');

      if (!uErr && usersData && usersData.length > 0) {
        // Fetch ALL permissions to map to users
        const { data: permData } = await supabase.from('usuario_empresas_permitidas').select('*');
        const permMap = new Map<string, string[]>();
        if (permData) {
          permData.forEach(p => {
            if (!permMap.has(p.usuario_id)) permMap.set(p.usuario_id, []);
            permMap.get(p.usuario_id)!.push(p.empresa_id);
          });
        }

        const mapped: UserProfile[] = usersData.map(u => {
          let allowed: string[] = permMap.get(u.id) || [];
          if (u.integrado_padrao_id && !allowed.includes(u.integrado_padrao_id)) {
            allowed = [...allowed, u.integrado_padrao_id];
          }

          return {
            id: u.id,
            auth_uid: u.auth_uid,
            email: u.email,
            nome: u.nome,
            papel: u.papel as PapelUsuario,
            empresa_id: u.empresa_id,
            integrado_padrao_id: u.integrado_padrao_id,
            clientes_permitidos: allowed
          };
        });

        safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(mapped));
        return mapped;
      }
    }
  } catch (e) {
    console.warn('Error fetching users from Supabase, loading from cache:', e);
  }

  // Fallback from cache or default seed
  try {
    const raw = safeStorage.getItem(USERS_LIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return [
    {
      id: '00000000-0000-0000-0000-000000000099',
      email: 'rogerfrancescon@gmail.com',
      nome: 'Roger Francescon (Master)',
      papel: 'MASTER',
      clientes_permitidos: []
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'tecnico@racoespastre.com.br',
      nome: 'Técnico - Rações Pastre',
      papel: 'TECNICO_CLIENTE',
      clientes_permitidos: []
    }
  ];
}

/**
 * Saves a user and their assigned clients/integrados directly in usuarios table (Master access).
 */
export async function saveUserWithPermissions(
  user: UserProfile,
  allowedIntegradoIds: string[],
  password?: string
): Promise<{ success: boolean; authError?: string; authCreated?: boolean }> {
  try {
    const currentList = await fetchAllUsers();
    let isExistingUser = !!user.auth_uid;
    let authCreated = false;
    let authErrorMsg = undefined;
    let resolvedAuthUid = user.auth_uid;

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      if (!isExistingUser && password) {
        // FASE 5: ADMIN CREATE USER (Edge Function / API Backend)
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (token) {
            const reqBody = {
              email: user.email,
              password: password,
              nome: user.nome,
              papel: user.papel,
              empresa_id: user.empresa_id,
              clientes_permitidos: allowedIntegradoIds
            };
            const response = await fetch('/api/admin/create-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
              body: JSON.stringify(reqBody)
            });
            const resData = await response.json();
            if (response.ok && resData.user) {
              // The backend handles inserting the user profile and permissions!
              return { success: true, authCreated: true };
            } else {
              return { success: false, authError: resData.error || 'Failed to create user via API' };
            }
          } else {
             return { success: false, authError: 'No session token' };
          }
        } catch(e: any) {
          console.error("Admin API error", e);
          return { success: false, authError: e.message };
        }
      } else if (isExistingUser) {
        // Update existing user profile
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({
            nome: user.nome,
            papel: user.papel,
            empresa_id: user.empresa_id || '00000000-0000-0000-0000-000000000000'
          })
          .eq('auth_uid', user.auth_uid);
        
        if (updateError) {
          console.error('Error updating user', updateError);
          return { success: false, authError: updateError.message };
        }

        // FASE 3: Sync Permissions to relational table
        if (allowedIntegradoIds && allowedIntegradoIds.length > 0) {
          // 1. Delete old
          await supabase.from('usuario_empresas_permitidas').delete().eq('usuario_id', user.id);
          // 2. Insert new
          const permRows = allowedIntegradoIds.map(emp_id => ({ usuario_id: user.id, empresa_id: emp_id }));
          await supabase.from('usuario_empresas_permitidas').insert(permRows);
        } else {
          // Clear permissions
          await supabase.from('usuario_empresas_permitidas').delete().eq('usuario_id', user.id);
        }
      }
    }
    
    // Fallback/Local updates
    const updatedUser = { ...user, clientes_permitidos: allowedIntegradoIds };
    const existingIdx = currentList.findIndex(u => u.auth_uid === user.auth_uid);
    if (existingIdx >= 0) {
      currentList[existingIdx] = updatedUser;
    } else {
      currentList.push(updatedUser);
    }
    const safeStorage = require('./safeStorage').safeStorage;
    safeStorage.setItem('suino_dashpro_users_list', JSON.stringify(currentList));
    
    return { success: true, authCreated, authError: authErrorMsg };
  } catch(e: any) {
    console.error("Save User Exception", e);
    return { success: false, authError: e.message };
  }
}

// Function ends here. Keep the rest of the file.

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const currentList = await fetchAllUsers();
    const filtered = currentList.filter(u => u.id !== userId);
    safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(filtered));

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      // Instead of a hard delete which fails on foreign key constraints, 
      // we do a soft-delete: mark the user as inactive and set deleted_at
      const { error: opError } = await supabase.from('usuarios')
        .update({ ativo: false, deleted_at: new Date().toISOString() })
        .eq('id', userId);
      if (opError) throw opError;
    }
    return true;
  } catch (e: any) {
    console.error('Error deleting user:', e);
    alert('Erro ao excluir usuário no banco: ' + (e.message || JSON.stringify(e)));
    return false;
  }
}

/**
 * Filter integrados based on user role and permissions.
 * - MASTER: sees all integrados
 * - TECNICO_NUTRON: sees integrados assigned or all if none restricted
 * - TECNICO_CLIENTE: sees only their assigned client/integrado
 */
export function filterIntegradosForUser(integrados: Integrado[], user: UserProfile | null): Integrado[] {
  if (!user || user.papel === 'MASTER' || user.papel === 'SUPER_ADMIN') {
    return integrados;
  }

  // TECNICO_NUTRON or COORDENADOR
  if (user.papel === 'TECNICO_NUTRON' || user.papel === 'COORDENADOR') {
    if (user.clientes_permitidos && user.clientes_permitidos.length > 0) {
      const filtered = integrados.filter(i => 
        user.clientes_permitidos!.some(allowed => {
          if (!allowed) return false;
          if (allowed === i.empresaId) return true;
          const allowedNorm = allowed.toLowerCase().trim();
          const nameNorm = i.name.toLowerCase().trim();
          return allowed === i.id || allowedNorm === nameNorm || nameNorm.includes(allowedNorm) || allowedNorm.includes(nameNorm);
        })
      );
      return filtered;
    }
    return integrados;
  }

  // TECNICO_CLIENTE or TECNICO
  if (user.papel === 'TECNICO_CLIENTE' || user.papel === 'TECNICO' || user.papel === 'ADMIN_EMPRESA') {
    let filtered = integrados;
    if (user.clientes_permitidos && user.clientes_permitidos.length > 0) {
      filtered = integrados.filter(i => 
        user.clientes_permitidos!.some(allowed => {
          if (!allowed) return false;
          if (allowed === i.empresaId) return true;
          const allowedNorm = allowed.toLowerCase().trim();
          const nameNorm = i.name.toLowerCase().trim();
          return allowed === i.id || allowedNorm === nameNorm || nameNorm.includes(allowedNorm) || allowedNorm.includes(nameNorm);
        })
      );
    } else if (user.empresa_id) {
      filtered = integrados.filter(i => i.empresaId === user.empresa_id);
    } else {
      filtered = [];
    }
    return filtered;
  }

  return integrados;
}

/**
 * Filter visits based on allowed integrados.
 */
export function filterVisitsForUser(visits: Visit[], allowedIntegrados: Integrado[], user: UserProfile | null, isFilterActive: boolean = false): Visit[] {
  if (!isFilterActive && (!user || user.papel === 'MASTER' || user.papel === 'SUPER_ADMIN')) {
    return visits;
  }

  if (!allowedIntegrados || allowedIntegrados.length === 0) {
    return [];
  }

  const allowedIds = new Set(allowedIntegrados.map(i => i.id));
  const allowedNames = new Set(allowedIntegrados.map(i => i.name.toLowerCase().trim()));

  return visits.filter(v => {
    if (allowedIds.has(v.integradoId)) return true;
    const match = allowedIntegrados.find(i => {
      const normName = i.name.toLowerCase().replace(/\s+/g, '');
      const normVId = (v.integradoId || '').toLowerCase().replace(/\s+/g, '');
      return normVId.includes(normName) || normName.includes(normVId) || allowedNames.has(normVId);
    });
    return !!match;
  });
}
