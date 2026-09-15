import React from 'react';
import elsaLogoImg from '../assets/images/elsa_logo_icon_1789437654472.jpg';

interface ElsaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBorder?: boolean;
  withGlow?: boolean;
}

export const ElsaLogo: React.FC<ElsaLogoProps> = ({
  size = 'md',
  className = '',
  showBorder = true,
  withGlow = false,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 select-none ${
        sizeClasses[size]
      } ${showBorder ? 'ring-2 ring-cyan-400/50 shadow-md' : ''} ${
        withGlow ? 'shadow-[0_0_15px_rgba(6,182,212,0.4)]' : ''
      } ${className}`}
    >
      <img
        src={elsaLogoImg}
        alt="Elsa Laundry Services Logo"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center transform scale-105"
      />
    </div>
  );
};

export default ElsaLogo;
