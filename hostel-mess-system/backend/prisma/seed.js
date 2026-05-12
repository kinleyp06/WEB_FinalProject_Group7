const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.user.deleteMany()
  
  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hostel.edu',
      password: 'admin123',
      name: 'Dorji Admin',
      role: 'ADMIN',
      isActive: true
    }
  })
  console.log('Created admin:', admin.email)
  
  // Create Students
  const students = [
    { email: 'wangchuk@hostel.edu', password: 'wangchuk123', name: 'Wangchuk', rollNumber: '2024001' },
    { email: 'pelden@hostel.edu', password: 'pelden123', name: 'Pelden', rollNumber: '2024002' },
    { email: 'sonam@hostel.edu', password: 'sonam123', name: 'Sonam', rollNumber: '2024003' }
  ]
  
  for (const student of students) {
    const created = await prisma.user.create({
      data: {
        ...student,
        role: 'STUDENT',
        isActive: true
      }
    })
    console.log('Created student:', created.email)
  }
  
  console.log('Seed completed!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())