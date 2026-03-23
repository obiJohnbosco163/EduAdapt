import logoImg from '@/assets/eduadapt-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { img: 'h-10 w-10', text: 'text-lg' },
    md: { img: 'h-12 w-12', text: 'text-xl' },
    lg: { img: 'h-16 w-16', text: 'text-3xl' }
  };

  const { img, text } = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <img src={logoImg} alt="EduAdapt" className={`${img} rounded-lg`} />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-bold ${text} text-foreground`}>
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
