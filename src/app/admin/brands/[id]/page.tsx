'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Plus, Trash2, ArrowLeft, Search, X, Pencil } from 'lucide-react'
import ImageUpload from '@/components/admin/ImageUpload'
import Link from 'next/link'

interface BrandLocation {
  id?: string
  cityEn: string
  cityAr: string
  areaEn: string
  areaAr: string
  typeEn: string
  typeAr: string
  lat?: number | null
  lng?: number | null
  googleMapsUrl?: string | null
  order: number
  _new?: boolean
  _deleted?: boolean
}

interface Contact {
  id: string
  nameEn: string
  nameAr: string
  title: string
  email: string
  phone: string
  role?: string
}

interface Brand {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  logoUrl: string | null
  displayOnWeb: boolean
  order: number
  netWorthEn: string
  netWorthAr: string
  liquidCapitalEn: string
  liquidCapitalAr: string
  experienceEn: string
  experienceAr: string
  siteProfileEn: string
  siteProfileAr: string
  whyPointsEn: string
  whyPointsAr: string
  locations: BrandLocation[]
  contacts: { contact: Contact }[]
}

type Tab = 'info' | 'requirements' | 'locations' | 'contacts'

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [tab, setTab] = useState<Tab>('info')

  // Info form
  const [info, setInfo] = useState({
    nameEn: '', nameAr: '', slug: '', descriptionEn: '', descriptionAr: '',
    logoUrl: '', displayOnWeb: true, order: 0,
  })

  // Requirements form
  const [req, setReq] = useState({
    netWorthEn: '', netWorthAr: '', liquidCapitalEn: '', liquidCapitalAr: '',
    experienceEn: '', experienceAr: '', siteProfileEn: '', siteProfileAr: '',
    whyPointsEn: [] as string[], whyPointsAr: [] as string[],
  })

  // Locations
  const [locations, setLocations] = useState<BrandLocation[]>([])
  const [newLocation, setNewLocation] = useState<BrandLocation>({
    cityEn: '', cityAr: '', areaEn: '', areaAr: '', typeEn: '', typeAr: '', 
    lat: null, lng: null, googleMapsUrl: '', order: 0,
  })
  const [addingLocation, setAddingLocation] = useState(false)
  const [editingLocation, setEditingLocation] = useState<BrandLocation | null>(null)
  const [editForm, setEditForm] = useState<BrandLocation | null>(null)

  // Contacts
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactSearch, setContactSearch] = useState('')
  const [contactResults, setContactResults] = useState<Contact[]>([])
  const [searchingContacts, setSearchingContacts] = useState(false)
  const [contactRole, setContactRole] = useState('')
  const [showNewContactForm, setShowNewContactForm] = useState(false)
  const [newContact, setNewContact] = useState({ nameEn: '', email: '', phone: '', role: '' })
  const [creatingContact, setCreatingContact] = useState(false)

  const refetchContacts = useCallback(async () => {
    try {
      const res = await fetch(`/api/brands/${id}/contacts`)
      if (res.ok) {
        const data = await res.json()
        setContacts(Array.isArray(data) ? data : [])
      }
    } catch {}
  }, [id])

  useEffect(() => {
    fetchBrand()
  }, [id])

  const fetchBrand = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/brands/${id}`)
      if (!res.ok) throw new Error('Not found')
      const data: Brand = await res.json()
      setBrand(data)
      setInfo({
        nameEn: data.nameEn, nameAr: data.nameAr, slug: data.slug,
        descriptionEn: data.descriptionEn, descriptionAr: data.descriptionAr,
        logoUrl: data.logoUrl ?? '', displayOnWeb: data.displayOnWeb, order: data.order,
      })
      setReq({
        netWorthEn: data.netWorthEn, netWorthAr: data.netWorthAr,
        liquidCapitalEn: data.liquidCapitalEn, liquidCapitalAr: data.liquidCapitalAr,
        experienceEn: data.experienceEn, experienceAr: data.experienceAr,
        siteProfileEn: data.siteProfileEn, siteProfileAr: data.siteProfileAr,
        whyPointsEn: safeParseArray(data.whyPointsEn),
        whyPointsAr: safeParseArray(data.whyPointsAr),
      })
      setLocations(data.locations)
      // Fetch contacts with role via dedicated endpoint
      const cRes = await fetch(`/api/brands/${id}/contacts`)
      if (cRes.ok) {
        const cData = await cRes.json()
        setContacts(Array.isArray(cData) ? cData : [])
      } else {
        setContacts(data.contacts.map((bc: { contact: Contact }) => bc.contact))
      }
    } catch {
      setError('Failed to load brand')
    } finally {
      setLoading(false)
    }
  }

  const safeParseArray = (str: string): string[] => {
    try { return JSON.parse(str) } catch { return [] }
  }

  const showSaved = (msg = 'Saved!') => {
    setSaved(msg)
    setTimeout(() => setSaved(''), 3000)
  }

  const saveInfo = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Save failed')
      }
      showSaved('Info saved!')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const saveRequirements = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...req,
          whyPointsEn: JSON.stringify(req.whyPointsEn),
          whyPointsAr: JSON.stringify(req.whyPointsAr),
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      showSaved('Requirements saved!')
    } catch {
      setError('Failed to save requirements')
    } finally {
      setSaving(false)
    }
  }

  const addLocation = async () => {
    if (!newLocation.cityEn || !newLocation.cityAr) {
      setError('City (EN) and City (AR) are required')
      return
    }
    try {
      const res = await fetch(`/api/brands/${id}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newLocation, order: locations.length }),
      })
      if (!res.ok) throw new Error('Failed to add location')
      const loc = await res.json()
      setLocations((prev) => [...prev, loc])
      setNewLocation({ 
        cityEn: '', cityAr: '', areaEn: '', areaAr: '', typeEn: '', typeAr: '', 
        lat: null, lng: null, googleMapsUrl: '', order: 0 
      })
      setAddingLocation(false)
      showSaved('Location added!')
    } catch {
      setError('Failed to add location')
    }
  }

  const startEdit = (loc: BrandLocation) => {
    setEditingLocation(loc)
    setEditForm({ ...loc })
  }

  const updateLocation = async () => {
    if (!editForm || !editingLocation) return
    try {
      const res = await fetch(`/api/brands/${id}/locations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, locationId: editingLocation.id }),
      })
      if (!res.ok) throw new Error('Failed to update location')
      const loc = await res.json()
      setLocations((prev) => prev.map((l) => (l.id === loc.id ? loc : l)))
      setEditingLocation(null)
      setEditForm(null)
      showSaved('Location updated!')
    } catch {
      setError('Failed to update location')
    }
  }

  const deleteLocation = async (locId: string) => {
    if (!window.confirm('Delete this location?')) return
    try {
      const res = await fetch(`/api/brands/${id}/locations?locationId=${locId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setLocations((prev) => prev.filter((l) => l.id !== locId))
    } catch {
      setError('Failed to delete location')
    }
  }

  const searchContacts = async (q: string) => {
    setContactSearch(q)
    if (q.length < 2) { setContactResults([]); return }
    setSearchingContacts(true)
    try {
      const res = await fetch(`/api/contacts?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setContactResults(Array.isArray(data) ? data.filter((c: Contact) => !contacts.find((lc) => lc.id === c.id)) : [])
    } catch {
      setContactResults([])
    } finally {
      setSearchingContacts(false)
    }
  }

  const linkContact = async (contactId: string) => {
    try {
      const res = await fetch(`/api/brands/${id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, role: contactRole }),
      })
      if (!res.ok) throw new Error('Link failed')
      const contact = await res.json()
      setContacts((prev) => [...prev, contact])
      setContactSearch('')
      setContactResults([])
      setContactRole('')
    } catch {
      setError('Failed to link contact')
    }
  }

  const createAndLinkContact = async () => {
    if (!newContact.nameEn.trim()) { setError('Name is required'); return }
    setCreatingContact(true)
    try {
      const res = await fetch(`/api/brands/${id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn: newContact.nameEn,
          email: newContact.email,
          phone: newContact.phone,
          role: newContact.role,
        }),
      })
      if (!res.ok) throw new Error('Create failed')
      await refetchContacts()
      setNewContact({ nameEn: '', email: '', phone: '', role: '' })
      setShowNewContactForm(false)
      showSaved('Contact created and linked!')
    } catch {
      setError('Failed to create contact')
    } finally {
      setCreatingContact(false)
    }
  }

  const unlinkContact = async (contactId: string) => {
    if (!window.confirm('Unlink this contact from brand?')) return
    try {
      const res = await fetch(`/api/brands/${id}/contacts?contactId=${contactId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Unlink failed')
      setContacts((prev) => prev.filter((c) => c.id !== contactId))
    } catch {
      setError('Failed to unlink contact')
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#009B91]" />
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="p-6">
        <p className="text-red-500">Brand not found.</p>
        <Link href="/admin/brands" className="text-[#009B91] text-sm mt-2 block">← Back to Brands</Link>
      </div>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Info' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'locations', label: `Locations (${locations.length})` },
    { id: 'contacts', label: `Contacts (${contacts.length})` },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/brands" className="hover:text-gray-700 flex items-center gap-1">
          <ArrowLeft size={14} /> Brands
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{brand.nameEn}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {brand.logoUrl && (
            <img src={brand.logoUrl} alt={brand.nameEn} className="h-12 w-12 object-contain rounded-lg border border-gray-200" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{brand.nameEn}</h1>
            <p className="text-sm text-gray-500">{brand.slug}</p>
          </div>
        </div>
        {(tab === 'info' || tab === 'requirements') && (
          <button
            onClick={tab === 'info' ? saveInfo : saveRequirements}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        )}
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
      {saved && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">{saved}</div>}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id ? 'border-[#009B91] text-[#009B91]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Info Tab */}
        {tab === 'info' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name (English) *</label>
                <input
                  value={info.nameEn}
                  onChange={(e) => setInfo((p) => ({ ...p, nameEn: e.target.value }))}
                  className="input-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name (Arabic) *</label>
                <input value={info.nameAr} onChange={(e) => setInfo((p) => ({ ...p, nameAr: e.target.value }))} className="input-brand" dir="rtl" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
              <input
                value={info.slug}
                onChange={(e) => setInfo((p) => ({ ...p, slug: slugify(e.target.value) }))}
                className="input-brand"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (English)</label>
                <textarea
                  value={info.descriptionEn}
                  onChange={(e) => setInfo((p) => ({ ...p, descriptionEn: e.target.value }))}
                  rows={4}
                  className="input-brand resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Arabic)</label>
                <textarea
                  value={info.descriptionAr}
                  onChange={(e) => setInfo((p) => ({ ...p, descriptionAr: e.target.value }))}
                  rows={4}
                  className="input-brand resize-none"
                  dir="rtl"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <ImageUpload value={info.logoUrl} onChange={(url) => setInfo((p) => ({ ...p, logoUrl: url }))} label="Upload Logo" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
                <input
                  type="number"
                  value={info.order}
                  onChange={(e) => setInfo((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                  className="input-brand"
                />
              </div>
              <div className="flex items-center pb-1">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={info.displayOnWeb}
                    onChange={(e) => setInfo((p) => ({ ...p, displayOnWeb: e.target.checked }))}
                    className="rounded w-4 h-4"
                  />
                  Display on Website
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Requirements Tab */}
        {tab === 'requirements' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { keyEn: 'netWorthEn', keyAr: 'netWorthAr', label: 'Net Worth' },
                { keyEn: 'liquidCapitalEn', keyAr: 'liquidCapitalAr', label: 'Liquid Capital' },
                { keyEn: 'experienceEn', keyAr: 'experienceAr', label: 'Experience' },
                { keyEn: 'siteProfileEn', keyAr: 'siteProfileAr', label: 'Site Profile' },
              ].map((field) => (
                <>
                  <div key={field.keyEn}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label} (EN)</label>
                    <input
                      value={req[field.keyEn as keyof typeof req] as string}
                      onChange={(e) => setReq((p) => ({ ...p, [field.keyEn]: e.target.value }))}
                      className="input-brand"
                    />
                  </div>
                  <div key={field.keyAr}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label} (AR)</label>
                    <input
                      value={req[field.keyAr as keyof typeof req] as string}
                      onChange={(e) => setReq((p) => ({ ...p, [field.keyAr]: e.target.value }))}
                      className="input-brand"
                      dir="rtl"
                    />
                  </div>
                </>
              ))}
            </div>

            {/* Why Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(['whyPointsEn', 'whyPointsAr'] as const).map((key) => {
                const isAr = key === 'whyPointsAr'
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Why Points ({isAr ? 'AR' : 'EN'})</label>
                      <button
                        onClick={() => setReq((p) => ({ ...p, [key]: [...p[key], ''] }))}
                        className="text-xs text-[#009B91] hover:text-[#007a71] flex items-center gap-1"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {req[key].map((pt, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            value={pt}
                            onChange={(e) => {
                              const arr = [...req[key]]
                              arr[i] = e.target.value
                              setReq((p) => ({ ...p, [key]: arr }))
                            }}
                            className="input-brand text-sm"
                            dir={isAr ? 'rtl' : 'ltr'}
                            placeholder={`Point ${i + 1}`}
                          />
                          <button
                            onClick={() => setReq((p) => ({ ...p, [key]: p[key].filter((_, j) => j !== i) }))}
                            className="text-gray-400 hover:text-red-500 flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {req[key].length === 0 && (
                        <p className="text-xs text-gray-400">No points yet. Click &quot;Add&quot; to add one.</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Locations Tab */}
        {tab === 'locations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">Branch Locations</h2>
              <button
                onClick={() => setAddingLocation(true)}
                className="flex items-center gap-1.5 text-sm text-[#009B91] hover:text-[#007a71] font-medium"
              >
                <Plus size={14} /> Add Location
              </button>
            </div>

            {addingLocation && (
              <div className="border border-[#009B91]/30 bg-teal-50/30 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-700">New Location</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'cityEn', label: 'City (EN)' },
                    { key: 'cityAr', label: 'City (AR)', rtl: true },
                    { key: 'areaEn', label: 'Area (EN)' },
                    { key: 'areaAr', label: 'Area (AR)', rtl: true },
                    { key: 'typeEn', label: 'Type (EN)' },
                    { key: 'typeAr', label: 'Type (AR)', rtl: true },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                      <input
                        value={newLocation[f.key as keyof BrandLocation] as string || ''}
                        onChange={(e) => setNewLocation((p) => ({ ...p, [f.key]: e.target.value }))}
                        className="input-brand text-sm py-1.5"
                        dir={f.rtl ? 'rtl' : 'ltr'}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lat (Optional)</label>
                    <input
                      type="number" step="any"
                      value={newLocation.lat || ''}
                      onChange={(e) => setNewLocation((p) => ({ ...p, lat: parseFloat(e.target.value) || null }))}
                      className="input-brand text-sm py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lng (Optional)</label>
                    <input
                      type="number" step="any"
                      value={newLocation.lng || ''}
                      onChange={(e) => setNewLocation((p) => ({ ...p, lng: parseFloat(e.target.value) || null }))}
                      className="input-brand text-sm py-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Google Maps URL</label>
                    <input
                      value={newLocation.googleMapsUrl || ''}
                      onChange={(e) => setNewLocation((p) => ({ ...p, googleMapsUrl: e.target.value }))}
                      className="input-brand text-sm py-1.5"
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={addLocation} className="btn-primary py-1.5 text-sm">
                    <Plus size={14} /> Add
                  </button>
                  <button onClick={() => setAddingLocation(false)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {locations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No locations added yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">City</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Area</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Type</th>
                    <th className="px-3 py-2 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {locations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <span>{loc.cityEn}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-gray-500" dir="rtl">{loc.cityAr}</span>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{loc.areaEn}</td>
                      <td className="px-3 py-2 text-gray-600">
                        <div>{loc.typeEn}</div>
                        {(loc.lat || loc.lng || loc.googleMapsUrl) && (
                          <div className="text-[10px] text-[#009B91] font-medium mt-0.5">
                            {loc.lat && `Lat: ${loc.lat.toFixed(4)} `}
                            {loc.lng && `Lng: ${loc.lng.toFixed(4)} `}
                            {loc.googleMapsUrl && "· Has Map Link"}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startEdit(loc)}
                            className="text-gray-400 hover:text-[#009B91]"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => loc.id && deleteLocation(loc.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {editingLocation && editForm && (
              <div className="border border-[#009B91]/30 bg-[#009B91]/5 rounded-lg p-4 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Edit Location: {editingLocation.cityEn}</h3>
                  <button onClick={() => { setEditingLocation(null); setEditForm(null); }} className="text-gray-400"><X size={16} /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'cityEn', label: 'City (EN)' },
                    { key: 'cityAr', label: 'City (AR)', rtl: true },
                    { key: 'areaEn', label: 'Area (EN)' },
                    { key: 'areaAr', label: 'Area (AR)', rtl: true },
                    { key: 'typeEn', label: 'Type (EN)' },
                    { key: 'typeAr', label: 'Type (AR)', rtl: true },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                      <input
                        value={editForm[f.key as keyof BrandLocation] as string || ''}
                        onChange={(e) => setEditForm((p) => ({ ...p!, [f.key]: e.target.value }))}
                        className="input-brand text-sm py-1.5"
                        dir={f.rtl ? 'rtl' : 'ltr'}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lat</label>
                    <input
                      type="number" step="any"
                      value={editForm.lat || ''}
                      onChange={(e) => setEditForm((p) => ({ ...p!, lat: parseFloat(e.target.value) || null }))}
                      className="input-brand text-sm py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lng</label>
                    <input
                      type="number" step="any"
                      value={editForm.lng || ''}
                      onChange={(e) => setEditForm((p) => ({ ...p!, lng: parseFloat(e.target.value) || null }))}
                      className="input-brand text-sm py-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Google Maps URL</label>
                    <input
                      value={editForm.googleMapsUrl || ''}
                      onChange={(e) => setEditForm((p) => ({ ...p!, googleMapsUrl: e.target.value }))}
                      className="input-brand text-sm py-1.5"
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={updateLocation} className="btn-primary py-1.5 text-sm">
                    <Save size={14} /> Update
                  </button>
                  <button onClick={() => { setEditingLocation(null); setEditForm(null); }} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contacts Tab */}
        {tab === 'contacts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">Linked Contacts</h2>
              <button
                onClick={() => setShowNewContactForm(v => !v)}
                className="flex items-center gap-1.5 text-sm text-[#009B91] hover:text-[#007a71] font-medium"
              >
                <Plus size={14} /> New Contact
              </button>
            </div>

            {/* Create new contact inline form */}
            {showNewContactForm && (
              <div className="border border-[#009B91]/30 bg-teal-50/30 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Create &amp; Link New Contact</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name (EN) *</label>
                    <input
                      value={newContact.nameEn}
                      onChange={e => setNewContact(p => ({ ...p, nameEn: e.target.value }))}
                      className="input-brand text-sm py-1.5"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Role at this Brand</label>
                    <input
                      value={newContact.role}
                      onChange={e => setNewContact(p => ({ ...p, role: e.target.value }))}
                      className="input-brand text-sm py-1.5"
                      placeholder="e.g. Operations Manager"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={newContact.email}
                      onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))}
                      className="input-brand text-sm py-1.5"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newContact.phone}
                      onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))}
                      className="input-brand text-sm py-1.5"
                      placeholder="+966 5x xxx xxxx"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={createAndLinkContact} disabled={creatingContact} className="btn-primary py-1.5 text-sm flex items-center gap-1.5">
                    {creatingContact ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Create &amp; Link
                  </button>
                  <button onClick={() => setShowNewContactForm(false)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Search & link existing */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={contactSearch}
                    onChange={(e) => searchContacts(e.target.value)}
                    placeholder="Search existing contacts by name or email..."
                    className="input-brand pl-8 text-sm"
                  />
                </div>
                <input
                  value={contactRole}
                  onChange={e => setContactRole(e.target.value)}
                  placeholder="Role (optional)"
                  className="input-brand text-sm w-40"
                />
                {searchingContacts && <Loader2 size={16} className="animate-spin text-[#009B91] self-center" />}
              </div>
              {contactResults.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-[10.5rem] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {contactResults.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => linkContact(c.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left text-sm"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#009B91]/10 flex items-center justify-center text-[#009B91] text-xs font-medium">
                        {c.nameEn.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{c.nameEn}</p>
                        <p className="text-xs text-gray-400">{c.email || c.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {contacts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No contacts linked. Search above to link contacts or create a new one.</p>
            ) : (
              <div className="space-y-2">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#009B91]/10 flex items-center justify-center text-[#009B91] text-sm font-semibold">
                        {c.nameEn.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{c.nameEn}</p>
                        <p className="text-xs text-gray-400">{c.title}{c.email ? ` · ${c.email}` : ''}</p>
                        {c.role && <p className="text-xs text-[#009B91] mt-0.5">{c.role}</p>}
                      </div>
                    </div>
                    <button onClick={() => unlinkContact(c.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
