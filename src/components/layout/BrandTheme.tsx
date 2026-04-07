import { prisma } from '@/lib/prisma'

/**
 * Injects brand color CSS variables from the Settings table at request time.
 * This allows admins to change colors without redeploying.
 */
export default async function BrandTheme() {
  let colorPrimary = '#009B91'
  let colorForest = '#0B4D32'

  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: ['colorPrimary', 'colorForest'] } },
    })
    for (const row of rows) {
      if (row.key === 'colorPrimary' && row.value) colorPrimary = row.value
      if (row.key === 'colorForest' && row.value) colorForest = row.value
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
