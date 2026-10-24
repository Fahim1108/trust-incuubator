import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const controlBase =
  "w-full rounded-control border bg-surface px-3.5 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-ink/[0.03] disabled:text-ink-muted";

interface FieldShellProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  id: string;
  children: ReactNode;
  className?: string;
}

export function FieldShell({ label, error, hint, required, id, children, className }: FieldShellProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-primary" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, leftIcon, className, wrapperClassName, id, required, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} id={inputId} className={wrapperClassName}>
      <div className="relative">
        {leftIcon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(controlBase, "h-11", leftIcon ? "pl-10" : undefined, error ? "border-danger" : "border-line", className)}
          {...props}
        />
      </div>
    </FieldShell>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, error, hint, placeholder, options, className, wrapperClassName, id, required, ...props }, ref) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} id={selectId} className={wrapperClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={cn(controlBase, "h-11 appearance-none pr-10", error ? "border-danger" : "border-line", className)}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
      </div>
    </FieldShell>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, error, hint, className, wrapperClassName, id, required, ...props }, ref) {
  const autoId = useId();
  const areaId = id ?? autoId;
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} id={areaId} className={wrapperClassName}>
      <textarea
        ref={ref}
        id={areaId}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn(controlBase, "min-h-[110px] py-3", error ? "border-danger" : "border-line", className)}
        {...props}
      />
    </FieldShell>
  );
});

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  description?: string;
}

export function Checkbox({ label, description, className, id, ...props }: CheckboxProps) {
  const autoId = useId();
  const boxId = id ?? autoId;
  return (
    <label htmlFor={boxId} className={cn("flex cursor-pointer items-start gap-3 text-sm text-ink", className)}>
      <input id={boxId} type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-line accent-[rgb(var(--aa-primary))]" {...props} />
      <span>
        {label}
        {description && <span className="mt-0.5 block text-xs text-ink-muted">{description}</span>}
      </span>
    </label>
  );
}
