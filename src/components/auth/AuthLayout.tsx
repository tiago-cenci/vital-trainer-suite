import React from 'react';
import heroFitness from '@/assets/hero-fitness.jpg';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-md text-center text-white relative z-10">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">VitalTrainer</h1>
            <p className="text-xl text-white/80">Potencialize seus resultados</p>
          </div>
          <blockquote className="text-lg text-white/90 italic">
            "A plataforma completa para personal trainers que querem elevar seus atendimentos ao próximo nível."
          </blockquote>
        </div>
        <img
          src={heroFitness}
          alt="Personal trainer working with client"
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
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