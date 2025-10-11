import React from 'react';
import muvtrainerLogo from '@/assets/muvtrainer-logo.svg';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary opacity-95"></div>
        <div className="max-w-lg text-center text-secondary relative z-10 space-y-8">
          <div className="space-y-6">
            <img 
              src={muvtrainerLogo} 
              alt="MUVTRAINER Logo" 
            />
            <div>
            </div>
          </div>
          <blockquote className="text-lg text-secondary/80 leading-relaxed max-w-md mx-auto">
            "A plataforma que une ciência, performance e personalização para elevar o trabalho dos personal trainers digitais."
          </blockquote>
          <div className="flex items-center justify-center gap-2 text-secondary/70">
            <div className="h-px w-12 bg-secondary/30"></div>
            <span className="text-sm uppercase tracking-wider">Profissional • Científico • Evoluído</span>
            <div className="h-px w-12 bg-secondary/30"></div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}