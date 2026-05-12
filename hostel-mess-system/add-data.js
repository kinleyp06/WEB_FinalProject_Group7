const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Adding users...')
  
  // Add Admin
  await prisma.user.upsert({
    where: { email: 'admin@hostel.edu' },
    update: {},
    create: {
      email: 'admin@hostel.edu',
      password: 'admin123',
      name: 'Dorji Admin',
      role: 'ADMIN',
      isActive: true
    }
  })
  console.log('✓ Admin added')

  // Add Students
  const students = [
    { email: 'sonam@hostel.edu', name: 'Sonam', rollNumber: '2024003' },
    { email: 'wangchuk@hostel.edu', name: 'Wangchuk', rollNumber: '2024001' },
    { email: 'pelden@hostel.edu', name: 'Pelden', rollNumber: '2024002' }
  ]

  for (const student of students) {
    await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: {
        email: student.email,
        password: `${student.name.toLowerCase()}123`,
        name: student.name,
        rollNumber: student.rollNumber,
        role: 'STUDENT',
        isActive: true
      }
    })
    console.log(`✓ ${student.name} added`)
  }

  const users = await prisma.user.findMany()
  console.log('\n--- All Users ---')
  users.forEach(u => {
    console.log(`${u.email} | ${u.name} | ${u.role} | ${u.rollNumber || 'N/A'}`)
  })
}

main().finally(() => prisma.$disconnect())
