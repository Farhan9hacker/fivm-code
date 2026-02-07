const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const username = process.argv[2];
    const password = process.argv[3];

    if (!username || !password) {
        console.log("Usage: node scripts/create-admin.js <username> <password>");
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const admin = await prisma.admin.create({
            data: {
                username: username,
                passwordHash: hashedPassword,
            },
        });
        console.log(`Admin user '${admin.username}' created successfully.`);
    } catch (e) {
        console.error("Error creating admin:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
