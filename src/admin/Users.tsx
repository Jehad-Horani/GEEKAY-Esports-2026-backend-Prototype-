
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Shield, User, X, ShieldAlert } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    setUsers([
      { id: 1, username: 'admin', role: 'admin' },
      { id: 2, username: 'editor_one', role: 'editor' }
    ]);
    setLoading(false);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to save user
    setEditingUser(null);
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-4 block uppercase">ACCESS_CONTROL</span>
          <h1 className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">USERS</h1>
        </div>
        <ArenaButton onClick={() => setEditingUser({ username: '', role: 'editor', password: '' })}>
          <Plus size={18} className="mr-2" /> CREATE_USER
        </ArenaButton>
      </header>

      <div className="bg-amber-500/10 border border-amber-500/30 p-8 flex items-start gap-6 mb-12">
        <ShieldAlert className="text-amber-500 shrink-0" size={24} />
        <div>
          <h3 className="font-syncopate text-sm font-bold text-amber-500 uppercase tracking-widest mb-2">SECURITY_NOTICE</h3>
          <p className="text-amber-500/70 font-inter text-xs leading-relaxed">
            Only Admins can manage users and roles. Editors have restricted access to deletion and system settings.
          </p>
        </div>
      </div>

      <div className="bg-[#081B3A] border border-white/5 overflow-hidden">
        <table className="w-full text-left font-syncopate text-[10px] tracking-widest uppercase">
          <thead className="text-slate-500 border-b border-white/5">
            <tr>
              <th className="p-8 font-bold">OPERATIVE</th>
              <th className="p-8 font-bold">ROLE</th>
              <th className="p-8 font-bold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                      <User size={18} />
                    </div>
                    <span className="font-bold text-white text-sm">{user.username}</span>
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex items-center gap-3">
                    <Shield size={14} className={user.role === 'admin' ? 'text-[#FFC400]' : 'text-slate-500'} />
                    <span className={user.role === 'admin' ? 'text-[#FFC400]' : 'text-slate-400'}>{user.role}</span>
                  </div>
                </td>
                <td className="p-8 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => setEditingUser(user)} className="p-3 bg-white/5 text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={18} /></button>
                    <button className="p-3 bg-white/5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/10 w-full max-w-md relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter">
                {editingUser.id ? 'EDIT_USER' : 'CREATE_USER'}
              </h2>
              <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Username</label>
                <input 
                  type="text" 
                  value={editingUser.username}
                  onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Role</label>
                <select 
                  value={editingUser.role}
                  onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] appearance-none"
                >
                  <option value="editor">EDITOR</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Password</label>
                <input 
                  type="password" 
                  value={editingUser.password}
                  onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  placeholder={editingUser.id ? 'Leave blank to keep current' : 'Enter password'}
                  required={!editingUser.id}
                />
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                <button type="button" onClick={() => setEditingUser(null)} className="px-8 py-4 font-syncopate text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Cancel</button>
                <ArenaButton type="submit">SAVE_USER</ArenaButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
