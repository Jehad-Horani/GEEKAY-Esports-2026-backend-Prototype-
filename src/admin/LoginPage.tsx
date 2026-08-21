
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, ShieldCheck, ArrowLeft, Key, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import { GEEKAY_LOGO } from '../../constants';

const MAX_ALLOWED_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 60; // 60 seconds lockout period

const LoginPage = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [verifiedUsername, setVerifiedUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingCooldown, setRemainingCooldown] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);
  const navigate = useNavigate();

  // Load persistent lock state on mount
  useEffect(() => {
    try {
      const storedLockUntil = localStorage.getItem('geekay_login_locked_until');
      if (storedLockUntil) {
        const lockUntilTime = parseInt(storedLockUntil, 10);
        const now = Date.now();
        if (lockUntilTime > now) {
          setRemainingCooldown(Math.ceil((lockUntilTime - now) / 1000));
        } else {
          localStorage.removeItem('geekay_login_locked_until');
          localStorage.removeItem('geekay_login_failed_attempts');
        }
      }

      const storedAttempts = localStorage.getItem('geekay_login_failed_attempts');
      if (storedAttempts) {
        setFailedCount(parseInt(storedAttempts, 10) || 0);
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

  const handleFailAttempt = (serverSeconds?: number) => {
    const nextCount = failedCount + 1;
    setFailedCount(nextCount);

    if (nextCount >= MAX_ALLOWED_ATTEMPTS || serverSeconds) {
      const lockSeconds = serverSeconds || LOCKOUT_SECONDS;
      const lockUntil = Date.now() + lockSeconds * 1000;
      try {
        localStorage.setItem('geekay_login_locked_until', String(lockUntil));
        localStorage.setItem('geekay_login_failed_attempts', String(nextCount));
      } catch {}
      setRemainingCooldown(lockSeconds);
      setError(`Security lockout: 3 failed attempts reached. Please wait ${lockSeconds}s.`);
    } else {
      try {
        localStorage.setItem('geekay_login_failed_attempts', String(nextCount));
      } catch {}
      const left = MAX_ALLOWED_ATTEMPTS - nextCount;
      setError(`Invalid credentials. (${left} attempt${left === 1 ? '' : 's'} remaining before lockout)`);
    }
  };

  const handleSuccess = () => {
    try {
      localStorage.removeItem('geekay_login_locked_until');
      localStorage.removeItem('geekay_login_failed_attempts');
    } catch {}
    setFailedCount(0);
    setRemainingCooldown(0);
  };

  // Step 1: Verify Username / Email
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingCooldown > 0) return;
    if (!identifier.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();

      if (res.status === 429 || data.locked) {
        const secs = data.remainingSeconds || LOCKOUT_SECONDS;
        setRemainingCooldown(secs);
        setError(data.error || `Security lockout active. Please wait ${secs}s.`);
      } else if (!res.ok || !data.success) {
        handleFailAttempt(data.remainingSeconds);
      } else {
        setVerifiedUsername(data.username);
        setError('');
        setStep(2);
      }
    } catch (err) {
      handleFailAttempt();
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Authenticate Password
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingCooldown > 0) return;
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: verifiedUsername,
          password,
          rememberMe
        }),
      });

      const data = await res.json();

      if (res.status === 429 || data.locked) {
        const secs = data.remainingSeconds || LOCKOUT_SECONDS;
        setRemainingCooldown(secs);
        setError(data.error || `Security lockout active. Please wait ${secs}s.`);
      } else if (!res.ok || !data.user) {
        handleFailAttempt(data.remainingSeconds);
      } else {
        // Logged in successfully
        handleSuccess();
        if (data.token) {
          localStorage.setItem('geekay_token', data.token);
        }
        localStorage.setItem('geekay_user', JSON.stringify(data.user));
        navigate('/admin');
      }
    } catch (err) {
      handleFailAttempt();
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    if (remainingCooldown > 0) return;
    setStep(1);
    setPassword('');
    setError('');
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
        <div className="text-center mb-10">
          <div className="mb-8 flex items-center justify-center">
            <img src={GEEKAY_LOGO} alt="Geekay Esports" className="h-16 w-auto" />
          </div>
          <h1 className="font-syncopate text-3xl font-black text-white tracking-tighter uppercase mb-2">
            COMMAND <span className="text-[#FFC400]">CENTER</span>
          </h1>
          <p className="text-slate-500 font-syncopate text-[10px] tracking-[0.4em] uppercase font-bold">
            Authorized Personnel Only
          </p>
        </div>

        <div className="bg-[#081B3A] border border-white/5 p-8 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 ${isLocked ? 'bg-red-500 animate-pulse' : 'bg-[#FFC400]'}`} />
          
          {/* Step indicator */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full text-[10px] font-syncopate font-bold flex items-center justify-center ${step === 1 ? 'bg-[#FFC400] text-black' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'}`}>
                {step === 1 ? '1' : <CheckCircle2 size={14} />}
              </span>
              <span className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                OPERATIVE ID
              </span>
            </div>

            <div className="w-8 h-[1px] bg-slate-800" />

            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full text-[10px] font-syncopate font-bold flex items-center justify-center ${step === 2 ? 'bg-[#FFC400] text-black' : 'bg-slate-800 text-slate-500'}`}>
                2
              </span>
              <span className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                ACCESS KEY
              </span>
            </div>
          </div>

          {/* Lockout Banner */}
          {isLocked && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-red-500/15 border-2 border-red-500/60 p-5 rounded-sm text-center"
            >
              <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                <AlertTriangle size={18} className="animate-bounce" />
                <span className="font-syncopate text-[10px] font-black tracking-widest uppercase">
                  SECURITY LOCKOUT ACTIVE
                </span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans mb-3">
                3 failed attempts reached. System temporarily locked for protection.
              </p>
              <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-500/30 px-4 py-2 rounded">
                <Clock size={15} className="text-red-400 animate-spin" />
                <span className="font-mono text-base font-black text-white">
                  {Math.floor(remainingCooldown / 60)}:{String(remainingCooldown % 60).padStart(2, '0')}
                </span>
                <span className="font-syncopate text-[8px] text-red-300 font-bold uppercase tracking-widest">
                  REMAINING
                </span>
              </div>
            </motion.div>
          )}

          {/* Standard error notice */}
          {error && !isLocked && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-red-500/10 border border-red-500/50 p-4 text-red-500 text-[10px] font-syncopate font-bold tracking-widest uppercase text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Attempt dots indicator */}
          {!isLocked && failedCount > 0 && (
            <div className="mb-6 flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/20 py-2 px-3 rounded">
              <span className="font-syncopate text-[8px] font-bold uppercase tracking-widest text-amber-400">
                FAILED ATTEMPTS: {failedCount}/{MAX_ALLOWED_ATTEMPTS}
              </span>
              <div className="flex gap-1.5 ml-2">
                {[1, 2, 3].map((num) => (
                  <span
                    key={num}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${num <= failedCount ? 'bg-red-500' : 'bg-white/20'}`}
                  />
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleStep1Submit} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-400 font-bold tracking-[0.3em] uppercase block">
                    STEP 1: USERNAME OR EMAIL
                  </label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FFC400]" size={18} />
                    <input 
                      type="text" 
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      disabled={isLocked || loading}
                      className="w-full bg-[#040E1E] border border-slate-800 py-5 pl-16 pr-6 text-white font-syncopate text-xs tracking-widest focus:outline-none focus:border-[#FFC400] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="ENTER OPERATIVE ID..."
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <ArenaButton 
                  type="submit"
                  className="w-full h-14 group"
                  disabled={loading || !identifier.trim() || isLocked}
                  icon={loading ? null : <ArrowRight className="group-hover:translate-x-2 transition-transform" />}
                >
                  {isLocked ? `LOCKED (${remainingCooldown}s)` : loading ? 'VERIFYING OPERATIVE...' : 'CONTINUE_TO_KEY'}
                </ArenaButton>
              </motion.form>
            ) : (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleStep2Submit} 
                className="space-y-6"
              >
                <div className="bg-[#040E1E] p-4 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-syncopate text-[7px] text-slate-500 font-bold uppercase tracking-widest block">OPERATIVE CONFIRMED</span>
                    <span className="font-syncopate text-xs font-bold text-white tracking-wider">{verifiedUsername}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleBackToStep1}
                    disabled={isLocked}
                    className="text-slate-400 hover:text-[#FFC400] text-[9px] font-syncopate font-bold uppercase tracking-widest flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft size={12} /> CHANGE
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-400 font-bold tracking-[0.3em] uppercase block">
                    STEP 2: ACCESS KEY
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FFC400]" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLocked || loading}
                      className="w-full bg-[#040E1E] border border-slate-800 py-5 pl-16 pr-6 text-white font-syncopate text-xs tracking-widest focus:outline-none focus:border-[#FFC400] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="ENTER ACCESS KEY..."
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white transition-colors">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLocked}
                      className="accent-[#FFC400] rounded"
                    />
                    <span className="font-syncopate text-[8px] font-bold tracking-widest uppercase">EXTEND SESSION (30 DAYS)</span>
                  </label>
                </div>

                <ArenaButton 
                  type="submit"
                  className="w-full h-14 group"
                  disabled={loading || !password || isLocked}
                  icon={loading ? null : <Key className="group-hover:rotate-12 transition-transform" />}
                >
                  {isLocked ? `LOCKED (${remainingCooldown}s)` : loading ? 'AUTHENTICATING...' : 'INITIATE_SESSION'}
                </ArenaButton>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-slate-600">
          <ShieldCheck size={16} />
          <span className="font-syncopate text-[8px] font-bold tracking-[0.3em] uppercase">Encrypted Session Protocol Active</span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
