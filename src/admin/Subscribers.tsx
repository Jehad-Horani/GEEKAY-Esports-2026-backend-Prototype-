import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Search, 
  Download, 
  Mail, 
  Calendar, 
  Tag, 
  Ban, 
  CheckCircle,
  Filter,
  X,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import * as XLSX from 'xlsx';

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubscribers(docs);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscriber? This action is irreversible.')) return;
    try {
      await deleteDoc(doc(db, 'subscribers', id));
    } catch (error) {
      alert('Failed to delete subscriber.');
    }
  };

  const toggleStatus = async (subscriber: any) => {
    const newStatus = subscriber.status === 'active' ? 'unsubscribed' : 'active';
    try {
      await updateDoc(doc(db, 'subscribers', subscriber.id), {
        status: newStatus
      });
    } catch (error) {
      alert('Failed to update status.');
    }
  };

  const exportToCSV = () => {
    const dataToExport = filteredSubscribers.map(sub => ({
      Email: sub.email,
      Status: sub.status.toUpperCase(),
      Source: sub.source || 'Direct',
      'Subscribed At': sub.subscribedAt?.toDate ? sub.subscribedAt.toDate().toLocaleString() : sub.subscribedAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscribers");
    XLSX.writeFile(workbook, `Geekay_Subscribers_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#FFC400] mx-auto mb-4" size={40} />
          <p className="font-syncopate text-[10px] text-slate-500 tracking-widest uppercase">Initializing Database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-12">
        <div className="bg-red-500/10 border border-red-500/20 p-12 max-w-2xl w-full text-center">
          <Ban className="text-red-500 mx-auto mb-6" size={48} />
          <h2 className="font-syncopate text-2xl font-black text-white mb-4 uppercase tracking-tighter">ACCESS_DENIED</h2>
          <p className="text-slate-400 font-syncopate text-[10px] tracking-widest leading-relaxed mb-8">
            {error.includes('Missing or insufficient permissions') 
              ? 'Your authorization level is insufficient for this directory. Please verify your credentials with the Command Center.'
              : error}
          </p>
          <ArenaButton onClick={() => window.location.reload()} className="bg-red-500 text-white border-none hover:bg-white hover:text-black">
            RETRY_AUTHENTICATION
          </ArenaButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-4 block uppercase">INTEL_GATHERING</span>
          <h1 className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">SUBSCRIBERS</h1>
        </div>
        <div className="flex gap-4">
          <ArenaButton onClick={exportToCSV} className="bg-white/5 border-white/10 text-white hover:bg-[#FFC400] hover:text-black">
            <Download size={18} className="mr-2" /> EXPORT_XLSX
          </ArenaButton>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Base', count: subscribers.length, icon: Mail, color: 'text-white' },
          { label: 'Active Personnel', count: subscribers.filter(s => s.status === 'active').length, icon: CheckCircle, color: 'text-[#FFC400]' },
          { label: 'Dormant/Withdrawn', count: subscribers.filter(s => s.status === 'unsubscribed').length, icon: Ban, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#081B3A] border border-white/5 p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-white/5 group-hover:bg-[#FFC400] transition-colors" />
            <stat.icon className={`${stat.color} mb-6 opacity-40`} size={24} />
            <p className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em] mb-2">{stat.label}</p>
            <h3 className="font-syncopate text-4xl font-black text-white">{stat.count}</h3>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-[#081B3A] border border-white/5 p-6 md:p-8 flex flex-col md:flex-row gap-6">
        <div className="flex-grow relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH OPERATIVE EMAIL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#040E1E] border border-slate-800 py-4 pl-16 pr-6 text-white font-syncopate text-xs tracking-widest focus:outline-none focus:border-[#FFC400] transition-all"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FFC400]" size={16} />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-[#040E1E] border border-slate-800 py-4 pl-14 pr-12 text-white font-syncopate text-[10px] tracking-widest focus:outline-none focus:border-[#FFC400] transition-all appearance-none uppercase font-bold"
            >
              <option value="all">ALL_STATUS</option>
              <option value="active">ACTIVE_ONLY</option>
              <option value="unsubscribed">UNSUBSCRIBED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#081B3A] border border-white/5 overflow-x-auto">
        <table className="w-full text-left font-syncopate text-[10px] tracking-widest uppercase min-w-[800px]">
          <thead className="text-slate-500 border-b border-white/5">
            <tr>
              <th className="p-8 font-bold">SUBSCRIBER</th>
              <th className="p-8 font-bold">SOURCE</th>
              <th className="p-8 font-bold">JOINED</th>
              <th className="p-8 font-bold">STATUS</th>
              <th className="p-8 font-bold text-right">OPERATIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredSubscribers.map((sub) => (
              <tr key={sub.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-none transform skew-x-[-10deg] flex items-center justify-center ${sub.status === 'active' ? 'bg-[#FFC400]/10 text-[#FFC400]' : 'bg-slate-800 text-slate-500'}`}>
                      <Mail size={18} className="transform skew-x-[10deg]" />
                    </div>
                    <span className="font-bold text-white text-sm lowercase">{sub.email}</span>
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Tag size={12} className="text-slate-600" />
                    <span>{sub.source || 'SYSTEM_DIRECT'}</span>
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={12} className="text-slate-600" />
                    <span>{formatDate(sub.subscribedAt)}</span>
                  </div>
                </td>
                <td className="p-8">
                  <button 
                    onClick={() => toggleStatus(sub)}
                    className={`px-3 py-1 border transition-all ${
                      sub.status === 'active' 
                        ? 'border-[#FFC400]/30 text-[#FFC400] hover:bg-[#FFC400] hover:text-black' 
                        : 'border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    {sub.status}
                  </button>
                </td>
                <td className="p-8 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => setSelectedSubscriber(sub)}
                      className="p-3 bg-white/5 text-slate-400 hover:text-[#FFC400] transition-colors"
                    >
                      <ShieldCheck size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(sub.id)}
                      className="p-3 bg-white/5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSubscribers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-20 text-center text-slate-600 font-syncopate text-[10px] tracking-[0.4em]">
                  NO SUBSCRIBERS FOUND IN DATABASE
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedSubscriber && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#081B3A] border border-white/10 w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter">SUBSCRIBER_INTEL</h2>
                <button onClick={() => setSelectedSubscriber(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="flex flex-col items-center text-center pb-8 border-b border-white/5">
                   <div className="w-20 h-20 bg-[#FFC400]/10 rounded-none transform skew-x-[-10deg] flex items-center justify-center text-[#FFC400] mb-6">
                      <Mail size={40} className="transform skew-x-[10deg]" />
                   </div>
                   <h3 className="text-white font-syncopate text-2xl font-bold lowercase mb-2">{selectedSubscriber.email}</h3>
                   <span className={`font-syncopate text-[8px] font-bold px-3 py-1 border ${selectedSubscriber.status === 'active' ? 'border-[#FFC400] text-[#FFC400]' : 'border-red-500 text-red-500'}`}>
                      {selectedSubscriber.status.toUpperCase()}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-slate-500 font-syncopate text-[8px] uppercase tracking-widest mb-2">Registration ID</p>
                    <p className="text-white font-syncopate text-[10px] break-all">{selectedSubscriber.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-syncopate text-[8px] uppercase tracking-widest mb-2">Enrollment Date</p>
                    <p className="text-white font-syncopate text-[10px]">{formatDate(selectedSubscriber.subscribedAt)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-syncopate text-[8px] uppercase tracking-widest mb-2">Source Origin</p>
                    <p className="text-white font-syncopate text-[10px]">{selectedSubscriber.source || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-syncopate text-[8px] uppercase tracking-widest mb-2">Protocol Verified</p>
                    <p className="text-[#FFC400] font-syncopate text-[10px]">TRUE</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
                  <ArenaButton onClick={() => toggleStatus(selectedSubscriber)} className="w-full h-14 bg-white/5 border-white/10 text-white hover:bg-white hover:text-black">
                    {selectedSubscriber.status === 'active' ? 'MARK_AS_UNSUBSCRIBED' : 'REACTIVATE_SUBSCRIBER'}
                  </ArenaButton>
                  <button 
                    onClick={() => {
                        handleDelete(selectedSubscriber.id);
                        setSelectedSubscriber(null);
                    }}
                    className="w-full h-14 font-syncopate text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                  >
                    DELETE_PERMANENTLY
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSubscribers;
