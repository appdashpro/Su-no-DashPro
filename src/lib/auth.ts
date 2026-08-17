import { safeStorage } from './safeStorage';
import { supabase } from './supabase';
import { UserProfile, PapelUsuario, Integrado, Visit } from '../types';

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
        profile = {
          id: data.id,
          auth_uid: data.auth_uid || auth_uid,
          email: data.email || normEmail,
          nome: data.nome || profile.nome,
          papel: (data.papel as PapelUsuario) || profile.papel,
          empresa_id: data.empresa_id,
          integrado_padrao_id: data.integrado_padrao_id,
          clientes_permitidos: data.clientes_permitidos || (data.integrado_padrao_id ? [data.integrado_padrao_id] : [])
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
        .order('nome');

      if (!uErr && usersData && usersData.length > 0) {
        const mapped: UserProfile[] = usersData.map(u => {
          let allowed = u.clientes_permitidos || [];
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
  allowedIntegradoIds: string[]
): Promise<boolean> {
  try {
    // 1. Update local cache
    const currentList = await fetchAllUsers();
    const updatedUser: UserProfile = {
      ...user,
      clientes_permitidos: allowedIntegradoIds,
      integrado_padrao_id: user.papel === 'TECNICO_CLIENTE' && allowedIntegradoIds.length > 0 ? allowedIntegradoIds[0] : user.integrado_padrao_id
    };

    const existingIdx = currentList.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIdx >= 0) {
      currentList[existingIdx] = updatedUser;
    } else {
      currentList.push(updatedUser);
    }
    safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(currentList));

    // 2. If online, sync directly to Supabase usuarios table
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const emailNorm = user.email.toLowerCase().trim();
      
      // Check if user exists by email
      const { data: existingDbUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', emailNorm)
        .maybeSingle();

      const userPayload = {
        email: emailNorm,
        nome: user.nome,
        papel: user.papel,
        empresa_id: user.empresa_id || null,
        integrado_padrao_id: updatedUser.integrado_padrao_id || null,
        clientes_permitidos: allowedIntegradoIds,
        ativo: true,
        updated_at: new Date().toISOString()
      };

      if (existingDbUser) {
        await supabase
          .from('usuarios')
          .update(userPayload)
          .eq('id', existingDbUser.id);
      } else {
        await supabase
          .from('usuarios')
          .insert({
            id: user.id && !user.id.startsWith('usr_') ? user.id : undefined,
            ...userPayload
          });
      }
    }

    return true;
  } catch (e) {
    console.error('Error saving user in usuarios table:', e);
    return false;
  }
}

/**
 * Deletes a user (Master access).
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const currentList = await fetchAllUsers();
    const filtered = currentList.filter(u => u.id !== userId);
    safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(filtered));

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await supabase.from('usuarios').delete().eq('id', userId);
    }
    return true;
  } catch (e) {
    console.error('Error deleting user:', e);
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

  if (user.papel === 'TECNICO_NUTRON' || user.papel === 'COORDENADOR') {
    if (user.clientes_permitidos && user.clientes_permitidos.length > 0) {
      return integrados.filter(i => 
        user.clientes_permitidos!.includes(i.id) || 
        user.clientes_permitidos!.includes(i.name)
      );
    }
    return integrados;
  }

  if (user.papel === 'TECNICO_CLIENTE' || user.papel === 'TECNICO' || user.papel === 'ADMIN_EMPRESA') {
    if (user.clientes_permitidos && user.clientes_permitidos.length > 0) {
      return integrados.filter(i => 
        user.clientes_permitidos!.includes(i.id) || 
        user.clientes_permitidos!.includes(i.name)
      );
    }
    // If no specific client is bound yet, defaults to the first available integrado for safety
    if (integrados.length > 0) {
      return [integrados[0]];
    }
    return [];
  }

  return integrados;
}

/**
 * Filter visits based on allowed integrados.
 */
export function filterVisitsForUser(visits: Visit[], allowedIntegrados: Integrado[], user: UserProfile | null): Visit[] {
  if (!user || user.papel === 'MASTER' || user.papel === 'SUPER_ADMIN') {
    return visits;
  }

  const allowedIds = new Set(allowedIntegrados.map(i => i.id));
  const allowedNames = new Set(allowedIntegrados.map(i => i.name.toLowerCase()));

  return visits.filter(v => {
    if (allowedIds.has(v.integradoId)) return true;
    const match = allowedIntegrados.find(i => {
      const normName = i.name.toLowerCase().replace(/\s+/g, '');
      return v.integradoId.toLowerCase().includes(normName);
    });
    return !!match;
  });
}
