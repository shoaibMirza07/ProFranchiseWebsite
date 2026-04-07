/**
 * Seed all PageSection records with bilingual CMS content.
 * This makes every visible text on the website editable via Admin → Pages.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper: upsert a section by (pageId, type)
async function upsertSection(
  pageId: string,
  type: string,
  order: number,
  en: Record<string, unknown>,
  ar: Record<string, unknown>
) {
  const existing = await prisma.pageSection.findFirst({ where: { pageId, type } })
  if (existing) {
    await prisma.pageSection.update({
      where: { id: existing.id },
      data: { contentEn: JSON.stringify(en), contentAr: JSON.stringify(ar), order, isVisible: true }
    })
  } else {
    await prisma.pageSection.create({
      data: {
        pageId,
        type,
        order,
        isVisible: true,
        contentEn: JSON.stringify(en),
        contentAr: JSON.stringify(ar)
      }
    })
  }
}

async function main() {
  console.log('🌱 Seeding page sections...')

  const pages = await prisma.page.findMany()
  const pageMap: Record<string, string> = {}
  for (const p of pages) pageMap[p.slug] = p.id

  // ─── HOME ──────────────────────────────────────────────────────────────────
  const homeId = pageMap['home']
  if (homeId) {
    // Hero Banner
    await upsertSection(homeId, 'hero', 0,
      {
        slides: [
          { label: 'Purpose', title: 'Engineering the blueprints of regional brand success.' },
          { label: 'Vision', title: 'To be the primary engine accelerating local brands onto the global stage.' },
          { label: 'Mission', title: 'We empower visionary people and leverage advanced technology to transform local potential into global standard-setters.' }
        ],
        cta: 'Discover Our Portfolio'
      },
      {
        slides: [
          { label: 'هدفنا', title: 'هندسة مخططات نجاح العلامات التجارية الإقليمية.' },
          { label: 'رؤيتنا', title: 'أن نكون المحرك الأساسي لتسريع وصول العلامات التجارية المحلية إلى الساحة العالمية.' },
          { label: 'مهمتنا', title: 'نمكّن الأشخاص الطموحين ونسخر التقنيات المتقدمة لتحويل الإمكانات المحلية إلى معايير عالمية رائدة.' }
        ],
        cta: 'اكتشف محفظتنا'
      }
    )

    // Intro
    await upsertSection(homeId, 'intro', 1,
      {
        title: 'Bridging Local Genius & Global Scale',
        body: "At ProFranchise, we bridge the gap between local genius and global scale. We don't just sell franchises; we engineer growth ecosystems.",
        subtext: 'Precision-engineered for regional franchise growth.'
      },
      {
        title: 'نسد الفجوة بين العبقرية المحلية والنطاق العالمي',
        body: 'في برو فرانشايز، نسد الفجوة بين العبقرية المحلية والنطاق العالمي. نحن لا نبيع حقوق الامتياز فحسب، بل نهندس أنظمة نمو متكاملة.',
        subtext: 'هندسة دقيقة من أجل نمو الامتياز الإقليمي.'
      }
    )

    // Hexagon
    await upsertSection(homeId, 'hexagon', 2,
      {
        title: 'The Hexagon of Success',
        subtitle: 'Six interlocked pillars that define every franchise we engineer.',
        pillars: {
          brand:       { label: 'The Brand',              desc: 'Intellectual Property & DNA.' },
          operator:    { label: 'The Operator',           desc: 'Strategic Capital & Leadership.' },
          consumer:    { label: 'The Consumer',           desc: 'Consistency & Joy.' },
          employees:   { label: 'Motivated Employees',    desc: 'Human brand ambassadors.' },
          supplyChain: { label: 'Effective Supply-Chain', desc: 'Global quality standards.' },
          technology:  { label: 'Advanced Technology',    desc: 'Digital Guardrails & QA.' }
        }
      },
      {
        title: 'مسدس النجاح',
        subtitle: 'ستة أعمدة متشابكة تحدد كل امتياز نهندسه.',
        pillars: {
          brand:       { label: 'العلامة التجارية',         desc: 'الهوية والملكية الفكرية.' },
          operator:    { label: 'المشغل (المستثمر)',         desc: 'رأس المال الاستراتيجي والقيادة.' },
          consumer:    { label: 'المستهلك',                 desc: 'الاستمرارية وتجربة العميل.' },
          employees:   { label: 'الموظفون الطموحون',        desc: 'سفراء العلامة التجارية.' },
          supplyChain: { label: 'سلاسل الإمداد الفعالة',   desc: 'معايير الجودة العالمية.' },
          technology:  { label: 'التقنيات المتقدمة',        desc: 'الحماية الرقمية وضبط الجودة.' }
        }
      }
    )

    // Brand Selection Audit
    await upsertSection(homeId, 'brand_selection', 3,
      {
        title: 'How We Select Our Brands',
        subtitle: 'Our rigorous three-point audit ensures only the strongest concepts enter our portfolio.',
        criteria: [
          { number: '01', label: 'Brand Integrity (Franchisor)',  desc: 'Is the concept unique and the IP protected?' },
          { number: '02', label: 'The Joy Factor (Consumer)',     desc: 'Is there repeatable demand for the experience?' },
          { number: '03', label: 'The Blueprint Factor (Operator)', desc: 'Can the model be taught and scaled profitably?' }
        ]
      },
      {
        title: 'كيف نختار علاماتنا التجارية؟',
        subtitle: 'تضمن عمليتنا الدقيقة ذات النقاط الثلاث دخول أقوى المفاهيم فقط إلى محفظتنا.',
        criteria: [
          { number: '01', label: 'نزاهة العلامة التجارية (صاحب الامتياز)', desc: 'هل المفهوم فريد والملكية الفكرية محمية؟' },
          { number: '02', label: 'عامل البهجة (المستهلك)',                   desc: 'هل هناك طلب متكرر على هذه التجربة؟' },
          { number: '03', label: 'عامل المخطط (المشغل)',                     desc: 'هل يمكن تعليم النموذج وتوسيع نطاقه بربحية؟' }
        ]
      }
    )

    // Our Brands
    await upsertSection(homeId, 'brands', 4,
      { title: 'Our Brands', subtitle: 'A curated portfolio of high-performance franchise concepts.', cta: 'View All Brands' },
      { title: 'علاماتنا التجارية', subtitle: 'محفظة منتقاة من مفاهيم الامتياز عالية الأداء.', cta: 'عرض جميع العلامات' }
    )

    // Invest Journey
    await upsertSection(homeId, 'invest', 5,
      {
        title: 'How Do You Invest With Us?',
        subtitle: 'A transparent, four-step journey from profiling to partnership.',
        steps: [
          { number: '01', label: 'Profiling',    desc: 'Analyzing goals & capital.' },
          { number: '02', label: 'Matching',     desc: 'Curated portfolio selection.' },
          { number: '03', label: 'Deep-Dive',    desc: 'Technical & Financial transparency.' },
          { number: '04', label: 'Partnership',  desc: 'Strategic launch and support.' }
        ],
        cta: 'Start Your Journey'
      },
      {
        title: 'كيف تستثمر معنا؟',
        subtitle: 'رحلة شفافة من أربع خطوات من التحليل إلى الشراكة.',
        steps: [
          { number: '01', label: 'التحليل',    desc: 'تحليل الأهداف ورأس المال.' },
          { number: '02', label: 'المطابقة',   desc: 'اختيار العلامات التجارية المناسبة.' },
          { number: '03', label: 'التعمق',     desc: 'الشفافية التقنية والمالية.' },
          { number: '04', label: 'الشراكة',    desc: 'الإطلاق الاستراتيجي والدعم.' }
        ],
        cta: 'ابدأ رحلتك'
      }
    )

    // Strength
    await upsertSection(homeId, 'strength', 6,
      { title: 'Our Strength', subtitle: 'Built on precision, trust, and proven systems.' },
      { title: 'قوتنا', subtitle: 'مبنية على الدقة والثقة والأنظمة المُثبتة.' }
    )
  }

  // ─── ABOUT ─────────────────────────────────────────────────────────────────
  const aboutId = pageMap['about']
  if (aboutId) {
    await upsertSection(aboutId, 'hero', 0,
      { title: 'About ProFranchise', subtitle: 'The architects of franchise growth in the region.' },
      { title: 'عن برو فرانشايز', subtitle: 'مهندسو نمو الامتياز في المنطقة.' }
    )

    await upsertSection(aboutId, 'values', 1,
      {
        title: 'Our Core Values',
        items: [
          { icon: 'Target',          label: 'Precision',           desc: 'Data-driven growth decisions.' },
          { icon: 'Scale',           label: 'Equilibrium',         desc: 'Balancing franchisor, investor, and consumer interests.' },
          { icon: 'Building2',       label: 'Institutionalization', desc: 'Turning "founder magic" into professional systems.' },
          { icon: 'Eye',             label: 'Transparency',        desc: 'Radical honesty in every metric.' },
          { icon: 'Zap',             label: 'Empowerment',         desc: 'Providing the tools for partners to lead.' }
        ]
      },
      {
        title: 'قيمنا الجوهرية',
        items: [
          { icon: 'Target',    label: 'الدقة',      desc: 'قرارات النمو المدفوعة بالبيانات.' },
          { icon: 'Scale',     label: 'التوازن',    desc: 'الموازنة بين مصالح صاحب الامتياز والمستثمر والمستهلك.' },
          { icon: 'Building2', label: 'المأسسة',    desc: 'تحويل سحر المؤسس إلى أنظمة احترافية.' },
          { icon: 'Eye',       label: 'الشفافية',   desc: 'الصدق الجذري في كل مقياس.' },
          { icon: 'Zap',       label: 'التمكين',    desc: 'تزويد الشركاء بالأدوات اللازمة للقيادة.' }
        ]
      }
    )

    await upsertSection(aboutId, 'partners', 2,
      { title: 'Our Partners', subtitle: 'Strategic alliances that amplify our reach and capabilities.' },
      { title: 'شركاؤنا', subtitle: 'تحالفات استراتيجية تعزز نطاق عملنا وقدراتنا.' }
    )

    await upsertSection(aboutId, 'team', 3,
      { title: 'Our Team', subtitle: 'The architects behind the blueprint.' },
      { title: 'فريقنا', subtitle: 'المهندسون الذين يقفون خلف المخطط.' }
    )
  }

  // ─── PORTFOLIO ──────────────────────────────────────────────────────────────
  const portfolioId = pageMap['portfolio']
  if (portfolioId) {
    await upsertSection(portfolioId, 'hero', 0,
      { title: 'Our Portfolio', subtitle: 'High-performance franchise concepts engineered for regional success.' },
      { title: 'محفظتنا', subtitle: 'مفاهيم امتياز عالية الأداء مُهندَسة للنجاح الإقليمي.' }
    )
  }

  // ─── PEOPLE ─────────────────────────────────────────────────────────────────
  const peopleId = pageMap['people']
  if (peopleId) {
    await upsertSection(peopleId, 'hero', 0,
      { title: 'Our People', subtitle: 'The pulse of the Hexagon.' },
      { title: 'فريقنا', subtitle: 'نبض مسدس النجاح.' }
    )

    await upsertSection(peopleId, 'intro', 1,
      { body: 'Our people are the pulse of the Hexagon. We invest in talent that builds legacies.' },
      { body: 'موظفونا هم نبض مسدس النجاح. نحن نستثمر في المواهب التي تبني الإرث.' }
    )

    await upsertSection(peopleId, 'gallery', 2,
      { title: 'Life at ProFranchise' },
      { title: 'الحياة في برو فرانشايز' }
    )

    await upsertSection(peopleId, 'careers', 3,
      { title: 'Join Our Team', subtitle: "Be part of something bigger. We're always looking for talent that builds legacies." },
      { title: 'انضم إلى فريقنا', subtitle: 'كن جزءاً من شيء أكبر. نحن نبحث دائماً عن المواهب التي تبني الإرث.' }
    )
  }

  // ─── CONTACT ────────────────────────────────────────────────────────────────
  const contactId = pageMap['contact']
  if (contactId) {
    await upsertSection(contactId, 'hero', 0,
      { title: 'Contact Us', subtitle: "Let's engineer something great together." },
      { title: 'اتصل بنا', subtitle: 'لنهندس شيئاً رائعاً معاً.' }
    )

    await upsertSection(contactId, 'inquiry_types', 1,
      {
        options: [
          { value: 'INVESTOR',         label: 'I am an Investor' },
          { value: 'BRAND_OWNER',      label: 'I own a Brand' },
          { value: 'VENDOR_SUPPLIER',  label: 'I am a Vendor / Supplier' },
          { value: 'GENERAL',          label: 'General Inquiry' }
        ]
      },
      {
        options: [
          { value: 'INVESTOR',         label: 'أنا مستثمر' },
          { value: 'BRAND_OWNER',      label: 'أنا صاحب علامة تجارية' },
          { value: 'VENDOR_SUPPLIER',  label: 'أنا مورد/مزود خدمة' },
          { value: 'GENERAL',          label: 'استفسار عام' }
        ]
      }
    )
  }

  console.log('✅ All page sections seeded successfully!')
}

main()
  .catch(e => { console.error('❌ Failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
