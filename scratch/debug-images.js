const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const images = await prisma.galleryImage.findMany()
  console.log('Gallery Images:', images.map(i => ({ id: i.id, isActive: i.isActive, url: i.url })))
}

main().finally(() => prisma.$disconnect())
