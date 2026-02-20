import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', hover, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`glass rounded-2xl shadow-xl px-7 py-6 ${hover ? 'glass-hover cursor-pointer transition-all duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
