import { BookOpen, Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' }
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="rounded-xl bg-primary p-2 shadow-lg">
          <BookOpen className="text-primary-foreground" size={icon} />
        </div>
        <Sparkles 
          className="absolute -top-1 -right-1 text-accent animate-pulse-soft" 
          size={icon / 2} 
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-bold ${text} text-primary`}>
            EduAdapt
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-muted-foreground -mt-1">
              Learn at your pace
            </span>
          )}
        </div>
      )}
    </div>
  );
}