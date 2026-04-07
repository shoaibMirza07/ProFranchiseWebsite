'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import BilField, { IC } from './BilField'
import MediaUpload from './MediaUpload'
import ImageUpload from '../ImageUpload'

// ─── Shared ────────────────────────────────────────────────────────────────────

export interface EditorRef {
  getPayload(): { en: Record<string, unknown>; ar: Record<string, unknown> }
}

interface EP {
  contentEn: Record<string, unknown>
  contentAr: Record<string, unknown>
}

function str(obj: Record<string, unknown>, k: string): string {
  return typeof obj[k] === 'string' ? (obj[k] as string) : ''
}
function getArr<T>(obj: Record<string, unknown>, k: string): T[] {
  return Array.isArray(obj[k]) ? (obj[k] as T[]) : []
}
function getObj(obj: Record<string, unknown>, k: string): Record<string, unknown> {
  const v = obj[k]
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${IC} ${props.className ?? ''}`} />
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xs font-bold uppercase tracking-wider text-[#009B91] whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

interface ItemCardProps {
  label: string; canUp: boolean; canDown: boolean
  onMoveUp(): void; onMoveDown(): void; onRemove(): void
  children: React.ReactNode
}
function ItemCard({ label, canUp, canDown, onMoveUp, onMoveDown, onRemove, children }: ItemCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-600">{label}</span>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={onMoveUp} disabled={!canUp}
            className="p-1.5 rounded text-gray-400 hover:text-[#009B91] disabled:opacity-30 transition-colors">
            <ChevronUp size={13} />
          </button>
          <button type="button" onClick={onMoveDown} disabled={!canDown}
            className="p-1.5 rounded text-gray-400 hover:text-[#009B91] disabled:opacity-30 transition-colors">
            <ChevronDown size={13} />
          </button>
          <button type="button" onClick={onRemove}
            className="p-1.5 rounded text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <div className="p-4 space-y-4 bg-white">{children}</div>
    </div>
  )
}

function AddBtn({ label, onClick }: { label: string; onClick(): void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-semibold text-[#009B91] border border-[#009B91]/40 rounded-lg px-3 py-1.5 hover:bg-[#009B91]/5 transition-colors">
      <Plus size={12} />{label}
    </button>
  )
}

// ─── Hero Editor ───────────────────────────────────────────────────────────────

type Slide = {
  _id: string; imageUrl: string
  eyebrowEn: string; eyebrowAr: string
  titleEn: string; titleAr: string
  subtitleEn: string; subtitleAr: string
  ctaTextEn: string; ctaTextAr: string
  ctaUrl: string
  titleSize?: string
}

function parseSlides(en: Record<string, unknown>, ar: Record<string, unknown>): Slide[] {
  const eS = getArr<Record<string, unknown>>(en, 'slides')
  const aS = getArr<Record<string, unknown>>(ar, 'slides')
  const len = Math.max(eS.length, aS.length)
  return Array.from({ length: len }, (_, i) => {
    const e = eS[i] ?? {}; const a = aS[i] ?? {}
    return {
      _id: `${i}-${Date.now()}`,
      imageUrl: str(e, 'imageUrl') || str(a, 'imageUrl'),
      eyebrowEn: str(e, 'label') || str(e, 'eyebrow'),
      eyebrowAr: str(a, 'label') || str(a, 'eyebrow'),
      titleEn: str(e, 'title'), titleAr: str(a, 'title'),
      subtitleEn: str(e, 'subtitle'), subtitleAr: str(a, 'subtitle'),
      ctaTextEn: str(e, 'ctaText'), ctaTextAr: str(a, 'ctaText'),
      ctaUrl: str(e, 'ctaUrl') || str(a, 'ctaUrl'),
      titleSize: str(e, 'titleSize') || str(a, 'titleSize') || 'text-5xl',
    }
  })
}

function blankSlide(): Slide {
  return {
    _id: `new-${Date.now()}`, imageUrl: '',
    eyebrowEn: '', eyebrowAr: '', titleEn: '', titleAr: '',
    subtitleEn: '', subtitleAr: '', ctaTextEn: '', ctaTextAr: '', ctaUrl: '',
    titleSize: 'text-5xl',
  }
}

export const HeroEditor = forwardRef<EditorRef, EP>(function HeroEditor({ contentEn, contentAr }, ref) {
  const [bgUrl, setBgUrl] = useState(str(contentEn, 'imageUrl') || str(contentAr, 'imageUrl'))
  const [titleEn, setTitleEn] = useState(str(contentEn, 'title'))
  const [titleAr, setTitleAr] = useState(str(contentAr, 'title'))
  const [subtitleEn, setSubtitleEn] = useState(str(contentEn, 'subtitle'))
  const [subtitleAr, setSubtitleAr] = useState(str(contentAr, 'subtitle'))
  const [ctaEn, setCtaEn] = useState(str(contentEn, 'cta'))
  const [ctaAr, setCtaAr] = useState(str(contentAr, 'cta'))
  const [slides, setSlides] = useState<Slide[]>(() => parseSlides(contentEn, contentAr))

  useImperativeHandle(ref, () => ({
    getPayload() {
      const en: Record<string, unknown> = {}
      const ar: Record<string, unknown> = {}
      if (bgUrl) { en.imageUrl = bgUrl; ar.imageUrl = bgUrl }
      if (titleEn) en.title = titleEn
      if (titleAr) ar.title = titleAr
      if (subtitleEn) en.subtitle = subtitleEn
      if (subtitleAr) ar.subtitle = subtitleAr
      if (ctaEn) en.cta = ctaEn
      if (ctaAr) ar.cta = ctaAr
      if (slides.length > 0) {
        en.slides = slides.map(sl => ({
          ...(sl.imageUrl && { imageUrl: sl.imageUrl }),
          ...(sl.eyebrowEn && { label: sl.eyebrowEn }),
          ...(sl.titleEn && { title: sl.titleEn }),
          ...(sl.subtitleEn && { subtitle: sl.subtitleEn }),
          ...(sl.ctaTextEn && { ctaText: sl.ctaTextEn }),
          ...(sl.ctaUrl && { ctaUrl: sl.ctaUrl }),
          titleSize: sl.titleSize ?? 'text-5xl',
        }))
        ar.slides = slides.map(sl => ({
          ...(sl.imageUrl && { imageUrl: sl.imageUrl }),
          ...(sl.eyebrowAr && { label: sl.eyebrowAr }),
          ...(sl.titleAr && { title: sl.titleAr }),
          ...(sl.subtitleAr && { subtitle: sl.subtitleAr }),
          ...(sl.ctaTextAr && { ctaText: sl.ctaTextAr }),
          ...(sl.ctaUrl && { ctaUrl: sl.ctaUrl }),
          titleSize: sl.titleSize ?? 'text-5xl',
        }))
      }
      return { en, ar }
    }
  }), [bgUrl, titleEn, titleAr, subtitleEn, subtitleAr, ctaEn, ctaAr, slides])

  const upd = (idx: number) => (f: keyof Slide) => (v: string) =>
    setSlides(p => p.map((sl, i) => i === idx ? { ...sl, [f]: v } : sl))
  const move = (idx: number, dir: 'up' | 'down') => setSlides(p => {
    const n = [...p]; const si = dir === 'up' ? idx - 1 : idx + 1
    ;[n[idx], n[si]] = [n[si], n[idx]]; return n
  })

  return (
    <div className="space-y-5">
      <SectionDivider label="Page Heading — interior pages" />
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Background Media</p>
        <MediaUpload value={bgUrl} onChange={setBgUrl} variant="banner" label="Upload banner image or video" />
      </div>
      <BilField label="Title" enValue={titleEn} arValue={titleAr}
        onEnChange={setTitleEn} onArChange={setTitleAr} enPlaceholder="e.g. About Us" />
      <BilField label="Subtitle" type="textarea"
        enValue={subtitleEn} arValue={subtitleAr}
        onEnChange={setSubtitleEn} onArChange={setSubtitleAr} />

      <SectionDivider label="Carousel Slides — home page" />
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Each slide can have its own media, text and CTA.</p>
        <AddBtn label="Add Slide" onClick={() => setSlides(p => [...p, blankSlide()])} />
      </div>

      {slides.length > 0 && (
        <BilField label="Global CTA Button (below all slides)"
          enValue={ctaEn} arValue={ctaAr}
          onEnChange={setCtaEn} onArChange={setCtaAr}
          enPlaceholder="e.g. Discover Our Portfolio" />
      )}

      <div className="space-y-3">
        {slides.map((sl, idx) => (
          <ItemCard key={sl._id}
            label={`Slide ${idx + 1}${sl.titleEn ? ` — ${sl.titleEn.slice(0, 30)}` : ''}`}
            canUp={idx > 0} canDown={idx < slides.length - 1}
            onMoveUp={() => move(idx, 'up')} onMoveDown={() => move(idx, 'down')}
            onRemove={() => setSlides(p => p.filter((_, i) => i !== idx))}
          >
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1.5">Slide Media</p>
              <MediaUpload value={sl.imageUrl} onChange={upd(idx)('imageUrl')}
                variant="banner" label="Upload image or video for this slide" />
            </div>
            <BilField label="Eyebrow" hint="small text above the title"
              enValue={sl.eyebrowEn} arValue={sl.eyebrowAr}
              onEnChange={upd(idx)('eyebrowEn')} onArChange={upd(idx)('eyebrowAr')}
              enPlaceholder="e.g. Our Purpose" />
            <BilField label="Title"
              enValue={sl.titleEn} arValue={sl.titleAr}
              onEnChange={upd(idx)('titleEn')} onArChange={upd(idx)('titleAr')} />
            <BilField label="Subtitle" type="textarea"
              enValue={sl.subtitleEn} arValue={sl.subtitleAr}
              onEnChange={upd(idx)('subtitleEn')} onArChange={upd(idx)('subtitleAr')} />
            <BilField label="CTA Button Text"
              enValue={sl.ctaTextEn} arValue={sl.ctaTextAr}
              onEnChange={upd(idx)('ctaTextEn')} onArChange={upd(idx)('ctaTextAr')}
              enPlaceholder="e.g. Get Started" />
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1.5">
                CTA URL <span className="font-normal text-xs text-gray-400">(same for both languages)</span>
              </p>
              <Input value={sl.ctaUrl} placeholder="/portfolio"
                onChange={e => upd(idx)('ctaUrl')(e.target.value)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1.5">
                Title Size <span className="font-normal text-xs text-gray-400">(controls heading size on home hero)</span>
              </p>
              <select
                value={sl.titleSize ?? 'text-5xl'}
                onChange={e => upd(idx)('titleSize')(e.target.value)}
                className={`${IC} w-full`}
              >
                <option value="text-3xl">Small (text-3xl)</option>
                <option value="text-4xl">Medium (text-4xl)</option>
                <option value="text-5xl">Large — default (text-5xl)</option>
                <option value="text-6xl">Extra Large (text-6xl)</option>
                <option value="text-7xl">Huge (text-7xl)</option>
              </select>
            </div>
          </ItemCard>
        ))}
      </div>
    </div>
  )
})

// ─── Simple Editor — title, subtitle, body, cta ────────────────────────────────

export const SimpleEditor = forwardRef<EditorRef, EP>(function SimpleEditor({ contentEn, contentAr }, ref) {
  const [imageUrl, setImageUrl] = useState(str(contentEn, 'imageUrl') || str(contentAr, 'imageUrl'))
  const [titleEn, setTitleEn] = useState(str(contentEn, 'title'))
  const [titleAr, setTitleAr] = useState(str(contentAr, 'title'))
  const [subtitleEn, setSubtitleEn] = useState(str(contentEn, 'subtitle'))
  const [subtitleAr, setSubtitleAr] = useState(str(contentAr, 'subtitle'))
  const [bodyEn, setBodyEn] = useState(str(contentEn, 'body'))
  const [bodyAr, setBodyAr] = useState(str(contentAr, 'body'))
  const [subtextEn, setSubtextEn] = useState(str(contentEn, 'subtext'))
  const [subtextAr, setSubtextAr] = useState(str(contentAr, 'subtext'))
  const [ctaEn, setCtaEn] = useState(str(contentEn, 'cta'))
  const [ctaAr, setCtaAr] = useState(str(contentAr, 'cta'))
  const [ctaUrl, setCtaUrl] = useState(str(contentEn, 'ctaUrl') || str(contentAr, 'ctaUrl'))

  useImperativeHandle(ref, () => ({
    getPayload() {
      const en: Record<string, unknown> = {}
      const ar: Record<string, unknown> = {}
      if (imageUrl) { en.imageUrl = imageUrl; ar.imageUrl = imageUrl }
      if (titleEn) en.title = titleEn; if (titleAr) ar.title = titleAr
      if (subtitleEn) en.subtitle = subtitleEn; if (subtitleAr) ar.subtitle = subtitleAr
      if (bodyEn) en.body = bodyEn; if (bodyAr) ar.body = bodyAr
      if (subtextEn) en.subtext = subtextEn; if (subtextAr) ar.subtext = subtextAr
      if (ctaEn) en.cta = ctaEn; if (ctaAr) ar.cta = ctaAr
      if (ctaUrl) { en.ctaUrl = ctaUrl; ar.ctaUrl = ctaUrl }
      return { en, ar }
    }
  }), [imageUrl, titleEn, titleAr, subtitleEn, subtitleAr, bodyEn, bodyAr, subtextEn, subtextAr, ctaEn, ctaAr, ctaUrl])

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Section Image</p>
        <ImageUpload value={imageUrl} onChange={setImageUrl} label="Upload section image" />
      </div>
      <BilField label="Title" enValue={titleEn} arValue={titleAr}
        onEnChange={setTitleEn} onArChange={setTitleAr} />
      <BilField label="Subtitle" type="textarea"
        enValue={subtitleEn} arValue={subtitleAr}
        onEnChange={setSubtitleEn} onArChange={setSubtitleAr} />
      <BilField label="Body Text" hint="optional longer paragraph" type="textarea" rows={3}
        enValue={bodyEn} arValue={bodyAr}
        onEnChange={setBodyEn} onArChange={setBodyAr} />
      <BilField label="Subtext" hint="small text below body"
        enValue={subtextEn} arValue={subtextAr}
        onEnChange={setSubtextEn} onArChange={setSubtextAr} />
      <BilField label="CTA Button Text"
        enValue={ctaEn} arValue={ctaAr}
        onEnChange={setCtaEn} onArChange={setCtaAr} />
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1.5">CTA URL</p>
        <Input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} placeholder="/contact" />
      </div>
    </div>
  )
})

// ─── Hexagon Editor ────────────────────────────────────────────────────────────

const PILLAR_KEYS = ['brand', 'operator', 'consumer', 'employees', 'supplyChain', 'technology'] as const
type PKey = typeof PILLAR_KEYS[number]
const PILLAR_LABELS: Record<PKey, string> = {
  brand: 'The Brand', operator: 'The Operator', consumer: 'The Consumer',
  employees: 'Motivated Employees', supplyChain: 'Effective Supply-Chain',
  technology: 'Advanced Technology',
}
type Pillar = { labelEn: string; labelAr: string; descEn: string; descAr: string; imageUrl: string; diagramUrl: string }

function parsePillar(en: Record<string, unknown>, ar: Record<string, unknown>, key: PKey): Pillar {
  const eP = getObj(getObj(en, 'pillars'), key)
  const aP = getObj(getObj(ar, 'pillars'), key)
  return {
    labelEn: str(eP, 'label'), labelAr: str(aP, 'label'),
    descEn: str(eP, 'desc'), descAr: str(aP, 'desc'),
    imageUrl: str(eP, 'imageUrl') || str(aP, 'imageUrl'),
    diagramUrl: str(eP, 'diagramUrl') || str(aP, 'diagramUrl'),
  }
}

export const HexagonEditor = forwardRef<EditorRef, EP>(function HexagonEditor({ contentEn, contentAr }, ref) {
  const [titleEn, setTitleEn] = useState(str(contentEn, 'title'))
  const [titleAr, setTitleAr] = useState(str(contentAr, 'title'))
  const [subtitleEn, setSubtitleEn] = useState(str(contentEn, 'subtitle'))
  const [subtitleAr, setSubtitleAr] = useState(str(contentAr, 'subtitle'))
  const [centerImg, setCenterImg] = useState(str(contentEn, 'centerImageUrl'))
  const [pillars, setPillars] = useState<Record<PKey, Pillar>>(() =>
    Object.fromEntries(PILLAR_KEYS.map(k => [k, parsePillar(contentEn, contentAr, k)])) as Record<PKey, Pillar>
  )

  useImperativeHandle(ref, () => ({
    getPayload() {
      const enPillars: Record<string, unknown> = {}
      const arPillars: Record<string, unknown> = {}
      for (const key of PILLAR_KEYS) {
        const p = pillars[key]
        enPillars[key] = { label: p.labelEn, desc: p.descEn, ...(p.imageUrl && { imageUrl: p.imageUrl }), ...(p.diagramUrl && { diagramUrl: p.diagramUrl }) }
        arPillars[key] = { label: p.labelAr, desc: p.descAr, ...(p.imageUrl && { imageUrl: p.imageUrl }), ...(p.diagramUrl && { diagramUrl: p.diagramUrl }) }
      }
      return {
        en: { title: titleEn, subtitle: subtitleEn, ...(centerImg && { centerImageUrl: centerImg }), pillars: enPillars },
        ar: { title: titleAr, subtitle: subtitleAr, ...(centerImg && { centerImageUrl: centerImg }), pillars: arPillars },
      }
    }
  }), [titleEn, titleAr, subtitleEn, subtitleAr, centerImg, pillars])

  const updP = (key: PKey, f: keyof Pillar, v: string) =>
    setPillars(p => ({ ...p, [key]: { ...p[key], [f]: v } }))

  return (
    <div className="space-y-5">
      <BilField label="Section Title" enValue={titleEn} arValue={titleAr}
        onEnChange={setTitleEn} onArChange={setTitleAr} />
      <BilField label="Section Subtitle" type="textarea"
        enValue={subtitleEn} arValue={subtitleAr}
        onEnChange={setSubtitleEn} onArChange={setSubtitleAr} />
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Center Graphic <span className="font-normal text-xs text-gray-400">(optional — shown at hexagon center)</span></p>
        <ImageUpload value={centerImg} onChange={setCenterImg} label="Upload center image" />
      </div>
      <SectionDivider label="Six Pillars" />
      {PILLAR_KEYS.map(key => (
        <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-[#0B4D32]/5 border-b border-gray-100">
            <span className="text-sm font-bold text-[#0B4D32]">{PILLAR_LABELS[key]}</span>
            <span className="text-xs text-gray-400 ml-2 font-mono">{key}</span>
          </div>
          <div className="p-4 space-y-4 bg-white">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Pillar Icon / Image</p>
              <ImageUpload value={pillars[key].imageUrl} onChange={v => updP(key, 'imageUrl', v)} label="Upload icon or image" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Diagram / Detail Image <span className="font-normal text-xs text-gray-400">(shown in right panel when pillar is selected)</span></p>
              <MediaUpload value={pillars[key].diagramUrl} onChange={v => updP(key, 'diagramUrl', v)} label="Upload diagram or detail image" />
            </div>
            <BilField label="Label"
              enValue={pillars[key].labelEn} arValue={pillars[key].labelAr}
              onEnChange={v => updP(key, 'labelEn', v)} onArChange={v => updP(key, 'labelAr', v)}
              enPlaceholder={PILLAR_LABELS[key]} />
            <BilField label="Description" type="textarea" rows={3}
              enValue={pillars[key].descEn} arValue={pillars[key].descAr}
              onEnChange={v => updP(key, 'descEn', v)} onArChange={v => updP(key, 'descAr', v)} />
          </div>
        </div>
      ))}
    </div>
  )
})

// ─── Values Editor (icon boxes) ────────────────────────────────────────────────

type ValueItem = { _id: string; icon: string; labelEn: string; labelAr: string; descEn: string; descAr: string }

function parseValueItems(en: Record<string, unknown>, ar: Record<string, unknown>): ValueItem[] {
  const eI = getArr<Record<string, unknown>>(en, 'items')
  const aI = getArr<Record<string, unknown>>(ar, 'items')
  const len = Math.max(eI.length, aI.length)
  return Array.from({ length: len }, (_, i) => ({
    _id: `${i}-${Date.now()}`,
    icon: str(eI[i] ?? {}, 'icon') || str(aI[i] ?? {}, 'icon'),
    labelEn: str(eI[i] ?? {}, 'label'), labelAr: str(aI[i] ?? {}, 'label'),
    descEn: str(eI[i] ?? {}, 'desc'), descAr: str(aI[i] ?? {}, 'desc'),
  }))
}

export const ValuesEditor = forwardRef<EditorRef, EP>(function ValuesEditor({ contentEn, contentAr }, ref) {
  const [titleEn, setTitleEn] = useState(str(contentEn, 'title'))
  const [titleAr, setTitleAr] = useState(str(contentAr, 'title'))
  const [items, setItems] = useState<ValueItem[]>(() => parseValueItems(contentEn, contentAr))

  useImperativeHandle(ref, () => ({
    getPayload() {
      return {
        en: { title: titleEn, items: items.map(it => ({ icon: it.icon, label: it.labelEn, desc: it.descEn })) },
        ar: { title: titleAr, items: items.map(it => ({ icon: it.icon, label: it.labelAr, desc: it.descAr })) },
      }
    }
  }), [titleEn, titleAr, items])

  const upd = (idx: number, f: keyof ValueItem, v: string) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, [f]: v } : it))
  const move = (idx: number, dir: 'up' | 'down') => setItems(p => {
    const n = [...p]; const si = dir === 'up' ? idx - 1 : idx + 1
    ;[n[idx], n[si]] = [n[si], n[idx]]; return n
  })

  return (
    <div className="space-y-4">
      <BilField label="Section Title" enValue={titleEn} arValue={titleAr}
        onEnChange={setTitleEn} onArChange={setTitleAr} />
      <div className="flex items-center justify-between pt-1">
        <SectionDivider label={`${items.length} Value Box${items.length !== 1 ? 'es' : ''}`} />
        <AddBtn label="Add Box" onClick={() => setItems(p => [...p, {
          _id: `new-${Date.now()}`, icon: '', labelEn: '', labelAr: '', descEn: '', descAr: '',
        }])} />
      </div>
      {items.map((it, idx) => (
        <ItemCard key={it._id}
          label={`Box ${idx + 1}${it.labelEn ? ` — ${it.labelEn}` : ''}`}
          canUp={idx > 0} canDown={idx < items.length - 1}
          onMoveUp={() => move(idx, 'up')} onMoveDown={() => move(idx, 'down')}
          onRemove={() => setItems(p => p.filter((_, i) => i !== idx))}
        >
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">
              Icon Name <span className="text-xs font-normal text-gray-400">Lucide icon, e.g. Target, Zap, Eye, Scale, Building2</span>
            </p>
            <Input value={it.icon} placeholder="Target"
              onChange={e => upd(idx, 'icon', e.target.value)} />
          </div>
          <BilField label="Label"
            enValue={it.labelEn} arValue={it.labelAr}
            onEnChange={v => upd(idx, 'labelEn', v)} onArChange={v => upd(idx, 'labelAr', v)} />
          <BilField label="Description" type="textarea" rows={2}
            enValue={it.descEn} arValue={it.descAr}
            onEnChange={v => upd(idx, 'descEn', v)} onArChange={v => upd(idx, 'descAr', v)} />
        </ItemCard>
      ))}
    </div>
  )
})

// ─── Numbered Items List (shared by criteria / steps) ─────────────────────────

type NItem = { _id: string; number: string; labelEn: string; labelAr: string; descEn: string; descAr: string }

function parseNItems(en: Record<string, unknown>, ar: Record<string, unknown>, key: string): NItem[] {
  const eI = getArr<Record<string, unknown>>(en, key)
  const aI = getArr<Record<string, unknown>>(ar, key)
  const len = Math.max(eI.length, aI.length)
  return Array.from({ length: len }, (_, i) => ({
    _id: `${i}-${Date.now()}`,
    number: str(eI[i] ?? {}, 'number') || str(aI[i] ?? {}, 'number') || String(i + 1).padStart(2, '0'),
    labelEn: str(eI[i] ?? {}, 'label'), labelAr: str(aI[i] ?? {}, 'label'),
    descEn: str(eI[i] ?? {}, 'desc'), descAr: str(aI[i] ?? {}, 'desc'),
  }))
}

function NItemsList({ items, setItems, addLabel = 'Add Item' }: {
  items: NItem[]
  setItems: React.Dispatch<React.SetStateAction<NItem[]>>
  addLabel?: string
}) {
  const upd = (idx: number, f: keyof NItem, v: string) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, [f]: v } : it))
  const move = (idx: number, dir: 'up' | 'down') => setItems(p => {
    const n = [...p]; const si = dir === 'up' ? idx - 1 : idx + 1
    ;[n[idx], n[si]] = [n[si], n[idx]]; return n
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionDivider label={`${items.length} item${items.length !== 1 ? 's' : ''}`} />
        <AddBtn label={addLabel} onClick={() => setItems(p => [...p, {
          _id: `new-${Date.now()}`,
          number: String(p.length + 1).padStart(2, '0'),
          labelEn: '', labelAr: '', descEn: '', descAr: '',
        }])} />
      </div>
      {items.map((it, idx) => (
        <ItemCard key={it._id}
          label={`${it.number ? `${it.number} — ` : ''}${it.labelEn || `Item ${idx + 1}`}`}
          canUp={idx > 0} canDown={idx < items.length - 1}
          onMoveUp={() => move(idx, 'up')} onMoveDown={() => move(idx, 'down')}
          onRemove={() => setItems(p => p.filter((_, i) => i !== idx))}
        >
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">Number Badge</p>
            <Input value={it.number} placeholder="01"
              onChange={e => upd(idx, 'number', e.target.value)} />
          </div>
          <BilField label="Label"
            enValue={it.labelEn} arValue={it.labelAr}
            onEnChange={v => upd(idx, 'labelEn', v)} onArChange={v => upd(idx, 'labelAr', v)} />
          <BilField label="Description" type="textarea" rows={2}
            enValue={it.descEn} arValue={it.descAr}
            onEnChange={v => upd(idx, 'descEn', v)} onArChange={v => upd(idx, 'descAr', v)} />
        </ItemCard>
      ))}
    </div>
  )
}

// ─── Criteria Editor (brand_selection) ────────────────────────────────────────

export const CriteriaEditor = forwardRef<EditorRef, EP>(function CriteriaEditor({ contentEn, contentAr }, ref) {
  const [titleEn, setTitleEn] = useState(str(contentEn, 'title'))
  const [titleAr, setTitleAr] = useState(str(contentAr, 'title'))
  const [subtitleEn, setSubtitleEn] = useState(str(contentEn, 'subtitle'))
  const [subtitleAr, setSubtitleAr] = useState(str(contentAr, 'subtitle'))
  const [items, setItems] = useState<NItem[]>(() => parseNItems(contentEn, contentAr, 'criteria'))

  useImperativeHandle(ref, () => ({
    getPayload() {
      return {
        en: { title: titleEn, subtitle: subtitleEn, criteria: items.map(it => ({ number: it.number, label: it.labelEn, desc: it.descEn })) },
        ar: { title: titleAr, subtitle: subtitleAr, criteria: items.map(it => ({ number: it.number, label: it.labelAr, desc: it.descAr })) },
      }
    }
  }), [titleEn, titleAr, subtitleEn, subtitleAr, items])

  return (
    <div className="space-y-4">
      <BilField label="Section Title" enValue={titleEn} arValue={titleAr}
        onEnChange={setTitleEn} onArChange={setTitleAr} />
      <BilField label="Section Subtitle" type="textarea"
        enValue={subtitleEn} arValue={subtitleAr}
        onEnChange={setSubtitleEn} onArChange={setSubtitleAr} />
      <NItemsList items={items} setItems={setItems} addLabel="Add Criterion" />
    </div>
  )
})

// ─── Invest Editor (steps) ─────────────────────────────────────────────────────

export const InvestEditor = forwardRef<EditorRef, EP>(function InvestEditor({ contentEn, contentAr }, ref) {
  const [titleEn, setTitleEn] = useState(str(contentEn, 'title'))
  const [titleAr, setTitleAr] = useState(str(contentAr, 'title'))
  const [subtitleEn, setSubtitleEn] = useState(str(contentEn, 'subtitle'))
  const [subtitleAr, setSubtitleAr] = useState(str(contentAr, 'subtitle'))
  const [ctaEn, setCtaEn] = useState(str(contentEn, 'cta'))
  const [ctaAr, setCtaAr] = useState(str(contentAr, 'cta'))
  const [items, setItems] = useState<NItem[]>(() => parseNItems(contentEn, contentAr, 'steps'))

  useImperativeHandle(ref, () => ({
    getPayload() {
      return {
        en: { title: titleEn, subtitle: subtitleEn, cta: ctaEn, steps: items.map(it => ({ number: it.number, label: it.labelEn, desc: it.descEn })) },
        ar: { title: titleAr, subtitle: subtitleAr, cta: ctaAr, steps: items.map(it => ({ number: it.number, label: it.labelAr, desc: it.descAr })) },
      }
    }
  }), [titleEn, titleAr, subtitleEn, subtitleAr, ctaEn, ctaAr, items])

  return (
    <div className="space-y-4">
      <BilField label="Section Title" enValue={titleEn} arValue={titleAr}
        onEnChange={setTitleEn} onArChange={setTitleAr} />
      <BilField label="Section Subtitle" type="textarea"
        enValue={subtitleEn} arValue={subtitleAr}
        onEnChange={setSubtitleEn} onArChange={setSubtitleAr} />
      <BilField label="CTA Button Text"
        enValue={ctaEn} arValue={ctaAr}
        onEnChange={setCtaEn} onArChange={setCtaAr} />
      <NItemsList items={items} setItems={setItems} addLabel="Add Step" />
    </div>
  )
})

// ─── CTA Editor ────────────────────────────────────────────────────────────────

export const CtaEditor = forwardRef<EditorRef, EP>(function CtaEditor({ contentEn, contentAr }, ref) {
  const [bgUrl, setBgUrl] = useState(str(contentEn, 'imageUrl') || str(contentAr, 'imageUrl'))
  const [titleEn, setTitleEn] = useState(str(contentEn, 'title'))
  const [titleAr, setTitleAr] = useState(str(contentAr, 'title'))
  const [subtitleEn, setSubtitleEn] = useState(str(contentEn, 'subtitle'))
  const [subtitleAr, setSubtitleAr] = useState(str(contentAr, 'subtitle'))
  const [ctaTextEn, setCtaTextEn] = useState(str(contentEn, 'ctaText'))
  const [ctaTextAr, setCtaTextAr] = useState(str(contentAr, 'ctaText'))
  const [ctaUrl, setCtaUrl] = useState(str(contentEn, 'ctaUrl') || str(contentAr, 'ctaUrl'))

  useImperativeHandle(ref, () => ({
    getPayload() {
      const en: Record<string, unknown> = { title: titleEn, subtitle: subtitleEn, ctaText: ctaTextEn }
      const ar: Record<string, unknown> = { title: titleAr, subtitle: subtitleAr, ctaText: ctaTextAr }
      if (bgUrl) { en.imageUrl = bgUrl; ar.imageUrl = bgUrl }
      if (ctaUrl) { en.ctaUrl = ctaUrl; ar.ctaUrl = ctaUrl }
      return { en, ar }
    }
  }), [bgUrl, titleEn, titleAr, subtitleEn, subtitleAr, ctaTextEn, ctaTextAr, ctaUrl])

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Background Media</p>
        <MediaUpload value={bgUrl} onChange={setBgUrl} variant="banner" label="Upload CTA background image or video" />
      </div>
      <BilField label="Heading" enValue={titleEn} arValue={titleAr}
        onEnChange={setTitleEn} onArChange={setTitleAr} />
      <BilField label="Supporting Text" type="textarea"
        enValue={subtitleEn} arValue={subtitleAr}
        onEnChange={setSubtitleEn} onArChange={setSubtitleAr} />
      <BilField label="Button Text"
        enValue={ctaTextEn} arValue={ctaTextAr}
        onEnChange={setCtaTextEn} onArChange={setCtaTextAr} />
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1.5">Button URL</p>
        <Input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} placeholder="/contact" />
      </div>
    </div>
  )
})

// ─── Cards Editor ──────────────────────────────────────────────────────────────

type CardItem = { _id: string; imageUrl: string; titleEn: string; titleAr: string; bodyEn: string; bodyAr: string }

export const CardsEditor = forwardRef<EditorRef, EP>(function CardsEditor({ contentEn, contentAr }, ref) {
  const [titleEn, setTitleEn] = useState(str(contentEn, 'title'))
  const [titleAr, setTitleAr] = useState(str(contentAr, 'title'))
  const [subtitleEn, setSubtitleEn] = useState(str(contentEn, 'subtitle'))
  const [subtitleAr, setSubtitleAr] = useState(str(contentAr, 'subtitle'))
  const [cards, setCards] = useState<CardItem[]>(() => {
    const eI = getArr<Record<string, unknown>>(contentEn, 'items')
    const aI = getArr<Record<string, unknown>>(contentAr, 'items')
    const len = Math.max(eI.length, aI.length)
    return Array.from({ length: len }, (_, i) => ({
      _id: `${i}-${Date.now()}`,
      imageUrl: str(eI[i] ?? {}, 'imageUrl') || str(aI[i] ?? {}, 'imageUrl'),
      titleEn: str(eI[i] ?? {}, 'title'), titleAr: str(aI[i] ?? {}, 'title'),
      bodyEn: str(eI[i] ?? {}, 'body'), bodyAr: str(aI[i] ?? {}, 'body'),
    }))
  })

  useImperativeHandle(ref, () => ({
    getPayload() {
      return {
        en: { title: titleEn, subtitle: subtitleEn, items: cards.map(c => ({ imageUrl: c.imageUrl, title: c.titleEn, body: c.bodyEn })) },
        ar: { title: titleAr, subtitle: subtitleAr, items: cards.map(c => ({ imageUrl: c.imageUrl, title: c.titleAr, body: c.bodyAr })) },
      }
    }
  }), [titleEn, titleAr, subtitleEn, subtitleAr, cards])

  const upd = (idx: number, f: keyof CardItem, v: string) =>
    setCards(p => p.map((c, i) => i === idx ? { ...c, [f]: v } : c))
  const move = (idx: number, dir: 'up' | 'down') => setCards(p => {
    const n = [...p]; const si = dir === 'up' ? idx - 1 : idx + 1
    ;[n[idx], n[si]] = [n[si], n[idx]]; return n
  })

  return (
    <div className="space-y-4">
      <BilField label="Section Title" enValue={titleEn} arValue={titleAr}
        onEnChange={setTitleEn} onArChange={setTitleAr} />
      <BilField label="Section Subtitle" type="textarea"
        enValue={subtitleEn} arValue={subtitleAr}
        onEnChange={setSubtitleEn} onArChange={setSubtitleAr} />
      <div className="flex items-center justify-between pt-1">
        <SectionDivider label={`${cards.length} card${cards.length !== 1 ? 's' : ''}`} />
        <AddBtn label="Add Card" onClick={() => setCards(p => [...p, {
          _id: `new-${Date.now()}`, imageUrl: '', titleEn: '', titleAr: '', bodyEn: '', bodyAr: '',
        }])} />
      </div>
      {cards.map((card, idx) => (
        <ItemCard key={card._id}
          label={`Card ${idx + 1}${card.titleEn ? ` — ${card.titleEn}` : ''}`}
          canUp={idx > 0} canDown={idx < cards.length - 1}
          onMoveUp={() => move(idx, 'up')} onMoveDown={() => move(idx, 'down')}
          onRemove={() => setCards(p => p.filter((_, i) => i !== idx))}
        >
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Card Image</p>
            <ImageUpload value={card.imageUrl} onChange={v => upd(idx, 'imageUrl', v)} label="Upload card image" />
          </div>
          <BilField label="Title"
            enValue={card.titleEn} arValue={card.titleAr}
            onEnChange={v => upd(idx, 'titleEn', v)} onArChange={v => upd(idx, 'titleAr', v)} />
          <BilField label="Body" type="textarea" rows={3}
            enValue={card.bodyEn} arValue={card.bodyAr}
            onEnChange={v => upd(idx, 'bodyEn', v)} onArChange={v => upd(idx, 'bodyAr', v)} />
        </ItemCard>
      ))}
    </div>
  )
})

// ─── Inquiry Types Editor ──────────────────────────────────────────────────────

type InqOption = { _id: string; value: string; labelEn: string; labelAr: string }

export const InquiryTypesEditor = forwardRef<EditorRef, EP>(function InquiryTypesEditor({ contentEn, contentAr }, ref) {
  const [options, setOptions] = useState<InqOption[]>(() => {
    const eO = getArr<Record<string, unknown>>(contentEn, 'options')
    const aO = getArr<Record<string, unknown>>(contentAr, 'options')
    const len = Math.max(eO.length, aO.length)
    return Array.from({ length: len }, (_, i) => ({
      _id: `${i}-${Date.now()}`,
      value: str(eO[i] ?? {}, 'value') || str(aO[i] ?? {}, 'value'),
      labelEn: str(eO[i] ?? {}, 'label'), labelAr: str(aO[i] ?? {}, 'label'),
    }))
  })

  useImperativeHandle(ref, () => ({
    getPayload() {
      return {
        en: { options: options.map(o => ({ value: o.value, label: o.labelEn })) },
        ar: { options: options.map(o => ({ value: o.value, label: o.labelAr })) },
      }
    }
  }), [options])

  const upd = (idx: number, f: keyof InqOption, v: string) =>
    setOptions(p => p.map((o, i) => i === idx ? { ...o, [f]: v } : o))
  const move = (idx: number, dir: 'up' | 'down') => setOptions(p => {
    const n = [...p]; const si = dir === 'up' ? idx - 1 : idx + 1
    ;[n[idx], n[si]] = [n[si], n[idx]]; return n
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionDivider label={`${options.length} option${options.length !== 1 ? 's' : ''}`} />
        <AddBtn label="Add Option" onClick={() => setOptions(p => [...p, {
          _id: `new-${Date.now()}`, value: '', labelEn: '', labelAr: '',
        }])} />
      </div>
      {options.map((opt, idx) => (
        <ItemCard key={opt._id}
          label={`${opt.value || `Option ${idx + 1}`}${opt.labelEn ? ` — ${opt.labelEn}` : ''}`}
          canUp={idx > 0} canDown={idx < options.length - 1}
          onMoveUp={() => move(idx, 'up')} onMoveDown={() => move(idx, 'down')}
          onRemove={() => setOptions(p => p.filter((_, i) => i !== idx))}
        >
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5">
              Value <span className="text-xs font-normal text-gray-400">(internal key — no spaces, e.g. INVESTOR)</span>
            </p>
            <Input value={opt.value} placeholder="INVESTOR"
              onChange={e => upd(idx, 'value', e.target.value)} />
          </div>
          <BilField label="Label shown to user"
            enValue={opt.labelEn} arValue={opt.labelAr}
            onEnChange={v => upd(idx, 'labelEn', v)} onArChange={v => upd(idx, 'labelAr', v)}
            enPlaceholder="e.g. I am an Investor" />
        </ItemCard>
      ))}
    </div>
  )
})

// ─── Brand Sheet Labels Editor ─────────────────────────────────────────────────

const BS_FIELDS: { key: string; label: string; ta?: true }[] = [
  { key: 'back',                 label: 'Back Link Text' },
  { key: 'intro',                label: 'Introduction Heading' },
  { key: 'requirements',         label: 'Requirements Heading' },
  { key: 'requirementsSubtitle', label: 'Requirements Subtitle', ta: true },
  { key: 'netWorth',             label: 'Net Worth Label' },
  { key: 'liquidCapital',        label: 'Liquid Capital Label' },
  { key: 'experience',           label: 'Experience Label' },
  { key: 'siteProfile',          label: 'Site Profile Label' },
  { key: 'locations',            label: 'Locations Heading' },
  { key: 'locationsSubtitle',    label: 'Locations Subtitle', ta: true },
  { key: 'city',                 label: 'City Column Label' },
  { key: 'area',                 label: 'Area Column Label' },
  { key: 'type',                 label: 'Type Column Label' },
  { key: 'why',                  label: '"Why This Brand?" Heading' },
  { key: 'investCta',            label: 'Invest CTA Button Text' },
]

export const BrandSheetEditor = forwardRef<EditorRef, EP>(function BrandSheetEditor({ contentEn, contentAr }, ref) {
  const [enVals, setEnVals] = useState<Record<string, string>>(
    () => Object.fromEntries(BS_FIELDS.map(f => [f.key, str(contentEn, f.key)]))
  )
  const [arVals, setArVals] = useState<Record<string, string>>(
    () => Object.fromEntries(BS_FIELDS.map(f => [f.key, str(contentAr, f.key)]))
  )

  useImperativeHandle(ref, () => ({
    getPayload() {
      const en: Record<string, unknown> = {}
      const ar: Record<string, unknown> = {}
      BS_FIELDS.forEach(f => {
        if (enVals[f.key]) en[f.key] = enVals[f.key]
        if (arVals[f.key]) ar[f.key] = arVals[f.key]
      })
      return { en, ar }
    }
  }), [enVals, arVals])

  return (
    <div className="space-y-4">
      {BS_FIELDS.map(f => (
        <BilField key={f.key} label={f.label}
          type={f.ta ? 'textarea' : 'text'}
          enValue={enVals[f.key] ?? ''} arValue={arVals[f.key] ?? ''}
          onEnChange={v => setEnVals(p => ({ ...p, [f.key]: v }))}
          onArChange={v => setArVals(p => ({ ...p, [f.key]: v }))}
        />
      ))}
    </div>
  )
})

// ─── Dispatch ──────────────────────────────────────────────────────────────────

type EditorComponent = React.ForwardRefExoticComponent<EP & React.RefAttributes<EditorRef>>

const EDITOR_MAP: Record<string, EditorComponent> = {
  hero: HeroEditor,
  intro: SimpleEditor,
  'text-block': SimpleEditor,
  strength: SimpleEditor,
  brands: SimpleEditor,
  partners: SimpleEditor,
  team: SimpleEditor,
  gallery: SimpleEditor,
  careers: SimpleEditor,
  custom: SimpleEditor,
  hexagon: HexagonEditor,
  values: ValuesEditor,
  brand_selection: CriteriaEditor,
  invest: InvestEditor,
  cta: CtaEditor,
  cards: CardsEditor,
  inquiry_types: InquiryTypesEditor,
  brand_sheet: BrandSheetEditor,
}

export const SectionEditor = forwardRef<EditorRef, EP & { type: string }>(
  function SectionEditor({ type, contentEn, contentAr }, ref) {
    const Component = EDITOR_MAP[type]
    if (!Component) {
      return (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-500 mb-1">
            No editor defined for type <code className="font-mono bg-gray-100 px-1 rounded">{type}</code>
          </p>
          <p className="text-xs text-gray-400">Switch to Raw JSON mode to edit this section.</p>
        </div>
      )
    }
    return <Component ref={ref} contentEn={contentEn} contentAr={contentAr} />
  }
)
