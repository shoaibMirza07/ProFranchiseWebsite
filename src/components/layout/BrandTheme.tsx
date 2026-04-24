import { prisma } from '@/lib/prisma'

/**
 * Injects brand color CSS variables from the Settings table at request time.
 * This allows admins to change colors without redeploying.
 */
export default async function BrandTheme() {
  let colorPrimary = '#009B91'
  let colorForest = '#0B4D32'
  let colorHeader = '#07190F'
  let colorButton = '#009B91'
  let colorSlideBg = '#ffffff'
  let colorArrow = '#475569'
  let colorScrollbar = '#009B91'
  let colorFooterBg = '#0B4D32'
  let colorPageBg = '#ffffff'
  let colorTextBase = '#0f172a'
  let colorTextMuted = '#64748b'
  let colorAdminSidebar = '#0B4D32'
  let colorHeroOverlayStart = '#0B4D32'
  let colorHeroOverlayEnd = '#009B91'

  try {
    const keys = [
      'colorPrimary', 'colorForest', 'colorHeader', 'colorButton', 
      'colorSlideBg', 'colorArrow', 'colorScrollbar', 'colorFooterBg',
      'colorPageBg', 'colorTextBase', 'colorTextMuted', 'colorAdminSidebar',
      'colorHeroOverlayStart', 'colorHeroOverlayEnd'
    ]
    const rows = await prisma.setting.findMany({
      where: { key: { in: keys } },
    })
    for (const row of rows) {
      if (row.key === 'colorPrimary' && row.value) colorPrimary = row.value
      if (row.key === 'colorForest' && row.value) colorForest = row.value
      if (row.key === 'colorHeader' && row.value) colorHeader = row.value
      if (row.key === 'colorButton' && row.value) colorButton = row.value
      if (row.key === 'colorSlideBg' && row.value) colorSlideBg = row.value
      if (row.key === 'colorArrow' && row.value) colorArrow = row.value
      if (row.key === 'colorScrollbar' && row.value) colorScrollbar = row.value
      if (row.key === 'colorFooterBg' && row.value) colorFooterBg = row.value
      if (row.key === 'colorPageBg' && row.value) colorPageBg = row.value
      if (row.key === 'colorTextBase' && row.value) colorTextBase = row.value
      if (row.key === 'colorTextMuted' && row.value) colorTextMuted = row.value
      if (row.key === 'colorAdminSidebar' && row.value) colorAdminSidebar = row.value
      if (row.key === 'colorHeroOverlayStart' && row.value) colorHeroOverlayStart = row.value
      if (row.key === 'colorHeroOverlayEnd' && row.value) colorHeroOverlayEnd = row.value
    }
  } catch {
    // Use defaults if DB not available
  }

  // Derive additional shades
  const css = `
    :root {
      --color-teal: ${colorPrimary};
      --color-forest: ${colorForest};
      --color-teal-rgb: ${hexToRgb(colorPrimary)};
      --color-forest-rgb: ${hexToRgb(colorForest)};
      --color-header: ${colorHeader};
      --color-button: ${colorButton};
      --color-slide-bg: ${colorSlideBg};
      --color-arrow: ${colorArrow};
      --color-scrollbar: ${colorScrollbar};
      --color-header-rgb: ${hexToRgb(colorHeader)};
      --color-footer-bg: ${colorFooterBg};
      --color-page-bg: ${colorPageBg};
      --color-text-base: ${colorTextBase};
      --color-text-muted: ${colorTextMuted};
      --color-admin-sidebar: ${colorAdminSidebar};
      --color-hero-overlay-start-rgb: ${hexToRgb(colorHeroOverlayStart)};
      --color-hero-overlay-end-rgb: ${hexToRgb(colorHeroOverlayEnd)};
    }
  `.trim()

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return '0, 155, 145'
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}
