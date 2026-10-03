import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { controlClasses, type InputProps } from '../../../components/ui/Input';

/** Password field with a show/hide toggle (helps users on small touch keyboards). */
export function PasswordInput({ className, ...props }: Omit<InputProps, 'type' | 'leadingIcon'>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        className={cn(controlClasses, 'h-10 pr-11 pl-3', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => {
          setVisible((v) => !v);
        }}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-slate-500 hover:text-slate-800"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
