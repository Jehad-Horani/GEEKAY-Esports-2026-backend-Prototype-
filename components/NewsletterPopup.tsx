import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { db } from '../src/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError } from '../src/lib/firebase';

const NewsletterPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('newsletter_dismissed');
    if (isDismissed) return;

    // Trigger after 8 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 8000);

    // Trigger after 40% scroll
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 40) {
        setIsVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('newsletter_dismissed', 'true');
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Use email as ID to ensure uniqueness or at least identify easily
      // Firestore IDs can't contain certain characters, but email is mostly fine.
      // Replacing '.' with '_' to be safe or just use auto-id
      // We'll use auto-id but we could check for existing. 
      // Actually, create is fine with email as ID if we sanitize.
      const subscriberId = email.replace(/\./g, '_').replace(/@/g, '_at_');
      
      await setDoc(doc(db, 'subscribers', subscriberId), {
        email: email,
        subscribedAt: serverTimestamp(),
        status: 'active',
        source: window.location.pathname
      });

      setStatus('success');
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      console.error('Newsletter error:', error);
      setStatus('error');
      setErrorMessage('Submission failed. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#040E1E]/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#081B3A] border-2 border-[#FFC400]/30 p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Accent Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-[#FFC400]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#FFC400]">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="font-syncopate text-2xl font-black text-white mb-2 uppercase tracking-tight">YOU'RE SUBSCRIBED</h3>
                <p className="text-slate-400 font-inter">Welcome to the elite roster of the GEEKAY inner circle.</p>
              </motion.div>
            ) : (
              <>
                <div className="mb-10">
                  <span className="font-syncopate text-[10px] text-[#FFC400] font-bold tracking-[0.4em] uppercase block mb-4">Elite Access</span>
                  <h2 className="font-syncopate text-3xl font-black text-white mb-4 leading-none uppercase tracking-tighter">
                    STAY IN <span className="text-[#FFC400]">THE LOOP</span>
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed font-inter">
                    Get the latest Geekay Esports news, roster updates, tournament announcements, and media drops delivered straight to your terminal.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ENTER YOUR EMAIL..."
                        className={`w-full bg-[#040E1E] border ${status === 'error' ? 'border-red-500' : 'border-slate-800 focus:border-[#FFC400]'} py-5 pl-14 pr-6 text-white font-syncopate text-xs tracking-widest focus:outline-none transition-all placeholder:text-slate-700`}
                        required
                        disabled={status === 'loading'}
                      />
                    </div>
                    {status === 'error' && (
                      <p className="text-red-500 text-[10px] font-syncopate font-bold uppercase tracking-widest mt-2">{errorMessage}</p>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full h-14 bg-[#FFC400] text-black font-syncopate text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        SUBSCRIBE
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-slate-700 text-[8px] font-syncopate font-bold uppercase tracking-[0.2em]">
                  By subscribing, you agree to our combat protocols and privacy terms.
                </p>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewsletterPopup;
