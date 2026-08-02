
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Filter, X, Eye } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';

const AdminJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const method = editingJob.id ? 'PUT' : 'POST';
      const url = editingJob.id ? `/api/jobs/${editingJob.id}` : '/api/jobs';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingJob),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save job');
      }
      
      setEditingJob(null);
      fetchJobs();
    } catch (err: any) {
      console.error('Save job error:', err);
      if (err.name === 'AbortError') {
        alert('Request timed out. The server might be busy.');
      } else {
        alert(err.message);
      }
    } finally {
      setSaving(false);
      clearTimeout(timeoutId);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete job opening?')) return;
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    fetchJobs();
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || job.department.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === 'ALL' || job.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const departments = ['ALL', ...new Set(jobs.map(j => j.department))];

  if (loading) return <div>Loading jobs...</div>;

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-4 block uppercase">RECRUITMENT_CONTROL</span>
          <h1 className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">JOB OPENINGS</h1>
        </div>
        <ArenaButton onClick={() => setEditingJob({ title: '', slug: '', department: '', work_type: 'Remote', location: '', summary: '', responsibilities: [], requirements: [], nice_to_have: [], benefits: [], email: 'careers@geekay.com', display_order: 0, published: 0 })}>
          <Plus size={18} className="mr-2" /> CREATE_JOB
        </ArenaButton>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-grow">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH_BY_TITLE_OR_UNIT..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#081B3A] border border-white/5 py-6 pl-16 pr-6 text-white font-syncopate text-[10px] tracking-widest focus:outline-none focus:border-[#FFC400]"
          />
        </div>
        <div className="relative min-w-[250px]">
          <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select 
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="w-full bg-[#081B3A] border border-white/5 py-6 pl-16 pr-6 text-white font-syncopate text-[10px] tracking-widest focus:outline-none focus:border-[#FFC400] appearance-none"
          >
            {departments.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-[#081B3A] border border-white/5 overflow-hidden">
        <table className="w-full text-left font-syncopate text-[10px] tracking-widest uppercase">
          <thead className="text-slate-500 border-b border-white/5">
            <tr>
              <th className="p-8 font-bold">POSITION</th>
              <th className="p-8 font-bold">DEPARTMENT</th>
              <th className="p-8 font-bold">TYPE</th>
              <th className="p-8 font-bold text-center">STATUS</th>
              <th className="p-8 font-bold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredJobs.map((job) => (
              <tr key={job.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="p-8">
                  <p className="font-bold text-white text-sm mb-1">{job.title}</p>
                  <p className="text-[8px] text-slate-500">{job.slug}</p>
                </td>
                <td className="p-8 text-slate-400">{job.department}</td>
                <td className="p-8">
                  <span className="px-3 py-1 border border-slate-800 rounded-full text-slate-500">{job.work_type}</span>
                </td>
                <td className="p-8 text-center">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black ${job.published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {job.published ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </td>
                <td className="p-8 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <a href={`/careers/${job.slug}`} target="_blank" className="p-3 bg-white/5 text-slate-400 hover:text-[#FFC400] transition-colors"><Eye size={18} /></a>
                    <button onClick={() => setEditingJob(job)} className="p-3 bg-white/5 text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(job.id)} className="p-3 bg-white/5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingJob(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/10 w-full max-w-4xl max-h-[90vh] relative z-10 overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
              <h2 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter">
                {editingJob.id ? 'EDIT_JOB_OPENING' : 'CREATE_JOB_OPENING'}
              </h2>
              <button onClick={() => setEditingJob(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Job Title</label>
                  <input 
                    type="text" 
                    value={editingJob.title}
                    onChange={e => setEditingJob({...editingJob, title: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">URL Slug</label>
                  <input 
                    type="text" 
                    value={editingJob.slug}
                    onChange={e => setEditingJob({...editingJob, slug: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Department</label>
                  <input 
                    type="text" 
                    value={editingJob.department}
                    onChange={e => setEditingJob({...editingJob, department: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Work Type</label>
                  <select 
                    value={editingJob.work_type}
                    onChange={e => setEditingJob({...editingJob, work_type: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] appearance-none"
                  >
                    <option value="Remote">REMOTE</option>
                    <option value="On-site">ON-SITE</option>
                    <option value="Hybrid">HYBRID</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Location</label>
                  <input 
                    type="text" 
                    value={editingJob.location}
                    onChange={e => setEditingJob({...editingJob, location: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Summary</label>
                <textarea 
                  value={editingJob.summary}
                  onChange={e => setEditingJob({...editingJob, summary: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] h-24 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Application Email</label>
                <input 
                  type="email" 
                  value={editingJob.email}
                  onChange={e => setEditingJob({...editingJob, email: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div className="flex items-center gap-8 pt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={editingJob.published === 1}
                    onChange={e => setEditingJob({...editingJob, published: e.target.checked ? 1 : 0})}
                    className="w-5 h-5 bg-[#040E1E] border-slate-800 rounded-none checked:bg-[#FFC400] transition-colors"
                  />
                  <span className="font-syncopate text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-[#FFC400]">Published</span>
                </label>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                <button type="button" onClick={() => setEditingJob(null)} className="px-8 py-4 font-syncopate text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Cancel</button>
                <ArenaButton type="submit" disabled={saving}>
                  {saving ? 'SAVING...' : 'SAVE_JOB_OPENING'}
                </ArenaButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
