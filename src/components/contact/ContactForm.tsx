'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

type FormValues = {
  fullName: string
  email: string
  phone: string
  company: string
  inquiryType: string
  message: string
}

type InquiryOption = { value: string; label: string }

const FALLBACK_OPTIONS: InquiryOption[] = [
  { value: 'INVESTOR',        label: 'I am an Investor' },
  { value: 'BRAND_OWNER',     label: 'I own a Brand' },
  { value: 'VENDOR_SUPPLIER', label: 'I am a Vendor / Supplier' },
  { value: 'GENERAL',         label: 'General Inquiry' },
]

export default function ContactForm({ inquiryOptions }: { inquiryOptions?: InquiryOption[] }) {
  const t = useTranslations('contact.form')
  const options = (inquiryOptions && inquiryOptions.length > 0) ? inquiryOptions : FALLBACK_OPTIONS
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { inquiryType: 'GENERAL' } })

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function onSubmit(values: FormValues) {
    setStatus('loading')
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <CheckCircle2 size={52} className="text-[#009B91]" />
        <p className="text-lg font-semibold text-slate-900">{t('success')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('fullName')} *
          </label>
          <input
            {...register('fullName', { required: true })}
            className="input-brand"
          />
          {errors.fullName && <p className="text-xs text-red-500 mt-1">Required</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('email')} *
          </label>
          <input
            {...register('email', {
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            })}
            type="email"
            className="input-brand"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">Valid email required</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('phone')}
          </label>
          <input {...register('phone')} type="tel" className="input-brand" />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('company')}
          </label>
          <input {...register('company')} className="input-brand" />
        </div>
      </div>

      {/* Inquiry Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {t('inquiryType')} *
        </label>
        <select
          {...register('inquiryType', { required: true })}
          className="input-brand"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {t('message')} *
        </label>
        <textarea
          {...register('message', { required: true, minLength: 10 })}
          rows={5}
          className="input-brand resize-none"
        />
        {errors.message && <p className="text-xs text-red-500 mt-1">Please write a message (min 10 chars)</p>}
      </div>

      {/* Error */}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">
          <AlertCircle size={16} />
          {t('error')}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full justify-center"
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </button>
    </form>
  )
}
