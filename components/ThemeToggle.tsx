import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';


export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const next = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={next}
      aria-label="Toggle theme"
      className={
        theme === 'dark'
          ? 'bg-neutral-800 text-yellow-200 hover:bg-yellow-900'
          : theme === 'light'
            ? 'bg-amber-50 text-amber-800 hover:bg-yellow-100'
            : 'bg-gray-100 text-gray-800 hover:bg-amber-50'
      }
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}
