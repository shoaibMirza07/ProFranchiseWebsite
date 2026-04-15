const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const sections = await prisma.pageSection.findMany({
    where: { type: 'gallery' },
    include: { page: true }
  })
  console.log('Gallery Sections Found:', sections.map(s => ({ pageSlug: s.page?.slug, visible: s.isVisible })))
  
  const allPages = await prisma.page.findMany({ select: { slug: true } })
  console.log('All Pages:', allPages.map(p => p.slug))
}

main().finally(() => prisma.$disconnect())
