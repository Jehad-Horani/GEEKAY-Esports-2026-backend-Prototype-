import React from 'react';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, subtitle, children }) => {
  return (
    <div className="space-y-4 pt-4 border-t border-white/10 first:border-t-0 first:pt-0">
      <div className="border-l-2 border-[#FFC400] pl-3 py-0.5">
        <h3 className="font-syncopate text-xs font-black text-white uppercase tracking-widest">{title}</h3>
        {subtitle && <p className="text-slate-400 text-[10px] font-inter mt-0.5">{subtitle}</p>}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
