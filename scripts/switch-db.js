const fs = require('fs');
const path = require('path');

const target = process.argv[2];

if (target !== 'sqlite' && target !== 'postgresql') {
  console.error('Usage: node switch-db.js [sqlite|postgresql]');
  process.exit(1);
}

const prismaDir = path.join(__dirname, '../prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');
const envPath = path.join(__dirname, '../.env');

let templateFile;
if (target === 'sqlite') {
  templateFile = path.join(prismaDir, 'schema.sqlite.prisma');
} else {
  templateFile = path.join(prismaDir, 'schema.postgresql.prisma');
}

if (!fs.existsSync(templateFile)) {
  console.error(`Template file not found: ${templateFile}`);
  process.exit(1);
}

fs.copyFileSync(templateFile, schemaPath);
console.log(`Successfully switched schema.prisma to ${target.toUpperCase()} template.`);

// Ensure .env exists
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transitops"\nNEXTAUTH_SECRET="supersecretsecret123456789"\nNEXTAUTH_URL="http://localhost:3000"\n`, 'utf8');
  console.log('Created a default .env file.');
}
