import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  Table2,
  Undo2,
  Redo2,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import './rich-text-editor.css';

function RichTextToolbar({ editor }: { editor: Editor | null }) {
  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL liên kết', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rich-text-toolbar" role="toolbar" aria-label="Định dạng văn bản">
      <button
        type="button"
        className={cn(editor.isActive('bold') && 'is-active')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        aria-pressed={editor.isActive('bold')}
        title="Đậm"
      >
        <Bold size={16} aria-hidden />
      </button>
      <button
        type="button"
        className={cn(editor.isActive('italic') && 'is-active')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        aria-pressed={editor.isActive('italic')}
        title="Nghiêng"
      >
        <Italic size={16} aria-hidden />
      </button>
      <button
        type="button"
        className={cn(editor.isActive('underline') && 'is-active')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        aria-pressed={editor.isActive('underline')}
        title="Gạch dưới"
      >
        <UnderlineIcon size={16} aria-hidden />
      </button>
      <button
        type="button"
        className={cn(editor.isActive('strike') && 'is-active')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        aria-pressed={editor.isActive('strike')}
        title="Gạch ngang"
      >
        <Strikethrough size={16} aria-hidden />
      </button>
      <button
        type="button"
        className={cn(editor.isActive('code') && 'is-active')}
        onClick={() => editor.chain().focus().toggleCode().run()}
        aria-pressed={editor.isActive('code')}
        title="Mã nội dòng"
      >
        <Code size={16} aria-hidden />
      </button>
      <span className="w-px h-6 bg-border shrink-0 self-center mx-0.5" aria-hidden />
      <button
        type="button"
        className={cn(editor.isActive('heading', { level: 2 }) && 'is-active')}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-pressed={editor.isActive('heading', { level: 2 })}
        title="Tiêu đề 2"
      >
        <Heading2 size={16} aria-hidden />
      </button>
      <button
        type="button"
        className={cn(editor.isActive('heading', { level: 3 }) && 'is-active')}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        aria-pressed={editor.isActive('heading', { level: 3 })}
        title="Tiêu đề 3"
      >
        <Heading3 size={16} aria-hidden />
      </button>
      <button
        type="button"
        className={cn(editor.isActive('bulletList') && 'is-active')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-pressed={editor.isActive('bulletList')}
        title="Danh sách dấu đầu dòng"
      >
        <List size={16} aria-hidden />
      </button>
      <button
        type="button"
        className={cn(editor.isActive('orderedList') && 'is-active')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        aria-pressed={editor.isActive('orderedList')}
        title="Danh sách đánh số"
      >
        <ListOrdered size={16} aria-hidden />
      </button>
      <button
        type="button"
        className={cn(editor.isActive('blockquote') && 'is-active')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        aria-pressed={editor.isActive('blockquote')}
        title="Trích dẫn"
      >
        <Quote size={16} aria-hidden />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ ngang">
        <Minus size={16} aria-hidden />
      </button>
      <button
        type="button"
        className={cn(editor.isActive('link') && 'is-active')}
        onClick={setLink}
        aria-pressed={editor.isActive('link')}
        title="Liên kết"
      >
        <Link2 size={16} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Chèn bảng 3×3"
      >
        <Table2 size={16} aria-hidden />
      </button>
      <span className="w-px h-6 bg-border shrink-0 self-center mx-0.5" aria-hidden />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Hoàn tác"
      >
        <Undo2 size={16} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Làm lại"
      >
        <Redo2 size={16} aria-hidden />
      </button>
    </div>
  );
}

export interface RichTextEditorProps {
  /** HTML khởi tạo — đổi `key` trên component cha để reset nội dung */
  initialHtml: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Soạn thảo rich text (TipTap): định dạng, danh sách, liên kết, bảng, v.v.
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialHtml, onChange, disabled, className }) => {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    [],
  );

  const editor = useEditor(
    {
      extensions,
      content: initialHtml || '',
      editable: !disabled,
      editorProps: {
        attributes: {
          class: 'prose-rich max-w-none',
          spellcheck: 'true',
        },
      },
      onCreate: ({ editor: ed }) => {
        onChangeRef.current(ed.getHTML());
      },
      onUpdate: ({ editor: ed }) => {
        onChangeRef.current(ed.getHTML());
      },
    },
    // Chỉ khởi tạo lại khi `initialHtml` thay đổi (vd. refetch) hoặc extensions; đổi `key` ở cha để reset phiên sửa.
    [extensions, initialHtml],
  );

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) {
    return (
      <div
        className={cn('rich-text-editor-shell rounded-lg border border-border bg-muted/20 min-h-[320px]', className)}
        aria-busy="true"
      />
    );
  }

  return (
    <div className={cn('rich-text-editor-shell rounded-lg border border-border bg-background overflow-hidden', className)}>
      {!disabled ? <RichTextToolbar editor={editor} /> : null}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
