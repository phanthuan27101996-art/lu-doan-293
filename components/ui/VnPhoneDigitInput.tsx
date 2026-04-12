import React, { useId, useRef } from 'react';
import { cn } from '@/lib/utils';
import { VN_PHONE_DIGIT_SLOTS } from '@/lib/phone-auth';

export interface VnPhoneDigitInputProps {
  value: string;
  onChange: (digitsOnly: string) => void;
  disabled?: boolean;
  error?: string;
  label: string;
  id?: string;
  hint?: string;
}

/**
 * SĐT Việt Nam 10 số: 10 ô trên một hàng, gọn.
 */
export const VnPhoneDigitInput: React.FC<VnPhoneDigitInputProps> = ({
  value,
  onChange,
  disabled,
  error,
  label,
  id,
  hint,
}) => {
  const reactId = useId();
  const legendId = id ?? `${reactId}-phone-legend`;
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.replace(/\D/g, '').slice(0, VN_PHONE_DIGIT_SLOTS);

  const commit = (next: string) => {
    onChange(next.replace(/\D/g, '').slice(0, VN_PHONE_DIGIT_SLOTS));
  };

  const focusAt = (i: number) => {
    const idx = Math.max(0, Math.min(VN_PHONE_DIGIT_SLOTS - 1, i));
    const el = inputsRef.current[idx];
    el?.focus();
    requestAnimationFrame(() => el?.select());
  };

  const handleChange = (index: number, raw: string) => {
    const d = raw.replace(/\D/g, '');
    if (!d) {
      commit(digits.slice(0, index) + digits.slice(index + 1));
      return;
    }
    const ch = d.slice(-1);
    const merged = (digits.slice(0, index) + ch + digits.slice(index + 1)).slice(0, VN_PHONE_DIGIT_SLOTS);
    commit(merged);
    focusAt(index + 1);
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]) {
        commit(digits.slice(0, index) + digits.slice(index + 1));
      } else if (index > 0) {
        commit(digits.slice(0, index - 1) + digits.slice(index));
        focusAt(index - 1);
      }
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const onPaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const extracted = text.replace(/\D/g, '').slice(0, VN_PHONE_DIGIT_SLOTS);
    if (!extracted) return;
    const merged = (digits.slice(0, index) + extracted).slice(0, VN_PHONE_DIGIT_SLOTS);
    commit(merged);
    focusAt(Math.min(index + extracted.length, VN_PHONE_DIGIT_SLOTS - 1));
  };

  return (
    <fieldset className={cn('w-full space-y-2', disabled && 'opacity-60 pointer-events-none')} disabled={disabled}>
      <legend id={legendId} className="text-sm font-medium leading-none mb-2 block text-foreground">
        {label}
        <span className="text-destructive ml-0.5" aria-hidden>
          *
        </span>
      </legend>
      <div className="-mx-0.5 overflow-x-auto px-0.5 pb-0.5">
        <div
          className="flex min-w-max flex-nowrap items-center justify-center gap-0.5 sm:gap-1"
          role="group"
          aria-labelledby={legendId}
        >
          {Array.from({ length: VN_PHONE_DIGIT_SLOTS }, (_, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? 'tel-national' : 'off'}
              maxLength={1}
              value={digits[i] ?? ''}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              onPaste={(e) => onPaste(i, e)}
              aria-label={`${label} (${i + 1}/${VN_PHONE_DIGIT_SLOTS})`}
              className={cn(
                'h-9 w-7 shrink-0 rounded-md border bg-background text-center text-sm font-semibold tabular-nums sm:h-10 sm:w-8 sm:text-base',
                'ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                error ? 'border-destructive focus-visible:ring-destructive' : 'border-input',
              )}
            />
          ))}
        </div>
      </div>
      {hint ? (
        <p id={`${legendId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
};
