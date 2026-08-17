import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Check, 
  Copy, 
  Search, 
  Building, 
  Shield, 
  Key, 
  AlertCircle, 
  CheckCircle2, 
  Code2, 
  RefreshCw 
} from 'lucide-react';
import { UserProfile, PapelUsuario, Integrado, getRoleLabel, Empresa } from '../types';
import { supabase } from '../lib/supabase';
import { fetchAllUsers, saveUserWithPermissions, deleteUser, MASTER_EMAILS } from '../lib/auth';

interface UsuariosGestaoProps {
  integrados: Integrado[];
  currentUser: UserProfile | null;
}

export function UsuariosGestao({ integrados, currentUser }: UsuariosGestaoProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    papel: 'TECNICO_NUTRON' as PapelUsuario,
    selectedIntegrados: [] as string[],
    empresa_id: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // SQL Script Viewer Modal
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    async function loadEmpresas() {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .eq('ativo', true)
          .order('nome');
        if (data && !error) {
          setEmpresas(data);
        }
      } catch (err) {
        console.error('Erro ao carregar empresas:', err);
      }
    }
    loadEmpresas();
  }, []);

  const openNewUserModal = () => {
    setEditingUser(null);
    setFormData({
      nome: '',
      email: '',
      papel: 'TECNICO_NUTRON',
      selectedIntegrados: [] as string[],
      empresa_id: ''
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditUserModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      papel: user.papel,
      selectedIntegrados: user.clientes_permitidos || [],
      empresa_id: user.empresa_id || ''
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.email.trim()) {
      setError('Nome e E-mail são obrigatórios.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const userToSave: UserProfile = {
        id: editingUser?.id || 'usr_' + Math.random().toString(36).substring(2, 9),
        auth_uid: editingUser?.auth_uid,
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        papel: formData.papel,
        empresa_id: (formData.papel === 'TECNICO_CLIENTE' || formData.papel === 'ADMIN_EMPRESA') ? formData.empresa_id : undefined,
        clientes_permitidos: formData.papel === 'TECNICO_NUTRON' ? formData.selectedIntegrados : []
      };

      const success = await saveUserWithPermissions(userToSave, userToSave.clientes_permitidos || []);
      if (success) {
        setSaveSuccess('Usuário e vínculos salvos com sucesso!');
        setTimeout(() => setSaveSuccess(null), 3000);
        setIsModalOpen(false);
        await loadUsers();
      } else {
        setError('Não foi possível salvar o usuário. Tente novamente.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (MASTER_EMAILS.includes(user.email.toLowerCase())) {
      alert('O usuário Master principal não pode ser excluído.');
      return;
    }

    if (confirm(`Tem certeza que deseja remover o usuário ${user.nome} (${user.email})?`)) {
      setLoading(true);
      await deleteUser(user.id);
      await loadUsers();
    }
  };

  const toggleIntegradoSelection = (idOrName: string) => {
    setFormData(prev => {
      const exists = prev.selectedIntegrados.includes(idOrName);
      if (exists) {
        return { ...prev, selectedIntegrados: prev.selectedIntegrados.filter(item => item !== idOrName) };
      } else {
        return { ...prev, selectedIntegrados: [...prev.selectedIntegrados, idOrName] };
      }
    });
  };

  // Distinct active integrados list
  const uniqueIntegrados = useMemo(() => {
    const map = new Map<string, Integrado>();
    integrados.forEach(i => {
      if (!map.has(i.name)) {
        map.set(i.name, i);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [integrados]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = 
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRole = 
        roleFilter === 'todos' || 
        (roleFilter === 'master' && (u.papel === 'MASTER' || u.papel === 'SUPER_ADMIN')) ||
        (roleFilter === 'nutron' && (u.papel === 'TECNICO_NUTRON' || u.papel === 'COORDENADOR')) ||
        (roleFilter === 'cliente' && (u.papel === 'TECNICO_CLIENTE' || u.papel === 'TECNICO'));

      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  const copySqlScript = () => {
    const sqlContent = `-- SQL RLS Setup for Supabase
-- Execute no SQL Editor do Supabase para ativar o RLS completo:
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tecnico_integrados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;

-- Veja o arquivo /supabase_rls_setup.sql para o script completo com todas as funções e regras.`;

    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Master Badge */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Controle de Acesso e Clientes (RLS)
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                  Exclusivo Master
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Cadastre e atrele os clientes aos técnicos Nutron e restrinja os técnicos de clientes aos seus respectivos produtores.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors"
              title="Visualizar e copiar script SQL de RLS para o Supabase"
            >
              <Code2 className="w-4 h-4 text-slate-600" />
              Script SQL RLS
            </button>
            <button
              onClick={openNewUserModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Novo Usuário
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setRoleFilter('todos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'todos' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('master')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'master' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            👑 Master
          </button>
          <button
            onClick={() => setRoleFilter('nutron')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'nutron' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            🏢 Téc. Nutron
          </button>
          <button
            onClick={() => setRoleFilter('cliente')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              roleFilter === 'cliente' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            🚜 Téc. Cliente
          </button>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table / Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Usuário / E-mail</th>
                <th className="px-5 py-3.5">Papel / Nível</th>
                <th className="px-5 py-3.5">Clientes Atrelados</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isMaster = user.papel === 'MASTER' || user.papel === 'SUPER_ADMIN';
                  const isNutron = user.papel === 'TECNICO_NUTRON' || user.papel === 'COORDENADOR';
                  const isClient = user.papel === 'TECNICO_CLIENTE' || user.papel === 'TECNICO';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{user.nome}</div>
                        <div className="text-slate-500 font-mono text-[11px] mt-0.5">{user.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        {isMaster && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                            👑 Acesso Master
                          </span>
                        )}
                        {isNutron && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                            🏢 Técnico Nutron
                          </span>
                        )}
                        {isClient && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                            🚜 Técnico Cliente
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isMaster ? (
                          <span className="text-purple-700 font-medium bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                            Todos os clientes (Visão Geral)
                          </span>
                        ) : isNutron ? (
                          user.clientes_permitidos && user.clientes_permitidos.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-md">
                              {user.clientes_permitidos.map((intId, idx) => {
                                const empObj = empresas.find(e => e.id === intId);
                                const displayName = empObj ? empObj.nome : "Cliente Desconhecido";
                                return (
                                  <span key={idx} className="inline-block bg-blue-50 text-blue-700 border border-blue-100 rounded px-1.5 py-0.5 text-[10px]">
                                    {displayName}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Todos os clientes (Sem restrição)</span>
                          )
                        ) : (
                          user.empresa_id ? (
                            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-2 py-0.5 text-[11px] font-medium">
                              {empresas.find(e => e.id === user.empresa_id)?.nome || 'Cliente Desconhecido'}
                            </span>
                          ) : user.clientes_permitidos && user.clientes_permitidos.length > 0 ? (
                            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-2 py-0.5 text-[11px] font-medium">
                              {uniqueIntegrados.find(i => i.id === user.clientes_permitidos![0] || i.name === user.clientes_permitidos![0])?.name || user.clientes_permitidos[0]}
                            </span>
                          ) : (
                            <span className="text-amber-600 italic">Nenhum cliente atrelado</span>
                          )
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditUserModal(user)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar usuário e vínculos"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {!MASTER_EMAILS.includes(user.email.toLowerCase()) && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remover usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastrar / Editar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? 'Editar Usuário e Clientes' : 'Novo Usuário do Sistema'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 pt-4 overflow-y-auto pr-1">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: João da Silva"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail de Acesso (Supabase Auth)
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ex: joao.silva@empresa.com"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Papel de Acesso
                </label>
                <select
                  value={formData.papel}
                  onChange={(e) => setFormData({ ...formData, papel: e.target.value as PapelUsuario })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="TECNICO_NUTRON">🏢 Técnico Nutron (Consultoria - Múltiplos Clientes)</option>
                  <option value="TECNICO_CLIENTE">🚜 Técnico do Cliente (Granja Única)</option>
                  <option value="MASTER">👑 Acesso Master (Controle Total)</option>
                </select>
              </div>

              {/* Client assignment section based on role */}
              {formData.papel === 'TECNICO_NUTRON' && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Clientes Atrelados à Carteira ({formData.selectedIntegrados.length} selecionados)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.selectedIntegrados.length === empresas.length) {
                          setFormData({ ...formData, selectedIntegrados: [] });
                        } else {
                          setFormData({ ...formData, selectedIntegrados: empresas.map(e => e.id) });
                        }
                      }}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      {formData.selectedIntegrados.length === empresas.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2.5">
                    Selecione quais clientes (empresas) este consultor Nutron pode visualizar e lançar visitas:
                  </p>
                  
                  <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl p-2.5 space-y-1.5 bg-slate-50">
                    {empresas.map((e) => {
                      const isChecked = formData.selectedIntegrados.includes(e.id);
                      return (
                        <label key={e.id} className="flex items-center gap-2.5 text-xs text-slate-800 hover:bg-white p-1.5 rounded-lg cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleIntegradoSelection(e.id)}
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className="font-medium">{e.nome}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {formData.papel === 'TECNICO_CLIENTE' && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Cliente (Empresa) do Técnico
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    O técnico do cliente terá acesso <strong>única e exclusivamente</strong> aos dados deste cliente:
                  </p>
                  <select
                    value={formData.empresa_id || ''}
                    onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="">Selecione o cliente (empresa)...</option>
                    {empresas.map((e) => (
                      <option key={e.id} value={e.id}>{e.nome}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
                >
                  {saving ? 'Salvando...' : 'Salvar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Script SQL Supabase Viewer */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Script SQL de Ativação do RLS no Supabase
                </h3>
              </div>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-3 text-xs text-slate-600">
              <p className="mb-2">
                O script completo foi gerado no arquivo <code>/supabase_rls_setup.sql</code> no seu projeto.
              </p>
              <p className="mb-3 text-slate-500">
                Ele ativa o <strong>Row Level Security (RLS)</strong> diretamente na tabela <code>usuarios</code>, define as funções seguras (<code>is_master</code>, <code>get_my_allowed_integrados</code>) e aplica as políticas para Master (Roger Francescon), Técnico Nutron e Técnico do Cliente (ex: Rações Pastre).
              </p>

              <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-[11px] overflow-y-auto max-h-64 border border-slate-800">
                <pre>{`-- ATIVAR RLS EM TODAS AS TABELAS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;

-- MASTER (Roger Francescon): Acesso total irrestrito
CREATE POLICY "Master total" ON public.integrados FOR ALL TO authenticated
USING (public.is_master()) WITH CHECK (public.is_master());

-- TÉCNICOS: Apenas integrados e lotes permitidos da tabela usuarios
CREATE POLICY "Tecnicos permitidos" ON public.integrados FOR SELECT TO authenticated
USING (id IN (SELECT integrado_id FROM public.get_my_allowed_integrados()));`}</pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Arquivo: <code>supabase_rls_setup.sql</code>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copySqlScript}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Instrução
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSqlModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
