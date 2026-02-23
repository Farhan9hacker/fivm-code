const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const password = 'admin'; // In production, this should be hashed!
    // Note: The Auth implementation in src/app/api/auth/[...nextauth]/route.ts 
    // currently does a direct string comparison for simplicity as per setup.
    // If you added bcrypt, you'd hash this here.

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {
            passwordHash: hashedPassword,
        },
        create: {
            username: 'admin',
            passwordHash: hashedPassword,
        },
    })

    console.log({ admin })
    console.log("Admin created successfully!")
    console.log("Username: admin")
    console.log("Password: " + password)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
