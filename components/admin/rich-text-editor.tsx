'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import { cn } from '@/lib/utils'

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
  dayMode,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
  dayMode?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors',
        active
          ? dayMode
            ? 'bg-amber-100 text-amber-900'
            : 'bg-zinc-700 text-white'
          : dayMode
            ? 'text-[#8a7660] hover:bg-[#e9e2d4] hover:text-[#261c0d]'
            : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200',
      )}
    >
      {children}
    </button>
  )
}

export interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  /** Shorter editor for headings and labels; taller for body copy. */
  size?: 'compact' | 'default' | 'large'
  /** Match page content admin day/night styling. Defaults to dark (blog admin). */
  dayMode?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  size = 'default',
  dayMode = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'px-4 py-3 text-sm focus:outline-none',
          size === 'compact' ? 'min-h-[72px]' : size === 'large' ? 'min-h-[360px]' : 'min-h-[200px]',
          dayMode ? 'text-[#261c0d]' : 'text-zinc-200',
        ),
      },
    },
  })

  if (!editor) return null

  const selectClass = cn(
    'mr-1 rounded border px-2 py-0.5 text-xs',
    dayMode
      ? 'border-[#cfc8b6] bg-white text-[#261c0d]'
      : 'border-zinc-700 bg-zinc-800 text-zinc-200',
  )

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border',
        dayMode ? 'border-[#cfc8b6]' : 'border-zinc-700',
      )}
    >
      <div
        className={cn(
          'flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5',
          dayMode ? 'border-[#cfc8b6] bg-[#f0e9da]/80' : 'border-zinc-700 bg-zinc-900',
        )}
      >
        <select
          className={selectClass}
          value={
            editor.isActive('heading', { level: 1 })
              ? 'h1'
              : editor.isActive('heading', { level: 2 })
                ? 'h2'
                : editor.isActive('heading', { level: 3 })
                  ? 'h3'
                  : 'p'
          }
          onChange={(e) => {
            const val = e.target.value
            if (val === 'p') editor.chain().focus().setParagraph().run()
            else
              editor
                .chain()
                .focus()
                .setHeading({ level: Number(val[1]) as 1 | 2 | 3 })
                .run()
          }}
        >
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <div className={cn('mx-1 h-4 w-px', dayMode ? 'bg-[#cfc8b6]' : 'bg-zinc-700')} />

        <ToolbarBtn
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
          dayMode={dayMode}
        >
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
          dayMode={dayMode}
        >
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
          dayMode={dayMode}
        >
          <span className="underline">U</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
          dayMode={dayMode}
        >
          <span className="line-through">S</span>
        </ToolbarBtn>

        <div className={cn('mx-1 h-4 w-px', dayMode ? 'bg-[#cfc8b6]' : 'bg-zinc-700')} />

        <ToolbarBtn
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
          dayMode={dayMode}
        >
          ≡
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered list"
          dayMode={dayMode}
        >
          1≡
        </ToolbarBtn>

        <div className={cn('mx-1 h-4 w-px', dayMode ? 'bg-[#cfc8b6]' : 'bg-zinc-700')} />

        <ToolbarBtn
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align left"
          dayMode={dayMode}
        >
          ⬛
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align center"
          dayMode={dayMode}
        >
          ☰
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align right"
          dayMode={dayMode}
        >
          ▤
        </ToolbarBtn>

        <div className={cn('mx-1 h-4 w-px', dayMode ? 'bg-[#cfc8b6]' : 'bg-zinc-700')} />

        <ToolbarBtn
          active={editor.isActive('link')}
          onClick={() => {
            const url = window.prompt('Enter URL')
            if (url) editor.chain().focus().setLink({ href: url }).run()
            else editor.chain().focus().unsetLink().run()
          }}
          title="Insert link"
          dayMode={dayMode}
        >
          🔗
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear formatting"
          dayMode={dayMode}
        >
          Tx
        </ToolbarBtn>
      </div>

      <div className={dayMode ? 'bg-white' : 'bg-zinc-800'}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
