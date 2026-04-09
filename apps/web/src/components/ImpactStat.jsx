import React from 'react';

const ImpactStat = ({ number, label, icon: Icon }) => {
  return (
    <div className="flex flex-col items-center text-center p-8 reveal">
      {Icon && (
        <div className="mb-5 text-[var(--gold)]">
          <Icon size={32} strokeWidth={1.2} />
        </div>
      )}
      <span className="font-serif text-5xl md:text-6xl text-[var(--ink)] mb-3 leading-none tracking-tight">
        {number}
      </span>
      <span className="text-[10px] tracking-[0.18em] uppercase text-[var(--ink-4)] font-medium">
        {label}
      </span>
    </div>
  );
};

export default ImpactStat;