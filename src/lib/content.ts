/**
 * CMS content helpers — all page text comes from the database.
 * Server components call these to get bilingual section content.
 */
import { prisma } from './prisma'

export type SectionContent = Record<string, unknown>

/** Load all sections for a page slug, keyed by section type */
export async function getPageSections(slug: string, locale: string): Promise<Record<string, SectionContent>> {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: { sections: { where: { isVisible: true }, orderBy: { order: 'asc' } } }
  })
  if (!page) return {}

  const result: Record<string, SectionContent> = {}
  for (const section of page.sections) {
    try {
      const raw = locale === 'ar' ? section.contentAr : section.contentEn
      result[section.type] = JSON.parse(raw || '{}')
    } catch {
      result[section.type] = {}
    }
  }
  return result
}

/** Load all sections for a page as an ordered list of { type, content } */
export async function getPageSectionsOrdered(slug: string, locale: string): Promise<{ id: string; type: string; content: SectionContent }[]> {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: { sections: { where: { isVisible: true }, orderBy: { order: 'asc' } } }
  })
  if (!page) return []

  return page.sections.map(section => {
    let content: SectionContent = {}
    try {
      const raw = locale === 'ar' ? section.contentAr : section.contentEn
      content = JSON.parse(raw || '{}')
    } catch {
      content = {}
    }
    return { id: section.id, type: section.type, content }
  })
}

/** Shorthand to get a single section's content */
export async function getSectionContent(slug: string, type: string, locale: string): Promise<SectionContent> {
  const sections = await getPageSections(slug, locale)
  return sections[type] ?? {}
}

/** Load all site settings as a flat key→value map */
export async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany()
  const map: Record<string, string> = {}
  for (const r of rows) map[r.key] = r.value
  return map
}

/** Safe string getter from section content */
export function str(content: SectionContent, key: string, fallback = ''): string {
  const v = content[key]
  return typeof v === 'string' ? v : fallback
}

/** Safe array getter from section content */
export function arr<T>(content: SectionContent, key: string): T[] {
  const v = content[key]
  return Array.isArray(v) ? (v as T[]) : []
}

/** Safe object getter from section content */
export function obj(content: SectionContent, key: string): Record<string, unknown> {
  const v = content[key]
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
}
