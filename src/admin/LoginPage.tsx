import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ShieldCheck, Key, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import { GEEKAY_LOGO } from '../../constants';

const MAX_ALLOWED_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 60; // 60-second protection lockout period

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingCooldown, setRemainingCooldown] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);
  const navigate = useNavigate();

  // Load persistent lock state & failed count on initial render
  useEffect(() => {
    try {
      const storedLockUntil = localStorage.getItem('geekay_login_locked_until');
      if (storedLockUntil) {
        const lockUntilTime = parseInt(storedLockUntil, 10);
        const now = Date.now();
        if (lockUntilTime > now) {
          const diffSec = Math.ceil((lockUntilTime - now) / 1000);
          setRemainingCooldown(diffSec);
        } else {
          localStorage.removeItem('geekay_login_locked_until');
          localStorage.removeItem('geekay_login_failed_attempts');
        }
      }

      const storedAttempts = localStorage.getItem('geekay_login_failed_attempts');
      if (storedAttempts) {
        const count = parseInt(storedAttempts, 10) || 0;
        setFailedCount(count);
      }
    } catch {}
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (remainingCooldown <= 0) return;

    const timer = setInterval(() => {
      setRemainingCooldown((prev) => {
        if (prev <= 1) {
          try {
            localStorage.removeItem('geekay_login_locked_until');
            localStorage.removeItem('geekay_login_failed_attempts');
          } catch {}
          setFailedCount(0);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingCooldown]);

  const triggerLockout = (seconds = LOCKOUT_SECONDS) => {
    const lockUntil = Date.now() + seconds * 1000;
    try {
      localStorage.setItem('geekay_login_locked_until', String(lockUntil));
      localStorage.setItem('geekay_login_failed_attempts', String(MAX_ALLOWED_ATTEMPTS));
    } catch {}
    setFailedCount(MAX_ALLOWED_ATTEMPTS);
    setRemainingCooldown(seconds);
    setError(`Security protection active: 3 failed attempts reached. System locked for ${seconds} seconds.`);
  };

  const registerFailedAttempt = (serverRemainingSecs?: number) => {
    if (serverRemainingSecs && serverRemainingSecs > 0) {
      triggerLockout(serverRemainingSecs);
      return;
    }

    let storedAttempts = 0;
    try {
      storedAttempts = parseInt(localStorage.getItem('geekay_login_failed_attempts') || '0', 10) || 0;
    } catch {}

    const nextCount = Math.max(storedAttempts, failedCount) + 1;
    setFailedCount(nextCount);

    if (nextCount >= MAX_ALLOWED_ATTEMPTS) {
      triggerLockout(LOCKOUT_SECONDS);
    } else {
      try {
        localStorage.setItem('geekay_login_failed_attempts', String(nextCount));
      } catch {}
      const attemptsRemaining = MAX_ALLOWED_ATTEMPTS - nextCount;
      setError(`Invalid credentials. (${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining before security lockout)`);
    }
  };

  const registerSuccess = () => {
    try {
      localStorage.removeItem('geekay_login_locked_until');
      localStorage.removeItem('geekay_login_failed_attempts');
    } catch {}
    setFailedCount(0);
    setRemainingCooldown(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingCooldown > 0) return;
    if (!username.trim() || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          rememberMe
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429 || data.locked) {
        const secs = data.remainingSeconds || LOCKOUT_SECONDS;
        triggerLockout(secs);
      } else if (!res.ok || !data.user) {
        registerFailedAttempt(data.remainingSeconds);
      } else {
        // Success
        registerSuccess();
        if (data.token) {
          localStorage.setItem('geekay_token', data.token);
        }
        localStorage.setItem('geekay_user', JSON.stringify(data.user));
        navigate('/admin');
      }
    } catch (err) {
      registerFailedAttempt();
    } finally {
      setLoading(false);
    }
  };

  const isLocked = remainingCooldown > 0;

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
        <div className="text-center mb-8">
          <div className="mb-6 flex items-center justify-center">
            <img src={GEEKAY_LOGO} alt="Geekay Esports" className="h-16 w-auto drop-shadow-[0_0_20px_rgba(255,196,0,0.2)]" />
          </div>
          <h1 className="font-syncopate text-2xl md:text-3xl font-black text-white tracking-tighter uppercase mb-2">
            COMMAND <span className="text-[#FFC400]">CENTER</span>
          </h1>
          <p className="text-slate-500 font-syncopate text-[9px] tracking-[0.4em] uppercase font-bold">
            Authorized Personnel Access
          </p>
        </div>

        <div className="bg-[#081B3A] border border-white/10 p-8 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden rounded-sm">
          <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors duration-300 ${isLocked ? 'bg-red-500 animate-pulse' : 'bg-[#FFC400]'}`} />

          {/* Security Lockout Banner */}
          {isLocked && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-red-950/80 border-2 border-red-500/80 p-5 rounded text-center shadow-lg"
            >
              <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                <ShieldAlert size={22} className="animate-bounce text-red-500" />
                <span className="font-syncopate text-xs font-black tracking-widest uppercase text-red-400">
                  SECURITY LOCKOUT ACTIVE
                </span>
              </div>
              <p className="text-slate-300 text-xs font-sans mb-3">
                3 failed attempts reached. System access temporarily locked for protection.
              </p>
              <div className="inline-flex items-center gap-2.5 bg-red-900/70 border border-red-500/50 px-5 py-2.5 rounded-sm">
                <Clock size={16} className="text-red-400 animate-spin" />
                <span className="font-mono text-lg font-black text-white tracking-widest">
                  {Math.floor(remainingCooldown / 60)}:{String(remainingCooldown % 60).padStart(2, '0')}
                </span>
                <span className="font-syncopate text-[8px] text-red-300 font-bold uppercase tracking-widest">
                  COOLDOWN
                </span>
              </div>
            </motion.div>
          )}

          {/* Standard Error Notice */}
          {error && !isLocked && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-500/10 border border-red-500/40 p-4 text-red-400 text-[10px] font-syncopate font-bold tracking-widest uppercase text-center rounded-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Attempt indicator badges */}
          {!isLocked && failedCount > 0 && (
            <div className="mb-6 flex items-center justify-between bg-amber-500/10 border border-amber-500/20 py-2.5 px-4 rounded-sm">
              <span className="font-syncopate text-[9px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <AlertTriangle size={14} /> FAILED ATTEMPTS: {failedCount}/{MAX_ALLOWED_ATTEMPTS}
              </span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((num) => (
                  <span
                    key={num}
                    className={`w-3 h-3 rounded-full transition-all ${num <= failedCount ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-white/20'}`}
                  />
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="font-syncopate text-[8px] text-slate-400 font-bold tracking-[0.3em] uppercase block">
                OPERATIVE ID / USERNAME
              </label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FFC400]" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLocked || loading}
                  className="w-full bg-[#040E1E] border border-slate-800 py-4 pl-14 pr-5 text-white font-syncopate text-xs tracking-widest focus:outline-none focus:border-[#FFC400] transition-all disabled:opacity-40 disabled:cursor-not-allowed rounded-sm"
                  placeholder="ENTER USERNAME..."
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-syncopate text-[8px] text-slate-400 font-bold tracking-[0.3em] uppercase block">
                SECURITY ACCESS KEY
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FFC400]" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked || loading}
                  className="w-full bg-[#040E1E] border border-slate-800 py-4 pl-14 pr-5 text-white font-syncopate text-xs tracking-widest focus:outline-none focus:border-[#FFC400] transition-all disabled:opacity-40 disabled:cursor-not-allowed rounded-sm"
                  placeholder="ENTER ACCESS KEY..."
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white transition-colors">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLocked}
                  className="accent-[#FFC400] rounded"
                />
                <span className="font-syncopate text-[8px] font-bold tracking-widest uppercase">REMEMBER ME (30 DAYS)</span>
              </label>
            </div>

            <ArenaButton 
              type="submit"
              className="w-full h-14 group mt-2"
              disabled={loading || !username.trim() || !password || isLocked}
              icon={loading ? null : <Key className="group-hover:rotate-12 transition-transform" />}
            >
              {isLocked ? `LOCKED (${remainingCooldown}s)` : loading ? 'AUTHENTICATING...' : 'INITIATE_SESSION'}
            </ArenaButton>
          </form>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-slate-500">
          <ShieldCheck size={16} className="text-[#FFC400]" />
          <span className="font-syncopate text-[8px] font-bold tracking-[0.3em] uppercase">Brute-Force Protection Active</span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
