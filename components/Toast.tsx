import { Toaster } from 'sonner';

export function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #e5e7eb',
        },
        className: 'toast',
        duration: 5000,
      }}
    />
  );
} 