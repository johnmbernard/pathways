/**
 * Database Seed Script
 * 
 * This script populates the database with initial data:
 * - Demo users with hashed passwords
 * - Organizational structure (Kessel Run hierarchy)
 * 
 * Run with: node prisma/seed.js
 */

import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🗑️  Clearing existing data...');
  await prisma.discussionMessage.deleteMany();
  await prisma.workItem.deleteMany();
  await prisma.refinedObjective.deleteMany();
  await prisma.refinementSession.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.objectiveCompletion.deleteMany();
  await prisma.objectiveAssignment.deleteMany();
  await prisma.objective.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organizationalUnit.deleteMany();
  await prisma.user.deleteMany();

  // Create organizational structure
  console.log('🏢 Creating organizational units...');
  
  // Tier 1 - Root
  const kesselRun = await prisma.organizationalUnit.create({
    data: {
      id: 'org-1',
      name: 'Kessel Run',
      parentId: null,
      tier: 1,
      order: 0,
    },
  });

  // Tier 2 - Child units
  const opsC2 = await prisma.organizationalUnit.create({
    data: {
      id: 'org-2',
      name: 'OpsC2',
      parentId: kesselRun.id,
      tier: 2,
      order: 0,
    },
  });

  const wingC2 = await prisma.organizationalUnit.create({
    data: {
      id: 'org-3',
      name: 'WingC2',
      parentId: kesselRun.id,
      tier: 2,
      order: 1,
    },
  });

  const security = await prisma.organizationalUnit.create({
    data: {
      id: 'org-4',
      name: 'Security',
      parentId: kesselRun.id,
      tier: 2,
      order: 2,
    },
  });

  const adcp = await prisma.organizationalUnit.create({
    data: {
      id: 'org-5',
      name: 'ADCP',
      parentId: kesselRun.id,
      tier: 2,
      order: 3,
    },
  });

  const iaas = await prisma.organizationalUnit.create({
    data: {
      id: 'org-6',
      name: 'IaaS',
      parentId: kesselRun.id,
      tier: 2,
      order: 4,
    },
  });

  // Tier 3 - Grandchild units under OpsC2
  const krados = await prisma.organizationalUnit.create({
    data: {
      id: 'org-7',
      name: 'KRADOS',
      parentId: opsC2.id,
      tier: 3,
      order: 0,
    },
  });

  const marauder = await prisma.organizationalUnit.create({
    data: {
      id: 'org-8',
      name: 'Marauder',
      parentId: opsC2.id,
      tier: 3,
      order: 1,
    },
  });

  // Tier 3 - Grandchild units under WingC2
  const janus = await prisma.organizationalUnit.create({
    data: {
      id: 'org-9',
      name: 'Janus',
      parentId: wingC2.id,
      tier: 3,
      order: 0,
    },
  });

  console.log('✅ Created organizational structure');

  // Hash password for all demo users
  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Create users
  console.log('👥 Creating users...');
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user-1',
        email: 'kessel.lead@pathways.dev',
        password: hashedPassword,
        name: 'Kessel Lead',
        organizationalUnit: kesselRun.id,
        role: 'Unit Leader',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-2',
        email: 'opsc2.lead@pathways.dev',
        password: hashedPassword,
        name: 'OpsC2 Lead',
        organizationalUnit: opsC2.id,
        role: 'Unit Leader',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-3',
        email: 'krados.lead@pathways.dev',
        password: hashedPassword,
        name: 'KRADOS Team Lead',
        organizationalUnit: krados.id,
        role: 'Team Lead',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-4',
        email: 'wingc2.lead@pathways.dev',
        password: hashedPassword,
        name: 'WingC2 Lead',
        organizationalUnit: wingC2.id,
        role: 'Unit Leader',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-5',
        email: 'security.lead@pathways.dev',
        password: hashedPassword,
        name: 'Security Lead',
        organizationalUnit: security.id,
        role: 'Unit Leader',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-6',
        email: 'janus.lead@pathways.dev',
        password: hashedPassword,
        name: 'Janus Team Lead',
        organizationalUnit: janus.id,
        role: 'Team Lead',
      },
    }),
  ]);

  console.log('✅ Created users');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - ${await prisma.organizationalUnit.count()} organizational units`);
  console.log(`   - ${await prisma.user.count()} users`);
  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('👤 Demo Accounts (all passwords: demo123):');
  console.log('   - kessel.lead@pathways.dev (Tier 1)');
  console.log('   - opsc2.lead@pathways.dev (Tier 2)');
  console.log('   - wingc2.lead@pathways.dev (Tier 2)');
  console.log('   - security.lead@pathways.dev (Tier 2)');
  console.log('   - krados.lead@pathways.dev (Tier 3)');
  console.log('   - janus.lead@pathways.dev (Tier 3)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
