'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { use } from 'react'
import { Plus, Pencil, Trash2, Loader2, ChevronUp, ChevronDown, ArrowLeft, Eye, EyeOff, Code2 } from 'lucide-react'
import Link from 'next/link'
import Modal from '@/components/admin/Modal'
import { SectionEditor, type EditorRef } from '@/components/admin/cms/editors'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageSection {
  id: string
  type: string
  order: number
  isVisible: boolean
  contentEn: unknown
  contentAr: unknown
}

interface PageData {
  id: string
  titleEn: string
  titleAr: string | null
  slug: string
  isPublished: boolean
  sections: PageSection[]
}

function parseContent(raw: unknown): Record<string, unknown> {
  if (!raw) return {}
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return {} } }
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>
  return {}
}

const TYPE_COLORS: Record<string, string> = {
  hero: 'bg-purple-100 text-purple-700',
  intro: 'bg-blue-100 text-blue-700',
  'text-block': 'bg-gray-100 text-gray-600',
  cards: 'bg-orange-100 text-orange-700',
  stats: 'bg-yellow-100 text-yellow-700',
  cta: 'bg-green-100 text-green-700',
  custom: 'bg-pink-100 text-pink-700',
  hexagon: 'bg-teal-100 text-teal-700',
  brand_selection: 'bg-indigo-100 text-indigo-700',
  brands: 'bg-rose-100 text-rose-700',
  invest: 'bg-amber-100 text-amber-700',
  strength: 'bg-emerald-100 text-emerald-700',
  values: 'bg-cyan-100 text-cyan-700',
  partners: 'bg-sky-100 text-sky-700',
  team: 'bg-violet-100 text-violet-700',
  gallery: 'bg-fuchsia-100 text-fuchsia-700',
  careers: 'bg-lime-100 text-lime-700',
  inquiry_types: 'bg-orange-100 text-orange-600',
  brand_sheet: 'bg-slate-100 text-slate-700',
}

// All section types that have a registered editor
const ADD_TYPES = [
  // Structure
  'hero', 'intro', 'text-block', 'cta', 'cards', 'custom',
  // Home page
  'hexagon', 'brand_selection', 'invest', 'brands', 'strength',
  // About / People
  'values', 'team', 'partners',
  // Other pages
  'gallery', 'careers', 'inquiry_types', 'brand_sheet',
] as const

// Known page slugs → required section types (in display order)
const PAGE_SCAFFOLDS: Record<string, string[]> = {
  home:    ['hero', 'intro', 'hexagon', 'brand_selection', 'invest', 'brands', 'strength'],
  about:   ['hero', 'intro', 'values', 'team', 'partners'],
  people:  ['hero', 'intro', 'team', 'careers'],
  contact: ['hero', 'inquiry_types'],
  portfolio: ['hero', 'intro', 'brands'],
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PageSectionBuilder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [pageData, setPageData] = useState<PageData | null>(null)
  const [sections, setSections] = useState<PageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  // Add modal
  const [addOpen, setAddOpen] = useState(false)
  const [addType, setAddType] = useState('text-block')
  const [addSaving, setAddSaving] = useState(false)

  // Edit modal
  const [editOpen, setEditOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<PageSection | null>(null)
  const [rawMode, setRawMode] = useState(false)
  const [rawEn, setRawEn] = useState('')
  const [rawAr, setRawAr] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const editorRef = useRef<EditorRef>(null)

  const fetchPage = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/pages/${id}`)
      if (!res.ok) throw new Error()
      const data: PageData = await res.json()
      setPageData(data)
      const sorted = (data.sections ?? []).sort((a, b) => a.order - b.order)
      const normalized = sorted.map((s, i) => ({ ...s, order: i }))
      setSections(normalized)
      // Persist normalized orders if any differ from their DB value
      const needsSave = sorted.some((s, i) => s.order !== i)
      if (needsSave) {
        Promise.all(
          normalized.map(s =>
            fetch(`/api/pages/${id}/sections/${s.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order: s.order }),
            })
          )
        ).catch(() => {})
      }
    } catch {
      setPageError('Failed to load page.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchPage() }, [fetchPage])

  const openEdit = (section: PageSection) => {
    setEditingSection(section)
    setEditError('')
    setRawMode(false)
    const en = parseContent(section.contentEn)
    const ar = parseContent(section.contentAr)
    setRawEn(JSON.stringify(en, null, 2))
    setRawAr(JSON.stringify(ar, null, 2))
    setEditOpen(true)
  }

  const handleSave = async () => {
    if (!editingSection) return
    setEditError('')

    let en: Record<string, unknown>
    let ar: Record<string, unknown>

    if (rawMode) {
      try { en = JSON.parse(rawEn || '{}') } catch { setEditError('EN JSON is invalid.'); return }
      try { ar = JSON.parse(rawAr || '{}') } catch { setEditError('AR JSON is invalid.'); return }
    } else {
      if (!editorRef.current) return
      const payload = editorRef.current.getPayload()
      en = payload.en
      ar = payload.ar
    }

    setEditSaving(true)
    try {
      const res = await fetch(`/api/pages/${id}/sections/${editingSection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentEn: en, contentAr: ar }),
      })
      if (!res.ok) throw new Error('Save failed')
      setEditOpen(false)
      fetchPage()
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : 'Failed to save.')
    } finally {
      setEditSaving(false)
    }
  }

  const handleAdd = async (type = addType) => {
    setAddSaving(true)
    const nextOrder = sections.length === 0 ? 0 : Math.max(...sections.map(s => s.order)) + 1
    try {
      const res = await fetch(`/api/pages/${id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, order: nextOrder, isVisible: true, contentEn: {}, contentAr: {} }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed') }
      setAddOpen(false)
      fetchPage()
    } catch (e: unknown) {
      setPageError(e instanceof Error ? e.message : 'Failed to add section.')
    } finally {
      setAddSaving(false)
    }
  }

  // Create all missing scaffold sections for this page slug in one shot
  const handleScaffold = async () => {
    const slug = pageData?.slug
    if (!slug || !PAGE_SCAFFOLDS[slug]) return
    const required = PAGE_SCAFFOLDS[slug]
    const existingTypes = new Set(sections.map(s => s.type))
    const missing = required.filter(t => !existingTypes.has(t))
    if (missing.length === 0) { alert('All required sections already exist.'); return }
    setAddSaving(true)
    let nextOrder = sections.length === 0 ? 0 : Math.max(...sections.map(s => s.order)) + 1
    try {
      for (const type of missing) {
        await fetch(`/api/pages/${id}/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, order: nextOrder++, isVisible: true, contentEn: {}, contentAr: {} }),
        })
      }
      fetchPage()
    } catch {
      setPageError('Failed to scaffold sections.')
    } finally {
      setAddSaving(false)
    }
  }

  const toggleVisible = async (section: PageSection) => {
    try {
      await fetch(`/api/pages/${id}/sections/${section.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !section.isVisible }),
      })
      setSections(p => p.map(s => s.id === section.id ? { ...s, isVisible: !s.isVisible } : s))
    } catch { setPageError('Failed to update visibility.') }
  }

  const deleteSection = async (sectionId: string) => {
    if (!window.confirm('Delete this section? Cannot be undone.')) return
    try {
      await fetch(`/api/pages/${id}/sections/${sectionId}`, { method: 'DELETE' })
      setSections(p => p.filter(s => s.id !== sectionId))
    } catch { setPageError('Failed to delete section.') }
  }

  const moveSection = async (section: PageSection, dir: 'up' | 'down') => {
    const idx = sections.findIndex(s => s.id === section.id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === sections.length - 1) return
    const arr = [...sections]
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
    const normalized = arr.map((s, i) => ({ ...s, order: i }))
    setSections(normalized)
    // Compare by section ID to find truly changed orders
    const prevOrderMap = new Map(sections.map(s => [s.id, s.order]))
    const changed = normalized.filter(s => prevOrderMap.get(s.id) !== s.order)
    await Promise.all(
      changed.map(s =>
        fetch(`/api/pages/${id}/sections/${s.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: s.order }),
        })
      )
    ).catch(() => { setPageError('Failed to reorder.'); fetchPage() })
  }

  const toggleRawMode = () => {
    if (!rawMode && editorRef.current) {
      const { en, ar } = editorRef.current.getPayload()
      setRawEn(JSON.stringify(en, null, 2))
      setRawAr(JSON.stringify(ar, null, 2))
    }
    setRawMode(r => !r)
    setEditError('')
  }

  if (loading) return (
    <div className="p-6 flex justify-center py-20">
      <Loader2 size={32} className="animate-spin text-[#009B91]" />
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/pages" className="flex items-center gap-1 hover:text-[#009B91] transition-colors">
          <ArrowLeft size={14} /> Pages
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{pageData?.titleEn ?? 'Page'}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageData?.titleEn}</h1>
          <div className="flex items-center gap-3 mt-1">
            {pageData?.titleAr && <span className="text-sm text-gray-500" dir="rtl">{pageData.titleAr}</span>}
            <code className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">/{pageData?.slug}</code>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pageData?.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {pageData?.isPublished ? 'Published' : 'Hidden'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pageData?.slug && PAGE_SCAFFOLDS[pageData.slug] && (
            <button
              onClick={handleScaffold}
              disabled={addSaving}
              title="Auto-create all sections required by this page"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[#009B91] text-[#009B91] hover:bg-[#009B91]/5 transition-colors disabled:opacity-50"
            >
              {addSaving ? <Loader2 size={14} className="animate-spin" /> : null}
              Initialize Sections
            </button>
          )}
          <button onClick={() => { setAddType('text-block'); setAddOpen(true) }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus size={16} /> Add Section
          </button>
        </div>
      </div>

      {pageError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{pageError}</div>
      )}

      {/* Sections */}
      {sections.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
          <p className="text-gray-400 text-sm mb-4">No sections yet.</p>
          <button onClick={() => { setAddType('hero'); setAddOpen(true) }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm mx-auto">
            <Plus size={16} /> Add First Section
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, idx) => {
            const en = parseContent(section.contentEn)
            const preview = [en.title, en.subtitle, en.body].find(v => typeof v === 'string' && v) as string | undefined

            return (
              <div key={section.id} className={`bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm ${!section.isVisible ? 'opacity-50' : ''}`}>
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveSection(section, 'up')} disabled={idx === 0}
                    className="p-1 text-gray-300 hover:text-[#009B91] disabled:opacity-20 rounded transition-colors">
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={() => moveSection(section, 'down')} disabled={idx === sections.length - 1}
                    className="p-1 text-gray-300 hover:text-[#009B91] disabled:opacity-20 rounded transition-colors">
                    <ChevronDown size={14} />
                  </button>
                </div>

                <span className="w-6 text-center text-xs font-bold text-gray-300">#{idx + 1}</span>

                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TYPE_COLORS[section.type] ?? 'bg-gray-100 text-gray-600'}`}>
                  {section.type}
                </span>

                <div className="flex-1 min-w-0">
                  {preview ? (
                    <p className="text-xs text-gray-500 truncate">{String(preview).slice(0, 80)}</p>
                  ) : (
                    <p className="text-xs text-gray-300 italic">No content yet — click Edit</p>
                  )}
                </div>

                <button onClick={() => toggleVisible(section)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    section.isVisible ? 'text-[#009B91] bg-[#009B91]/10 hover:bg-[#009B91]/20' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                  }`}>
                  {section.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                  {section.isVisible ? 'Visible' : 'Hidden'}
                </button>

                <button onClick={() => openEdit(section)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#009B91] text-[#009B91] hover:bg-[#009B91]/5 transition-colors">
                  <Pencil size={12} /> Edit Content
                </button>

                <button onClick={() => deleteSection(section.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add Modal ── */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Section" size="sm">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Section Type</label>
          <div className="max-h-64 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-2">
              {ADD_TYPES.map(t => (
                <button key={t} onClick={() => setAddType(t)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                    addType === t ? 'bg-[#0B4D32] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}>
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${(TYPE_COLORS[t] ?? '').split(' ')[0]}`} />
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => setAddOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={() => handleAdd()} disabled={addSaving} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              {addSaving && <Loader2 size={14} className="animate-spin" />} Add Section
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit — ${editingSection?.type ?? ''}`} size="xl">
        <div className="space-y-4">
          {/* Raw JSON toggle */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {rawMode ? 'Editing raw JSON — be careful with syntax.' : 'Structured field editor.'}
            </p>
            <button onClick={toggleRawMode}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              <Code2 size={12} />
              {rawMode ? 'Field Editor' : 'Raw JSON'}
            </button>
          </div>

          {editError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{editError}</div>
          )}

          <div className="max-h-[62vh] overflow-y-auto pr-1">
            {rawMode ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Content EN (JSON)</label>
                  <textarea value={rawEn} onChange={e => setRawEn(e.target.value)} rows={18}
                    spellCheck={false} className="w-full font-mono text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#009B91] resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Content AR (JSON)</label>
                  <textarea value={rawAr} onChange={e => setRawAr(e.target.value)} rows={18}
                    spellCheck={false} className="w-full font-mono text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#009B91] resize-none" />
                </div>
              </div>
            ) : editingSection ? (
              <SectionEditor
                key={editingSection.id}
                ref={editorRef}
                type={editingSection.type}
                contentEn={parseContent(editingSection.contentEn)}
                contentAr={parseContent(editingSection.contentAr)}
              />
            ) : null}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={editSaving} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              {editSaving && <Loader2 size={14} className="animate-spin" />}
              {editSaving ? 'Saving…' : 'Save Content'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
