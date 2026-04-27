'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import ImageUpload from '@/components/admin/ImageUpload'

type Tab = 'general' | 'branding' | 'contact' | 'social' | 'stats'

interface Settings {
  siteNameEn: string
  siteNameAr: string
  taglineEn: string
  taglineAr: string
  logoUrl: string
  faviconUrl: string
  addressEn: string
  addressAr: string
  defaultLanguage: string
  phone: string
  email: string
  whatsapp: string
  mapEmbedUrl: string
  linkedIn: string
  instagram: string
  twitter: string
  facebook: string
  stat1Number: string
  stat1LabelEn: string
  stat1LabelAr: string
  stat2Number: string
  stat2LabelEn: string
  stat2LabelAr: string
  stat3Number: string
  stat3LabelEn: string
  stat3LabelAr: string
  stat4Number: string
  stat4LabelEn: string
  stat4LabelAr: string
  colorPrimary: string
  colorForest: string
  colorHeader: string
  colorButton: string
  colorSlideBg: string
  colorArrow: string
  colorScrollbar: string
  colorFooterBg: string
  colorTextBase: string
  colorTextMuted: string
  colorPageBg: string
  colorAdminSidebar: string
  colorHeroOverlayStart: string
  colorHeroOverlayEnd: string
  footerTaglineEn: string
  footerTaglineAr: string
}

const defaultSettings: Settings = {
  siteNameEn: 'ProFranchise',
  siteNameAr: 'برو فرانشايز',
  taglineEn: 'Growth Accelerated',
  taglineAr: 'نمو متسارع',
  logoUrl: '',
  faviconUrl: '',
  addressEn: '',
  addressAr: '',
  defaultLanguage: 'en',
  phone: '',
  email: '',
  whatsapp: '',
  mapEmbedUrl: '',
  linkedIn: '',
  instagram: '',
  twitter: '',
  facebook: '',
  stat1Number: '200+',
  stat1LabelEn: 'Franchise Brands',
  stat1LabelAr: 'علامة فرانشايز',
  stat2Number: '15+',
  stat2LabelEn: 'Years Experience',
  stat2LabelAr: 'سنوات خبرة',
  stat3Number: '50+',
  stat3LabelEn: 'Expert Partners',
  stat3LabelAr: 'شريك خبير',
  stat4Number: '1000+',
  stat4LabelEn: 'Happy Investors',
  stat4LabelAr: 'مستثمر سعيد',
  colorPrimary: '#009B91',
  colorForest: '#0B4D32',
  colorHeader: '#07190F',
  colorButton: '#009B91',
  colorSlideBg: '#ffffff',
  colorArrow: '#475569',
  colorScrollbar: '#009B91',
  colorFooterBg: '#0B4D32',
  colorTextBase: '#0f172a',
  colorTextMuted: '#64748b',
  colorPageBg: '#ffffff',
  colorAdminSidebar: 'linear-gradient(180deg, #0B4D32 0%, #083a26 100%)',
  colorHeroOverlayStart: '#0B4D32',
  colorHeroOverlayEnd: '#009B91',
  footerTaglineEn: '',
  footerTaglineAr: '',
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('general')
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      const all = { ...data.general, ...data.branding, ...data.contact, ...data.social, ...data.stats }
      setSettings((prev) => ({ ...prev, ...all }))
    } catch {
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const set = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const items = [
        // General
        { key: 'siteNameEn', value: settings.siteNameEn, group: 'general' },
        { key: 'siteNameAr', value: settings.siteNameAr, group: 'general' },
        { key: 'taglineEn', value: settings.taglineEn, group: 'general' },
        { key: 'taglineAr', value: settings.taglineAr, group: 'general' },
        { key: 'logoUrl', value: settings.logoUrl, group: 'general' },
        { key: 'faviconUrl', value: settings.faviconUrl, group: 'general' },
        { key: 'addressEn', value: settings.addressEn, group: 'general' },
        { key: 'addressAr', value: settings.addressAr, group: 'general' },
        { key: 'defaultLanguage', value: settings.defaultLanguage, group: 'general' },
        // Contact
        { key: 'phone', value: settings.phone, group: 'contact' },
        { key: 'email', value: settings.email, group: 'contact' },
        { key: 'whatsapp', value: settings.whatsapp, group: 'contact' },
        { key: 'mapEmbedUrl', value: settings.mapEmbedUrl, group: 'contact' },
        // Social
        { key: 'linkedIn', value: settings.linkedIn, group: 'social' },
        { key: 'instagram', value: settings.instagram, group: 'social' },
        { key: 'twitter', value: settings.twitter, group: 'social' },
        { key: 'facebook', value: settings.facebook, group: 'social' },
        // Stats
        { key: 'stat1Number', value: settings.stat1Number, group: 'stats' },
        { key: 'stat1LabelEn', value: settings.stat1LabelEn, group: 'stats' },
        { key: 'stat1LabelAr', value: settings.stat1LabelAr, group: 'stats' },
        { key: 'stat2Number', value: settings.stat2Number, group: 'stats' },
        { key: 'stat2LabelEn', value: settings.stat2LabelEn, group: 'stats' },
        { key: 'stat2LabelAr', value: settings.stat2LabelAr, group: 'stats' },
        { key: 'stat3Number', value: settings.stat3Number, group: 'stats' },
        { key: 'stat3LabelEn', value: settings.stat3LabelEn, group: 'stats' },
        { key: 'stat3LabelAr', value: settings.stat3LabelAr, group: 'stats' },
        { key: 'stat4Number', value: settings.stat4Number, group: 'stats' },
        { key: 'stat4LabelEn', value: settings.stat4LabelEn, group: 'stats' },
        { key: 'stat4LabelAr', value: settings.stat4LabelAr, group: 'stats' },
        // Branding
        { key: 'colorPrimary', value: settings.colorPrimary, group: 'branding' },
        { key: 'colorForest', value: settings.colorForest, group: 'branding' },
        { key: 'colorHeader', value: settings.colorHeader, group: 'branding' },
        { key: 'colorButton', value: settings.colorButton, group: 'branding' },
        { key: 'colorSlideBg', value: settings.colorSlideBg, group: 'branding' },
        { key: 'colorArrow', value: settings.colorArrow, group: 'branding' },
        { key: 'colorScrollbar', value: settings.colorScrollbar, group: 'branding' },
        { key: 'colorFooterBg', value: settings.colorFooterBg, group: 'branding' },
        { key: 'colorTextBase', value: settings.colorTextBase, group: 'branding' },
        { key: 'colorTextMuted', value: settings.colorTextMuted, group: 'branding' },
        { key: 'colorPageBg', value: settings.colorPageBg, group: 'branding' },
        { key: 'colorAdminSidebar', value: settings.colorAdminSidebar, group: 'branding' },
        { key: 'colorHeroOverlayStart', value: settings.colorHeroOverlayStart, group: 'branding' },
        { key: 'colorHeroOverlayEnd', value: settings.colorHeroOverlayEnd, group: 'branding' },
        { key: 'footerTaglineEn', value: settings.footerTaglineEn, group: 'general' },
        { key: 'footerTaglineAr', value: settings.footerTaglineAr, group: 'general' },
      ]
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'branding', label: 'Branding' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'social', label: 'Social Media' },
    { id: 'stats', label: 'Strength Stats' },
  ]

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#009B91]" />
      </div>
    )
  }

  const Field = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    type?: string
    placeholder?: string
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-brand"
      />
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your website configuration</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}
      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">Settings saved successfully!</div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? 'border-[#009B91] text-[#009B91]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {tab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Site Name (English)" value={settings.siteNameEn} onChange={(v) => set('siteNameEn', v)} />
              <Field label="Site Name (Arabic)" value={settings.siteNameAr} onChange={(v) => set('siteNameAr', v)} />
              <Field label="Tagline (English)" value={settings.taglineEn} onChange={(v) => set('taglineEn', v)} />
              <Field label="Tagline (Arabic)" value={settings.taglineAr} onChange={(v) => set('taglineAr', v)} />
              <Field label="Address (English)" value={settings.addressEn} onChange={(v) => set('addressEn', v)} />
              <Field label="Address (Arabic)" value={settings.addressAr} onChange={(v) => set('addressAr', v)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Language</label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => set('defaultLanguage', e.target.value)}
                className="input-brand max-w-xs"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                <ImageUpload
                  value={settings.logoUrl}
                  onChange={(url) => set('logoUrl', url)}
                  label="Upload Logo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                <ImageUpload
                  value={settings.faviconUrl}
                  onChange={(url) => set('faviconUrl', url)}
                  label="Upload Favicon"
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'branding' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Customize your site's color palette. Changes apply globally to all pages.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Color (Teal)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.colorPrimary}
                    onChange={(e) => set('colorPrimary', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.colorPrimary}
                    onChange={(e) => set('colorPrimary', e.target.value)}
                    placeholder="#009B91"
                    className="input-brand flex-1"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Used for buttons, accents, highlights</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Secondary Color (Forest)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.colorForest}
                    onChange={(e) => set('colorForest', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.colorForest}
                    onChange={(e) => set('colorForest', e.target.value)}
                    placeholder="#0B4D32"
                    className="input-brand flex-1"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Used for dark backgrounds, footer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Header Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.colorHeader} onChange={(e) => set('colorHeader', e.target.value)} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={settings.colorHeader} onChange={(e) => set('colorHeader', e.target.value)} placeholder="#07190F" className="input-brand flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.colorButton} onChange={(e) => set('colorButton', e.target.value)} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={settings.colorButton} onChange={(e) => set('colorButton', e.target.value)} placeholder="#009B91" className="input-brand flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slide Background</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.colorSlideBg} onChange={(e) => set('colorSlideBg', e.target.value)} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={settings.colorSlideBg} onChange={(e) => set('colorSlideBg', e.target.value)} placeholder="#ffffff" className="input-brand flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slider Arrows</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.colorArrow} onChange={(e) => set('colorArrow', e.target.value)} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={settings.colorArrow} onChange={(e) => set('colorArrow', e.target.value)} placeholder="#475569" className="input-brand flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Scrollbar Thumb</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.colorScrollbar} onChange={(e) => set('colorScrollbar', e.target.value)} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={settings.colorScrollbar} onChange={(e) => set('colorScrollbar', e.target.value)} placeholder="#009B91" className="input-brand flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Footer Background</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.colorFooterBg} onChange={(e) => set('colorFooterBg', e.target.value)} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={settings.colorFooterBg} onChange={(e) => set('colorFooterBg', e.target.value)} placeholder="#0B4D32" className="input-brand flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Page Background</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.colorPageBg} onChange={(e) => set('colorPageBg', e.target.value)} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={settings.colorPageBg} onChange={(e) => set('colorPageBg', e.target.value)} placeholder="#ffffff" className="input-brand flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Main Text Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.colorTextBase} onChange={(e) => set('colorTextBase', e.target.value)} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={settings.colorTextBase} onChange={(e) => set('colorTextBase', e.target.value)} placeholder="#0f172a" className="input-brand flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Muted Text Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.colorTextMuted} onChange={(e) => set('colorTextMuted', e.target.value)} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={settings.colorTextMuted} onChange={(e) => set('colorTextMuted', e.target.value)} placeholder="#64748b" className="input-brand flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Sidebar</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.colorAdminSidebar} onChange={(e) => set('colorAdminSidebar', e.target.value)} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={settings.colorAdminSidebar} onChange={(e) => set('colorAdminSidebar', e.target.value)} placeholder="#0B4D32" className="input-brand flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hero Overlay Start</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.colorHeroOverlayStart} onChange={(e) => set('colorHeroOverlayStart', e.target.value)} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={settings.colorHeroOverlayStart} onChange={(e) => set('colorHeroOverlayStart', e.target.value)} placeholder="#0B4D32" className="input-brand flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hero Overlay End</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.colorHeroOverlayEnd} onChange={(e) => set('colorHeroOverlayEnd', e.target.value)} className="w-12 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input type="text" value={settings.colorHeroOverlayEnd} onChange={(e) => set('colorHeroOverlayEnd', e.target.value)} placeholder="#009B91" className="input-brand flex-1" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 mt-6">
              <p className="text-xs font-medium text-gray-600 mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <div className="w-24 h-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${settings.colorForest}, ${settings.colorPrimary})` }} />
                <span className="text-xs text-gray-500">Brand Gradient</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <Field label="Footer Tagline (English)" value={settings.footerTaglineEn} onChange={(v) => set('footerTaglineEn', v)} placeholder="Growth Accelerated" />
              <Field label="Footer Tagline (Arabic)" value={settings.footerTaglineAr} onChange={(v) => set('footerTaglineAr', v)} placeholder="نمو متسارع" />
            </div>
          </div>
        )}

        {tab === 'contact' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone" value={settings.phone} onChange={(v) => set('phone', v)} placeholder="+1 234 567 8900" />
            <Field label="Email" value={settings.email} onChange={(v) => set('email', v)} type="email" placeholder="info@profranchise.com" />
            <Field label="WhatsApp" value={settings.whatsapp} onChange={(v) => set('whatsapp', v)} placeholder="+1 234 567 8900" />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Map Embed URL</label>
              <textarea
                value={settings.mapEmbedUrl}
                onChange={(e) => set('mapEmbedUrl', e.target.value)}
                rows={3}
                placeholder="Paste Google Maps embed URL or iframe src"
                className="input-brand resize-none"
              />
            </div>
          </div>
        )}

        {tab === 'social' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="LinkedIn URL" value={settings.linkedIn} onChange={(v) => set('linkedIn', v)} type="url" placeholder="https://linkedin.com/company/..." />
            <Field label="Instagram URL" value={settings.instagram} onChange={(v) => set('instagram', v)} type="url" placeholder="https://instagram.com/..." />
            <Field label="Twitter / X URL" value={settings.twitter} onChange={(v) => set('twitter', v)} type="url" placeholder="https://x.com/..." />
            <Field label="Facebook URL" value={settings.facebook} onChange={(v) => set('facebook', v)} type="url" placeholder="https://facebook.com/..." />
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Configure the 4 strength stats shown on the homepage.</p>
            {([1, 2, 3, 4] as const).map((n) => (
              <div key={n} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">Stat Block {n}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field
                    label="Number / Value"
                    value={settings[`stat${n}Number`]}
                    onChange={(v) => set(`stat${n}Number`, v)}
                    placeholder="200+"
                  />
                  <Field
                    label="Label (English)"
                    value={settings[`stat${n}LabelEn`]}
                    onChange={(v) => set(`stat${n}LabelEn`, v)}
                    placeholder="Franchise Brands"
                  />
                  <Field
                    label="Label (Arabic)"
                    value={settings[`stat${n}LabelAr`]}
                    onChange={(v) => set(`stat${n}LabelAr`, v)}
                    placeholder="علامة فرانشايز"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
