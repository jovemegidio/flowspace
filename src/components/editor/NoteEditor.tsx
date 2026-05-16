import { useState, useCallback, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Link from "@tiptap/extension-link"
import Typography from "@tiptap/extension-typography"
import {
  Music2, Bold, Italic, List, ListOrdered, CheckSquare,
  Heading1, Heading2, Quote, Code, X, ArrowLeft,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { notesDb, Note } from "@/lib/db"
import { useSpotifyStore } from "@/store"

const EMOJIS = ["📝", "📌", "💡", "🎯", "🔥", "⭐", "📚", "🧠", "🚀", "✅", "📊", "🌿"]

interface Props { note: Note; onChange?: (note: Note) => void }

export function NoteEditor({ note: initialNote, onChange }: Props) {
  const [note, setNote] = useState(initialNote)
  const [title, setTitle] = useState(initialNote.title)
  const [showEmoji, setShowEmoji] = useState(false)
  const [saved, setSaved] = useState(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openSearch = useSpotifyStore((s) => s.openSearch)
  const spotifyConnected = useSpotifyStore((s) => s.spotifyConnected)
  const navigate = useNavigate()

  const persist = useCallback(async (data: Parameters<typeof notesDb.update>[1]) => {
    try { await notesDb.update(note.id, data); setSaved(true) } catch {}
  }, [note.id])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Comece a escrever… use Markdown para formatar" }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      Typography,
    ],
    content: (() => {
      try { return initialNote.content ? JSON.parse(initialNote.content) : "" } catch { return initialNote.content ?? "" }
    })(),
    onUpdate: ({ editor }) => {
      setSaved(false)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        persist({ content: JSON.stringify(editor.getJSON()) })
      }, 1000)
    },
    editorProps: { attributes: { class: "focus:outline-none" } },
  })

  async function saveTitle() {
    await persist({ title })
    const updated = { ...note, title }
    setNote(updated); onChange?.(updated)
  }

  async function pickEmoji(e: string) {
    await persist({ emoji: e })
    const updated = { ...note, emoji: e }
    setNote(updated); onChange?.(updated)
    setShowEmoji(false)
  }

  async function attachSpotify() {
    openSearch(async (track) => {
      const updates = {
        spotify_track_id: track.id,
        spotify_track_name: track.name,
        spotify_artist: track.artist,
      }
      await persist(updates)
      const updated = { ...note, ...updates }
      setNote(updated); onChange?.(updated)
    })
  }

  async function removeSpotify() {
    const updates = {
      spotify_track_id: undefined,
      spotify_track_name: undefined,
      spotify_artist: undefined,
    }
    await persist(updates)
    const updated = { ...note, ...updates }
    setNote(updated); onChange?.(updated)
  }

  if (!editor) return null

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), label: "Negrito" },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), label: "Itálico" },
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }), label: "H1" },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), label: "H2" },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), label: "Lista" },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), label: "Lista num." },
    { icon: CheckSquare, action: () => editor.chain().focus().toggleTaskList().run(), active: editor.isActive("taskList"), label: "Checklist" },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote"), label: "Citação" },
    { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive("code"), label: "Código" },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-[#181818] gap-4 flex-wrap shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/notes")}
            className="p-1.5 text-[#3a3a3a] hover:text-[#888] hover:bg-white/5 rounded-md transition-colors mr-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-[#222] mr-1" />
          {tools.map(({ icon: Icon, action, active, label }) => (
            <button
              key={label}
              onClick={action}
              title={label}
              className={[
                "p-1.5 rounded-md transition-colors",
                active
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "text-[#4a4a4a] hover:text-[#c0c0c0] hover:bg-white/[0.05]",
              ].join(" ")}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Spotify section — only when connected */}
          {spotifyConnected && (
            note.spotify_track_name ? (
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#1DB954]/8 rounded-lg border border-[#1DB954]/10">
                <Music2 className="w-3.5 h-3.5 text-[#1DB954] shrink-0" />
                <span className="text-[12px] text-[#1DB954] font-medium max-w-[140px] truncate">
                  {note.spotify_track_name}
                </span>
                <button
                  onClick={removeSpotify}
                  className="text-[#1DB954]/40 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={attachSpotify}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] text-[#3a3a3a] hover:text-[#1DB954] hover:bg-[#1DB954]/8 rounded-lg transition-colors"
              >
                <Music2 className="w-3.5 h-3.5" />
                Vincular música
              </button>
            )
          )}

          <span className={`text-[11px] transition-colors ${saved ? "text-[#2a2a2a]" : "text-[#555]"}`}>
            {saved ? "Salvo" : "Salvando…"}
          </span>
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto px-12 py-10 max-w-3xl mx-auto w-full">
        {/* Emoji picker */}
        <div className="mb-5 relative">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="text-[48px] mb-1 hover:scale-110 transition-transform block leading-none"
          >
            {note.emoji}
          </button>
          {showEmoji && (
            <div className="absolute top-16 left-0 bg-[#191919] border border-[#242424] rounded-2xl p-3 flex flex-wrap gap-1.5 z-10 shadow-2xl">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => pickEmoji(e)}
                  className="text-[22px] hover:scale-125 transition-transform p-1.5 rounded-xl hover:bg-white/[0.06]"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          placeholder="Título da nota"
          className="w-full bg-transparent text-[30px] font-bold text-[#efefef] outline-none placeholder:text-[#252525] mb-8 leading-tight"
        />

        {/* Editor */}
        <div className="text-[#b0b0b0] text-[15px] leading-7">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
