
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Mail, Phone, MapPin } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta from '../components/SEOMeta';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-800 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left hover:text-yellow-500 transition-colors"
      >
        <span className="font-syncopate text-sm font-bold tracking-wide uppercase">{question}</span>
        {isOpen ? <Minus size={20} className="text-yellow-500" /> : <Plus size={20} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-6 text-slate-400 leading-relaxed text-sm">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Information = () => {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <SEOMeta 
        title="Resources & FAQ - Geekay Esports"
        description="Access official Geekay Esports resources, contact information, frequently asked questions, and office locations in Riyadh."
        ogType="website"
      />
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs />
        <header className="mb-24">
           <span className="font-syncopate text-yellow-500 text-[10px] tracking-widest font-bold mb-4 block uppercase">INTEL</span>
           <h1 className="font-syncopate text-5xl md:text-7xl font-bold uppercase">Resources & FAQ</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          {/* FAQ SECTION */}
          <div className="lg:col-span-2 space-y-4">
             <h2 className="font-syncopate text-xl font-bold mb-12 uppercase tracking-tight">Frequently Asked</h2>
             <FAQItem 
                question="What is Geekay Esports?" 
                answer="Geekay Esports is a leading esports organization operating across the MENA region, competing in multiple global titles and representing top-tier talent." 
             />
             <FAQItem 
                question="How can I follow Geekay teams and matches?" 
                answer="You can track all matches and schedules through the Schedule page and follow updates via our social media channels." 
             />
             <FAQItem 
                question="How can I join Geekay Esports?" 
                answer="Visit the Careers page to explore current opportunities and apply for open positions." 
             />
             <FAQItem 
                question="Where can I find Geekay merchandise?" 
                answer="You can access the official Geekay store via the Shop section and choose your region (UAE, KSA, Global)." 
             />
             <FAQItem 
                question="How can I contact Geekay?" 
                answer="Use the official emails listed below depending on your request." 
             />
          </div>

          {/* CONTACT & SUPPORT SECTION */}
          <div className="space-y-12">
             <div className="bg-slate-900 border border-slate-800 p-10">
                <h3 className="font-syncopate text-sm font-bold mb-8 uppercase text-yellow-500 tracking-widest">Business & Support</h3>
                <div className="space-y-8">
                   <div>
                      <span className="text-[10px] font-syncopate text-slate-500 block uppercase mb-2">General Inquiries</span>
                      <a href="mailto:inquiries@geekay.com" className="font-bold text-sm hover:text-yellow-500 transition-colors">inquiries@geekay.com</a>
                   </div>
                   <div>
                      <span className="text-[10px] font-syncopate text-slate-500 block uppercase mb-2">Partnerships and Business</span>
                      <a href="mailto:business@geekay.com" className="font-bold text-sm hover:text-yellow-500 transition-colors">business@geekay.com</a>
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed pt-4 border-t border-slate-800">
                     For general questions, media, or collaborations, reach out via the appropriate email above.
                   </p>
                </div>
             </div>

             {/* OFFICE LOCATIONS */}
             <div className="space-y-8">
                <h3 className="font-syncopate text-sm font-bold uppercase tracking-widest px-2 border-l-2 border-yellow-500">Global Presence</h3>
                
                <div className="bg-slate-950 border border-slate-900 p-8">
                   <span className="font-syncopate text-[10px] text-yellow-500 font-bold block mb-4">RIYADH (PRIMARY)</span>
                   <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                     Al Nemer Center, 2nd Tower, 3rd Floor, Office 312<br />
                     P.O. Box 12214, Riyadh
                   </p>
                   <div className="space-y-2">
                      <a href="tel:+966540974261" className="text-xs font-bold block hover:text-yellow-500">+966 54 097 4261</a>
                      <a href="mailto:esports@geekaygroupmea.com" className="text-xs text-slate-500 hover:text-yellow-500">esports@geekaygroupmea.com</a>
                   </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-8">
                   <span className="font-syncopate text-[10px] text-yellow-500 font-bold block mb-4">UAE</span>
                   <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                     1 19D Street, Al Aweer, Industrial Area First, Ras Al Khor<br />
                     P.O. Box 2589, Dubai
                   </p>
                   <div className="space-y-2">
                      <a href="tel:+971525059709" className="text-xs font-bold block hover:text-yellow-500">+971 52 505 9709</a>
                      <a href="mailto:esports@geekaygroupmea.com" className="text-xs text-slate-500 hover:text-yellow-500">esports@geekaygroupmea.com</a>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Information;
