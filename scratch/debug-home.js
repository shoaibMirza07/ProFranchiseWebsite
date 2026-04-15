const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const page = await prisma.page.findUnique({
    where: { slug: 'home' },
    include: { sections: true }
  })
  console.log('Page:', page?.slug)
  console.log('Sections:', page?.sections?.map(s => ({ type: s.type, visible: s.isVisible, id: s.id })))
  
  const gallery = await prisma.galleryImage.count()
  console.log('Gallery count:', gallery)
}

main().finally(() => prisma.$disconnect())
