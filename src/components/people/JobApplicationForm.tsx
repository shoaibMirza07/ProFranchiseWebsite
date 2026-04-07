'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

type FormValues = {
  fullName: string
  email: string
  phone: string
  nationality: string
  gender: string
  jobAppliedFor: string
  experience: string
  companiesWorked: string
  cv: FileList
}

export default function JobApplicationForm() {
  const t = useTranslations('people.careers.form')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function onSubmit(values: FormValues) {
    setStatus('loading')
    try {
      let cvUrl: string | undefined

      // Upload CV if provided
      if (values.cv?.[0]) {
        const fd = new FormData()
        fd.append('file', values.cv[0])
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (res.ok) {
          const data = await res.json()
          cvUrl = data.url
        }
      }

      // Submit application
      const res = await fetch('/api/public/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          nationality: values.nationality,
          gender: values.gender.toUpperCase() || 'UNSPECIFIED',
          jobAppliedFor: values.jobAppliedFor,
          experience: values.experience,
          companiesWorked: values.companiesWorked,
          cvUrl,
        }),
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
        <CheckCircle2 size={48} className="text-[#009B91]" />
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

        {/* Nationality */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('nationality')}
          </label>
          <input {...register('nationality')} className="input-brand" />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('gender')}
          </label>
          <select {...register('gender')} className="input-brand">
            <option value="MALE">{t('genderMale')}</option>
            <option value="FEMALE">{t('genderFemale')}</option>
            <option value="UNSPECIFIED">{t('genderOther')}</option>
          </select>
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t('jobAppliedFor')} *
          </label>
          <input
            {...register('jobAppliedFor', { required: true })}
            className="input-brand"
          />
          {errors.jobAppliedFor && <p className="text-xs text-red-500 mt-1">Required</p>}
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {t('experience')}
        </label>
        <textarea
          {...register('experience')}
          rows={4}
          className="input-brand resize-none"
        />
      </div>

      {/* Companies */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {t('companiesWorked')}
        </label>
        <input {...register('companiesWorked')} className="input-brand" />
      </div>

      {/* CV Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {t('cvUpload')}
        </label>
        <div className="relative">
          <input
            {...register('cv')}
            type="file"
            accept=".pdf,.doc,.docx"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <div className="input-brand flex items-center gap-2 text-slate-400 cursor-pointer hover:border-[#009B91] transition-colors">
            <Upload size={16} />
            <span className="text-sm">Choose file...</span>
          </div>
        </div>
      </div>

      {/* Error message */}
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
