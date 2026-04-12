import React, { useRef, useId } from 'react';
import { Paperclip, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

export interface SingleFileInputProps {
  label: string;
  required?: boolean;
  error?: string;
  /** URL đã lưu (khi sửa / không đổi file) */
  storedUrl: string;
  /** File mới chọn, sẽ upload khi lưu form */
  pendingFile: File | null;
  onPickFile: (file: File | null) => void;
  /** Xóa file đang chọn và/hoặc URL đã lưu */
  onClear: () => void;
  disabled?: boolean;
  accept?: string;
  pickLabel: string;
  clearLabel: string;
  className?: string;
}

const SingleFileInput: React.FC<SingleFileInputProps> = ({
  label,
  required,
  error,
  storedUrl,
  pendingFile,
  onPickFile,
  onClear,
  disabled,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,image/png,image/jpeg,image/webp',
  pickLabel,
  clearLabel,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const errorId = error ? `${inputId}-err` : undefined;

  const displayName = pendingFile?.name ?? (storedUrl.trim() ? storedUrl.split('/').pop() ?? storedUrl : '');

  return (
    <div className={cn('w-full', className)}>
      <label
        htmlFor={inputId}
        className="text-sm font-medium leading-none mb-1.5 flex items-center gap-1.5 text-foreground"
      >
        {label}
        {required && <span className="text-destructive" aria-hidden="true">*</span>}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            e.target.value = '';
            onPickFile(f);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-9 border-border"
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip size={14} className="mr-1.5 shrink-0" aria-hidden />
          {pickLabel}
        </Button>
        {(pendingFile || storedUrl.trim()) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="h-9 text-muted-foreground"
            onClick={onClear}
          >
            <X size={14} className="mr-1" aria-hidden />
            {clearLabel}
          </Button>
        )}
      </div>
      {displayName ? (
        <p className="mt-1.5 text-xs text-muted-foreground truncate" title={pendingFile ? pendingFile.name : storedUrl}>
          {displayName}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive mt-1">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default SingleFileInput;
