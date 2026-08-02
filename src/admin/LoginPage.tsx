
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, ShieldCheck, Chrome } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { GEEKAY_LOGO } from '../../constants';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      setError('FAILED TO AUTHENTICATE WITH COMMAND PROTOCOL.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#040E1E] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFC400]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <div className="mb-8 flex items-center justify-center">
            <img src={GEEKAY_LOGO} alt="Geekay Esports" className="h-16 w-auto" />
          </div>
          <h1 className="font-syncopate text-3xl font-black text-white tracking-tighter uppercase mb-4">
            COMMAND <span className="text-[#FFC400]">CENTER</span>
          </h1>
          <p className="text-slate-500 font-syncopate text-[10px] tracking-[0.4em] uppercase font-bold">
            Authorized Personnel Only
          </p>
        </div>

        <div className="bg-[#081B3A] border border-white/5 p-10 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
          
          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/50 p-4 text-red-500 text-[10px] font-syncopate font-bold tracking-widest uppercase text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="font-syncopate text-[8px] text-slate-500 font-bold tracking-[0.3em] uppercase">OPERATIVE_ID</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FFC400]" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#040E1E] border border-slate-800 py-6 pl-16 pr-6 text-white font-syncopate text-xs tracking-widest focus:outline-none focus:border-[#FFC400] transition-all"
                  placeholder="USERNAME..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-syncopate text-[8px] text-slate-500 font-bold tracking-[0.3em] uppercase">ACCESS_KEY</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FFC400]" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#040E1E] border border-slate-800 py-6 pl-16 pr-6 text-white font-syncopate text-xs tracking-widest focus:outline-none focus:border-[#FFC400] transition-all"
                  placeholder="PASSWORD..."
                  required
                />
              </div>
            </div>

            <ArenaButton 
              type="submit"
              className="w-full h-16 group"
              disabled={loading}
              icon={loading ? null : <ArrowRight className="group-hover:translate-x-2 transition-transform" />}
            >
              {loading ? 'AUTHENTICATING...' : 'INITIATE_LOGIN'}
            </ArenaButton>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[8px] font-syncopate font-bold uppercase tracking-widest">
                <span className="bg-[#081B3A] px-4 text-slate-600">Secure Alternate</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-16 border border-white/10 hover:border-[#FFC400]/50 hover:bg-[#FFC400]/5 transition-all flex items-center justify-center gap-4 group"
              disabled={loading}
            >
              <Chrome size={20} className="text-[#FFC400]" />
              <span className="font-syncopate text-[10px] font-black uppercase tracking-widest text-[#FFC400]">SIGN_IN_WITH_COMMANDER</span>
            </button>
          </form>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4 text-slate-600">
          <ShieldCheck size={16} />
          <span className="font-syncopate text-[8px] font-bold tracking-[0.3em] uppercase">Secure Session Protocol Active</span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
