import { cn } from '@/lib/utils';

interface LoadingStateProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingState({
  className,
  size = 'md',
  text = 'Loading...',
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[200px]',
        className
      )}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-b-2 border-gray-900',
          sizeClasses[size]
        )}
      />
      {text && <div className="mt-4 text-gray-600">{text}</div>}
    </div>
  );
} 