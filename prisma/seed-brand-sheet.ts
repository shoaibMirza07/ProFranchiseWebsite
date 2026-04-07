import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const page = await prisma.page.findUnique({ where: { slug: 'portfolio' } })
  if (!page) { console.log('No portfolio page'); return }

  const en = {
    back: 'Back to Portfolio', intro: 'Introduction', requirements: 'Minimum Requirements',
    requirementsSubtitle: 'To maintain the Blueprint of Success, all potential operators must meet the following criteria:',
    netWorth: 'Net Worth', liquidCapital: 'Liquid Capital', experience: 'Experience', siteProfile: 'Site Profile',
    locations: 'Branch Locations', locationsSubtitle: 'A snapshot of our current high-performance network:',
    city: 'City', area: 'Area', type: 'Type', why: 'Why This Brand?', investCta: 'Invest in This Brand'
  }
  const ar = {
    back: 'العودة إلى المحفظة', intro: 'المقدمة', requirements: 'الحد الأدنى للمتطلبات',
    requirementsSubtitle: 'للحفاظ على مخطط النجاح، يجب أن يستوفي جميع المشغلين المحتملين المعايير التالية:',
    netWorth: 'صافي الثروة', liquidCapital: 'رأس المال السائل', experience: 'الخبرة السابقة', siteProfile: 'ملف الموقع',
    locations: 'مواقع الفروع', locationsSubtitle: 'لمحة عن شبكتنا الحالية عالية الأداء:',
    city: 'المدينة', area: 'المنطقة', type: 'نوع الفرع', why: 'لماذا هذه العلامة التجارية؟', investCta: 'استثمر في هذه العلامة'
  }

  const existing = await prisma.pageSection.findFirst({ where: { pageId: page.id, type: 'brand_sheet' } })
  if (existing) {
    await prisma.pageSection.update({ where: { id: existing.id }, data: { contentEn: JSON.stringify(en), contentAr: JSON.stringify(ar) } })
  } else {
    await prisma.pageSection.create({ data: { pageId: page.id, type: 'brand_sheet', order: 1, isVisible: true, contentEn: JSON.stringify(en), contentAr: JSON.stringify(ar) } })
  }
  console.log('✅ brand_sheet labels seeded')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
