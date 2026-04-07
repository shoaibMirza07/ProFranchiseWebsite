import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Admin User ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', 10)
  await prisma.user.upsert({
    where: { email: 'admin@profranchise.sa' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@profranchise.sa',
      password: adminPassword,
      role: 'ADMIN'
    }
  })
  console.log('✅ Admin user created: admin@profranchise.sa / Admin@1234')

  // ─── Settings ──────────────────────────────────────────────────────────────
  const settings = [
    { key: 'site_name_en', value: 'ProFranchise', group: 'general' },
    { key: 'site_name_ar', value: 'برو فرانشايز', group: 'general' },
    { key: 'tagline_en', value: 'Growth Accelerated', group: 'general' },
    { key: 'tagline_ar', value: 'النمو المتسارع', group: 'general' },
    { key: 'logo_url', value: '/uploads/profranchise-logo.png', group: 'general' },
    { key: 'address_en', value: 'Riyadh, Saudi Arabia', group: 'contact' },
    { key: 'address_ar', value: 'الرياض، المملكة العربية السعودية', group: 'contact' },
    { key: 'phone', value: '+966 11 000 0000', group: 'contact' },
    { key: 'email', value: 'info@profranchise.sa', group: 'contact' },
    { key: 'whatsapp', value: '+966500000000', group: 'contact' },
    { key: 'linkedin', value: 'https://linkedin.com/company/profranchise', group: 'social' },
    { key: 'stat_brands', value: '20+', group: 'stats' },
    { key: 'stat_brands_label_en', value: 'Franchise Brands', group: 'stats' },
    { key: 'stat_brands_label_ar', value: 'علامة تجارية', group: 'stats' },
    { key: 'stat_years', value: '10+', group: 'stats' },
    { key: 'stat_years_label_en', value: 'Years of Experience', group: 'stats' },
    { key: 'stat_years_label_ar', value: 'سنوات خبرة', group: 'stats' },
    { key: 'stat_countries', value: '5', group: 'stats' },
    { key: 'stat_countries_label_en', value: 'Countries', group: 'stats' },
    { key: 'stat_countries_label_ar', value: 'دول', group: 'stats' },
    { key: 'strength_1_number', value: '20+', group: 'strength' },
    { key: 'strength_1_label_en', value: 'Portfolio Brands', group: 'strength' },
    { key: 'strength_1_label_ar', value: 'علامة في المحفظة', group: 'strength' },
    { key: 'strength_2_number', value: '100+', group: 'strength' },
    { key: 'strength_2_label_en', value: 'Franchise Units', group: 'strength' },
    { key: 'strength_2_label_ar', value: 'وحدة امتياز', group: 'strength' },
    { key: 'strength_3_number', value: '5', group: 'strength' },
    { key: 'strength_3_label_en', value: 'Countries Active', group: 'strength' },
    { key: 'strength_3_label_ar', value: 'دول نشطة', group: 'strength' },
    { key: 'strength_4_number', value: '500M+', group: 'strength' },
    { key: 'strength_4_label_en', value: 'SAR Revenue Generated', group: 'strength' },
    { key: 'strength_4_label_ar', value: 'ريال إيرادات محققة', group: 'strength' },
    { key: 'cta_label_en', value: 'Invest With Us', group: 'header' },
    { key: 'cta_label_ar', value: 'استثمر معنا', group: 'header' },
    { key: 'cta_href', value: '/contact', group: 'header' },
    { key: 'footer_tagline_en', value: 'Engineering the blueprints of regional brand success.', group: 'footer' },
    { key: 'footer_tagline_ar', value: 'هندسة مخططات نجاح العلامات التجارية الإقليمية.', group: 'footer' },
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group },
      create: s
    })
  }
  console.log('✅ Settings seeded')

  // ─── Navigation ────────────────────────────────────────────────────────────
  const navItems = [
    { labelEn: 'Home', labelAr: 'الرئيسية', href: '/', order: 0 },
    { labelEn: 'About Us', labelAr: 'عنّا', href: '/about', order: 1 },
    { labelEn: 'Our Portfolio', labelAr: 'محفظتنا', href: '/portfolio', order: 2 },
    { labelEn: 'People', labelAr: 'فريقنا', href: '/people', order: 3 },
    { labelEn: 'Contact Us', labelAr: 'اتصل بنا', href: '/contact', order: 4 },
  ]

  // Clear and re-seed nav
  await prisma.navItem.deleteMany()
  for (const item of navItems) {
    await prisma.navItem.create({ data: item })
  }
  console.log('✅ Nav items seeded')

  // ─── Footer ────────────────────────────────────────────────────────────────
  await prisma.footerSection.deleteMany()

  await prisma.footerSection.create({
    data: {
      position: 'LEFT',
      titleEn: 'ProFranchise',
      titleAr: 'برو فرانشايز',
      links: { create: [] }
    }
  })

  const centerSection = await prisma.footerSection.create({
    data: {
      position: 'CENTER',
      titleEn: 'Quick Links',
      titleAr: 'روابط سريعة',
      links: {
        create: [
          { labelEn: 'Home', labelAr: 'الرئيسية', href: '/', order: 0 },
          { labelEn: 'About Us', labelAr: 'عنّا', href: '/about', order: 1 },
          { labelEn: 'Our Portfolio', labelAr: 'محفظتنا', href: '/portfolio', order: 2 },
          { labelEn: 'People', labelAr: 'فريقنا', href: '/people', order: 3 },
          { labelEn: 'Contact Us', labelAr: 'اتصل بنا', href: '/contact', order: 4 },
        ]
      }
    }
  })
  console.log('✅ Footer seeded', centerSection.id)

  await prisma.footerSection.create({
    data: {
      position: 'RIGHT',
      titleEn: 'Get In Touch',
      titleAr: 'تواصل معنا',
      links: { create: [] }
    }
  })

  // ─── Sample Brand: Metro Shawarma ──────────────────────────────────────────
  const existing = await prisma.brand.findUnique({ where: { slug: 'metro-shawarma' } })
  if (!existing) {
    const brand = await prisma.brand.create({
      data: {
        slug: 'metro-shawarma',
        nameEn: 'Metro Shawarma',
        nameAr: 'مترو شاورما',
        descriptionEn: 'Metro Shawarma is a high-speed, urban-themed culinary concept engineered for the modern city dweller. By combining the soul of traditional street food with a rigorous, "metro-track" operational efficiency, we have created a brand that is as scalable as it is delicious.',
        descriptionAr: 'مترو شاورما هو مفهوم طهي حضري سريع الخطى، مصمم خصيصاً لسكان المدن العصريين. من خلال دمج روح أكل الشوارع التقليدي مع كفاءة تشغيلية صارمة تشبه "مسار المترو"، أنشأنا علامة تجارية قابلة للتوسع بقدر ما هي لذيذة.',
        displayOnWeb: true,
        order: 0,
        netWorthEn: 'Minimum $500,000 per unit',
        netWorthAr: 'الحد الأدنى لصافي الثروة 1.8 مليون ريال لكل فرع',
        liquidCapitalEn: '$150,000 available for immediate deployment',
        liquidCapitalAr: '560 ألف ريال متوفرة كسيولة نقدية فورية',
        experienceEn: '3+ years in F&B or retail management',
        experienceAr: 'خبرة 3 سنوات فأكثر في إدارة الأغذية والمشروبات أو التجزئة',
        siteProfileEn: 'High-footfall urban areas (100–150 sqm)',
        siteProfileAr: 'مناطق حضرية عالية الكثافة (150-100 متر مربع)',
        whyPointsEn: JSON.stringify([
          'The Precision Engine: Automated marination and cutting systems ensure 100% consistency across all tracks.',
          'Brand Magnetism: A unique, industrial-modern aesthetic that appeals to the youth and corporate demographics alike.'
        ]),
        whyPointsAr: JSON.stringify([
          'محرك الدقة: تضمن أنظمة التتبيل والتقطيع الآلية اتساقاً بنسبة 100% عبر جميع الفروع.',
          'جاذبية العلامة: جمالية صناعية حديثة فريدة تجذب الشباب والشركات على حد سواء.'
        ]),
        locations: {
          create: [
            { cityEn: 'Riyadh', cityAr: 'الرياض', areaEn: 'Olaya', areaAr: 'العليا', typeEn: 'Flagship', typeAr: 'فرع رئيسي', order: 0 },
            { cityEn: 'Riyadh', cityAr: 'الرياض', areaEn: 'Takhassusi', areaAr: 'التخصصي', typeEn: 'Express', typeAr: 'فرع سريع', order: 1 },
            { cityEn: 'Jeddah', cityAr: 'جدة', areaEn: 'Tahlia St', areaAr: 'شارع التحلية', typeEn: 'Urban Hub', typeAr: 'مركز حضري', order: 2 },
            { cityEn: 'Dammam', cityAr: 'الدمام', areaEn: 'Corniche', areaAr: 'الكورنيش', typeEn: 'Drive-Thru', typeAr: 'خدمة السيارات', order: 3 },
          ]
        }
      }
    })
    console.log('✅ Sample brand created:', brand.nameEn)
  }

  // ─── Sample Team Member ─────────────────────────────────────────────────────
  const teamCount = await prisma.teamMember.count()
  if (teamCount === 0) {
    await prisma.teamMember.create({
      data: {
        nameEn: 'Abdullah Al-Rashid',
        nameAr: 'عبدالله الراشد',
        titleEn: 'Chief Executive Officer',
        titleAr: 'الرئيس التنفيذي',
        bioEn: 'With over 20 years in franchise development across the GCC, Abdullah leads ProFranchise with a vision to become the region\'s premier franchise engineering firm.',
        bioAr: 'بخبرة تمتد لأكثر من 20 عاماً في تطوير الامتياز التجاري عبر دول الخليج، يقود عبدالله برو فرانشايز برؤية ترتكز على أن تصبح الشركة الرائدة في هندسة الامتياز التجاري بالمنطقة.',
        displayOnWeb: true,
        order: 0
      }
    })
    console.log('✅ Sample team member created')
  }

  // ─── Default Pages ──────────────────────────────────────────────────────────
  const pages = [
    { slug: 'home', titleEn: 'Home', titleAr: 'الرئيسية', order: 0 },
    { slug: 'about', titleEn: 'About Us', titleAr: 'عنّا', order: 1 },
    { slug: 'portfolio', titleEn: 'Our Portfolio', titleAr: 'محفظتنا', order: 2 },
    { slug: 'people', titleEn: 'People', titleAr: 'فريقنا', order: 3 },
    { slug: 'contact', titleEn: 'Contact Us', titleAr: 'اتصل بنا', order: 4 },
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page
    })
  }
  console.log('✅ Default pages seeded')

  console.log('\n🎉 Database seeded successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin login: admin@profranchise.sa')
  console.log('Password:    Admin@1234')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
