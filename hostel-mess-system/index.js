const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@test.com",
        password: "1234",
        role: "ADMIN"
      }
    })

    console.log("User created:", user)

  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()