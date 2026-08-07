import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Shield, User, X, ShieldAlert, Search, Mail, Lock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const AdminUsers = () => {
  const { user: currentUser, toggleRole } = useOutletContext<any>() || {};
  const navigate = useNavigate();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; name?: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    try {
      setUsers(prev => prev.filter(u => String(u.id) !== String(id)));
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      fetchUsers();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingUser.id ? 'PUT' : 'POST';
      const url = editingUser.id ? `/api/users/${editingUser.id}` : '/api/users';
      
      const payload: any = {
        username: editingUser.username,
        email: editingUser.email || `${editingUser.username}@geekay.com`,
        role: editingUser.role || 'editor',
        status: editingUser.status || 'active',
      };

      if (editingUser.password && editingUser.password.trim() !== '') {
        payload.password = editingUser.password;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save user');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to save user');
    }
  };

  // Check if current active role is Editor (Restricted Access)
  if (currentUser && currentUser.role === 'editor') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 max-w-2xl mx-auto space-y-6">
        <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center text-red-500 mb-2">
          <ShieldAlert size={40} />
        </div>
        
        <div>
          <span className="text-red-500 font-syncopate text-[10px] font-bold tracking-[0.4em] uppercase block mb-2">RESTRICTED_ACCESS</span>
          <h1 className="font-syncopate text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
            ADMINISTRATOR PRIVILEGES REQUIRED
          </h1>
        </div>

        <p className="text-slate-400 font-inter text-sm leading-relaxed">
          Your current session is active as <span className="text-blue-400 font-bold uppercase">Editor</span>. Editor accounts have full access to manage content, news, teams, creators, and schedule, but <span className="text-white font-bold">User Management is restricted exclusively to Admins</span>.
        </p>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          {toggleRole && (
            <button
              onClick={toggleRole}
              className="px-6 py-4 bg-[#FFC400] hover:bg-[#FFC400]/90 text-black font-syncopate text-xs font-black uppercase tracking-wider transition-all w-full sm:w-auto"
            >
              👑 SWITCH TO ADMIN ROLE TO TEST
            </button>
          )}
          <button
            onClick={() => navigate('/admin')}
            className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-syncopate text-xs font-bold uppercase tracking-wider transition-all w-full sm:w-auto"
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalEditors = users.filter(u => u.role === 'editor').length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-3 block uppercase">
            SECURITY & OPERATIVE MANAGEMENT
          </span>
          <h1 className="font-syncopate text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
            USERS & ROLES
          </h1>
        </div>
        <ArenaButton onClick={() => setEditingUser({ username: '', email: '', role: 'editor', password: '', status: 'active' })}>
          <Plus size={18} className="mr-2" /> CREATE_OPERATIVE
        </ArenaButton>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-[#081B3A] border border-white/5 relative overflow-hidden">
          <div className="text-slate-500 font-syncopate text-[9px] font-bold tracking-widest uppercase mb-1">TOTAL OPERATIVES</div>
          <div className="text-3xl font-black font-syncopate text-white">{users.length}</div>
          <div className="text-slate-500 text-[10px] mt-2 font-mono">DATABASE USERS</div>
        </div>

        <div className="p-6 bg-[#081B3A] border border-[#FFC400]/20 relative overflow-hidden">
          <div className="text-[#FFC400] font-syncopate text-[9px] font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
            <Shield size={12} /> ADMINS (FULL ACCESS)
          </div>
          <div className="text-3xl font-black font-syncopate text-[#FFC400]">{totalAdmins}</div>
          <div className="text-slate-500 text-[10px] mt-2 font-mono">SYSTEM ADMINISTRATORS</div>
        </div>

        <div className="p-6 bg-[#081B3A] border border-blue-500/20 relative overflow-hidden">
          <div className="text-blue-400 font-syncopate text-[9px] font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
            <User size={12} /> EDITORS (RESTRICTED USERS)
          </div>
          <div className="text-3xl font-black font-syncopate text-blue-400">{totalEditors}</div>
          <div className="text-slate-500 text-[10px] mt-2 font-mono">CONTENT EDITORS</div>
        </div>
      </div>

      {/* Search & Notice */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search operative, email or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#081B3A] border border-slate-800 py-3 pl-11 pr-4 text-white text-xs font-syncopate tracking-wider focus:outline-none focus:border-[#FFC400]"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2 font-mono bg-white/5 px-4 py-2 border border-white/5">
          <ShieldCheck size={14} className="text-[#FFC400]" />
          <span>Editor role has complete access to everything EXCEPT Users Management.</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#081B3A] border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-syncopate text-xs tracking-widest uppercase">
            LOADING OPERATIVE ACCOUNTS...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-syncopate text-xs tracking-widest uppercase">
            NO OPERATIVES FOUND IN DATABASE
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-syncopate text-[10px] tracking-widest uppercase">
              <thead className="text-slate-500 border-b border-white/5 bg-black/20">
                <tr>
                  <th className="p-6 font-bold">OPERATIVE</th>
                  <th className="p-6 font-bold">EMAIL</th>
                  <th className="p-6 font-bold">ROLE & PERMISSIONS</th>
                  <th className="p-6 font-bold">STATUS</th>
                  <th className="p-6 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                          u.role === 'admin' ? 'bg-[#FFC400]/20 text-[#FFC400]' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {u.username ? u.username[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-white text-xs block">{u.username}</span>
                          <span className="text-[8px] text-slate-500 font-mono">ID: #{u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-slate-400 font-mono text-xs normal-case">
                      {u.email || `${u.username}@geekay.com`}
                    </td>
                    <td className="p-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/5">
                        <Shield size={12} className={u.role === 'admin' ? 'text-[#FFC400]' : 'text-blue-400'} />
                        <span className={`font-bold ${u.role === 'admin' ? 'text-[#FFC400]' : 'text-blue-400'}`}>
                          {u.role === 'admin' ? 'ADMIN (ALL ACCESS)' : 'EDITOR (EXCEPT USERS)'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] px-2.5 py-1 font-mono font-bold ${
                        u.status === 'inactive' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'inactive' ? 'bg-red-500' : 'bg-emerald-400'}`} />
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditingUser(u)} 
                          className="p-2.5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteTarget({ id: u.id, name: u.username })} 
                          className="p-2.5 bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/10 w-full max-w-lg relative z-10 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-syncopate text-lg font-black text-white uppercase tracking-tighter">
                {editingUser.id ? 'EDIT OPERATIVE ACCOUNT' : 'CREATE NEW OPERATIVE'}
              </h2>
              <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">USERNAME</label>
                <input 
                  type="text" 
                  value={editingUser.username || ''}
                  onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  placeholder="e.g. jhon_doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  value={editingUser.email || ''}
                  onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-inter text-xs focus:outline-none focus:border-[#FFC400]"
                  placeholder="e.g. editor@geekay.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">ASSIGN ROLE</label>
                  <select 
                    value={editingUser.role || 'editor'}
                    onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  >
                    <option value="editor">EDITOR (ALL EXCEPT USERS)</option>
                    <option value="admin">ADMIN (FULL ACCESS)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">ACCOUNT STATUS</label>
                  <select 
                    value={editingUser.status || 'active'}
                    onChange={e => setEditingUser({...editingUser, status: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  >
                    <option value="active">ACTIVE</option>
                    <option value="inactive">INACTIVE / SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  PASSWORD {editingUser.id && '(LEAVE BLANK TO KEEP UNCHANGED)'}
                </label>
                <input 
                  type="password" 
                  value={editingUser.password || ''}
                  onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  placeholder={editingUser.id ? '••••••••' : 'Enter account password'}
                  required={!editingUser.id}
                />
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)} 
                  className="px-6 py-3 font-syncopate text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                  CANCEL
                </button>
                <ArenaButton type="submit">SAVE OPERATIVE</ArenaButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title="DELETE_USER_ACCOUNT"
        itemName={deleteTarget?.name}
        description="Are you sure you want to delete this operative account? They will immediately lose access to the administrative control center."
      />
    </div>
  );
};

export default AdminUsers;
