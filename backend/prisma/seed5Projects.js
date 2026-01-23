/**
 * Simplified Project Seed - 5 Strategic Projects
 * 
 * Creates 5 projects in different stages with proper schema compliance
 */

import prisma from '../lib/prisma.js';

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

async function main() {
  console.log('🚀 Seeding 5 strategic projects with full data...\n');

  // Get first user for createdBy
  const users = await prisma.user.findMany();
  if (!users.length) {
    throw new Error('No users found. Please run the main seed script first.');
  }
  const creator = users[0];

  // Get org units
  const tier2Units = await prisma.organizationalUnit.findMany({ where: { tier: 2 }, take: 5 });
  const tier3Units = await prisma.organizationalUnit.findMany({ where: { tier: 3 }, take: 10 });

  if (tier2Units.length < 3 || tier3Units.length < 6) {
    throw new Error('Not enough org units. Please run the main seed script first.');
  }

  const today = new Date();

  console.log('📋 Project 1: API Gateway Modernization (Active, Work Items in Backlog)');
  const project1 = await prisma.project.create({
    data: {
      title: 'API Gateway Modernization',
      description: 'Replace legacy API with modern Kong Gateway',
      owner: 'VP Engineering',
      ownerUnit: tier2Units[0].id,
      ownerTier: 2,
      status: 'In Progress',
      startDate: formatDate(addDays(today, -45)),
      targetDate: formatDate(addDays(today, 60)),
      budget: 350000,
      createdBy: creator.id,
    },
  });

  // Tier 1 objective
  const obj1 = await prisma.objective.create({
    data: {
      title: 'Build gateway infrastructure',
      description: 'Set up Kong API Gateway cluster',
      targetDate: formatDate(addDays(today, 30)),
      projectId: project1.id,
      fromTier: 1,
      createdBy: creator.id,
    },
  });

  // Assign to Tier 2
  await prisma.objectiveAssignment.create({
    data: { objectiveId: obj1.id, unitId: tier2Units[0].id },
  });

  // Create refinement session
  const session1 = await prisma.refinementSession.create({
    data: {
      projectId: project1.id,
      objectiveId: obj1.id,
      status: 'completed',
      createdBy: creator.id,
      completedAt: new Date(),
    },
  });

  // Mark Tier 2 complete
  await prisma.refinementUnitCompletion.create({
    data: {
      refinementSessionId: session1.id,
      organizationalUnitId: tier2Units[0].id,
      completedBy: creator.id,
    },
  });

  // Tier 2 objective - rate limiting
  const obj1Child1 = await prisma.objective.create({
    data: {
      title: 'Configure rate limiting and throttling',
      description: 'Implement rate limits per API key',
      targetDate: formatDate(addDays(today, 20)),
      projectId: project1.id,
      parentObjectiveId: obj1.id,
      fromTier: 2,
      createdBy: creator.id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: obj1Child1.id, unitId: tier3Units[0].id },
  });
  await prisma.objectiveAssignment.create({
    data: { objectiveId: obj1Child1.id, unitId: tier3Units[1].id },
  });

  const session1Child1 = await prisma.refinementSession.create({
    data: {
      projectId: project1.id,
      objectiveId: obj1Child1.id,
      status: 'completed',
      createdBy: creator.id,
      completedAt: new Date(),
    },
  });

  // Mark both units complete
  await prisma.refinementUnitCompletion.create({
    data: {
      refinementSessionId: session1Child1.id,
      organizationalUnitId: tier3Units[0].id,
      completedBy: creator.id,
    },
  });
  await prisma.refinementUnitCompletion.create({
    data: {
      refinementSessionId: session1Child1.id,
      organizationalUnitId: tier3Units[1].id,
      completedBy: creator.id,
    },
  });

  // Create work items
  const workItems = [
    { title: 'Setup Redis for rate limit tracking', type: 'Task', priority: 'P1', unit: tier3Units[0].id },
    { title: 'Configure Kong rate limiting plugin', type: 'Story', priority: 'P1', unit: tier3Units[0].id },
    { title: 'Implement per-API-key throttling', type: 'Story', priority: 'P1', unit: tier3Units[1].id },
    { title: 'Add rate limit headers to responses', type: 'Task', priority: 'P2', unit: tier3Units[1].id },
    { title: 'Create monitoring dashboards', type: 'Task', priority: 'P2', unit: tier3Units[0].id },
    { title: 'Write rate limiting documentation', type: 'Task', priority: 'P2', unit: tier3Units[1].id },
    { title: 'Test rate limits under load', type: 'Task', priority: 'P3', unit: tier3Units[0].id },
  ];

  for (const [index, item] of workItems.entries()) {
    await prisma.workItem.create({
      data: {
        refinementSessionId: session1Child1.id,
        title: item.title,
        description: `Work item for rate limiting objective`,
        type: item.type,
        priority: item.priority,
        stackRank: index,
        status: 'Backlog',
        assignedOrgUnit: item.unit,
        createdBy: creator.id,
      },
    });
  }
  console.log(`  ✓ Created 7 work items across 2 teams\n`);

  // PROJECT 2: Data Analytics Platform (At Risk - Behind Schedule)
  console.log('📋 Project 2: Data Analytics Platform (At Risk, Heavy P1 Load)');
  const project2 = await prisma.project.create({
    data: {
      title: 'Real-time Data Analytics Platform',
      description: 'Build streaming analytics with dashboards',
      owner: 'Chief Data Officer',
      ownerUnit: tier2Units[1].id,
      ownerTier: 2,
      status: 'At Risk',
      startDate: formatDate(addDays(today, -60)),
      targetDate: formatDate(addDays(today, 15)), // Soon!
      budget: 480000,
      createdBy: creator.id,
    },
  });

  const obj2 = await prisma.objective.create({
    data: {
      title: 'Build data ingestion pipeline',
      description: 'Stream data from multiple sources',
      targetDate: formatDate(addDays(today, 10)),
      projectId: project2.id,
      fromTier: 1,
      createdBy: creator.id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: obj2.id, unitId: tier2Units[1].id },
  });

  const session2 = await prisma.refinementSession.create({
    data: {
      projectId: project2.id,
      objectiveId: obj2.id,
      status: 'completed',
      createdBy: creator.id,
      completedAt: new Date(),
    },
  });

  await prisma.refinementUnitCompletion.create({
    data: {
      refinementSessionId: session2.id,
      organizationalUnitId: tier2Units[1].id,
      completedBy: creator.id,
    },
  });

  const obj2Child = await prisma.objective.create({
    data: {
      title: 'Kafka stream processing',
      description: 'Process real-time event streams',
      targetDate: formatDate(addDays(today, 8)),
      projectId: project2.id,
      parentObjectiveId: obj2.id,
      fromTier: 2,
      createdBy: creator.id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: obj2Child.id, unitId: tier3Units[2].id },
  });
  await prisma.objectiveAssignment.create({
    data: { objectiveId: obj2Child.id, unitId: tier3Units[3].id },
  });

  const session2Child = await prisma.refinementSession.create({
    data: {
      projectId: project2.id,
      objectiveId: obj2Child.id,
      status: 'completed',
      createdBy: creator.id,
      completedAt: new Date(),
    },
  });

  await prisma.refinementUnitCompletion.create({
    data: {
      refinementSessionId: session2Child.id,
      organizationalUnitId: tier3Units[2].id,
      completedBy: creator.id,
    },
  });
  await prisma.refinementUnitCompletion.create({
    data: {
      refinementSessionId: session2Child.id,
      organizationalUnitId: tier3Units[3].id,
      completedBy: creator.id,
    },
  });

  // Heavy P1 load - behind schedule
  const criticalItems = [
    { title: 'Fix Kafka consumer lag issues', type: 'Bug', priority: 'P1', completed: true },
    { title: 'Implement exactly-once semantics', type: 'Story', priority: 'P1', completed: true },
    { title: 'Setup Kafka cluster monitoring', type: 'Task', priority: 'P1', completed: false },
    { title: 'Handle schema evolution', type: 'Story', priority: 'P1', completed: false },
    { title: 'Implement dead letter queue', type: 'Story', priority: 'P1', completed: false },
    { title: 'Add circuit breakers', type: 'Story', priority: 'P1', completed: false },
    { title: 'Performance tune consumers', type: 'Task', priority: 'P1', completed: false },
    { title: 'Setup alerting for lag', type: 'Task', priority: 'P2', completed: false },
    { title: 'Document stream architecture', type: 'Task', priority: 'P2', completed: false },
  ];

  for (const [index, item] of criticalItems.entries()) {
    await prisma.workItem.create({
      data: {
        refinementSessionId: session2Child.id,
        title: item.title,
        description: `Critical work for streaming pipeline`,
        type: item.type,
        priority: item.priority,
        stackRank: index,
        status: item.completed ? 'Done' : 'Backlog',
        assignedOrgUnit: index % 2 === 0 ? tier3Units[2].id : tier3Units[3].id,
        createdBy: creator.id,
        completedAt: item.completed ? addDays(today, -Math.floor(Math.random() * 20)) : null,
      },
    });
  }
  console.log(`  ✓ Created 9 work items (7 P1s remaining, 2 completed)\n`);

  // PROJECT 3: Microservices Migration (Progressing Well)
  console.log('📋 Project 3: Microservices Migration (On Track, Good Progress)');
  const project3 = await prisma.project.create({
    data: {
      title: 'Monolith to Microservices Migration',
      description: 'Break apart legacy monolith into services',
      owner: 'Chief Architect',
      ownerUnit: tier2Units[2].id,
      ownerTier: 2,
      status: 'In Progress',
      startDate: formatDate(addDays(today, -70)),
      targetDate: formatDate(addDays(today, 50)),
      budget: 620000,
      createdBy: creator.id,
    },
  });

  const obj3 = await prisma.objective.create({
    data: {
      title: 'Extract user service',
      description: 'Separate user management into microservice',
      targetDate: formatDate(addDays(today, 25)),
      projectId: project3.id,
      fromTier: 1,
      createdBy: creator.id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: obj3.id, unitId: tier2Units[2].id },
  });

  const session3 = await prisma.refinementSession.create({
    data: {
      projectId: project3.id,
      objectiveId: obj3.id,
      status: 'completed',
      createdBy: creator.id,
      completedAt: new Date(),
    },
  });

  await prisma.refinementUnitCompletion.create({
    data: {
      refinementSessionId: session3.id,
      organizationalUnitId: tier2Units[2].id,
      completedBy: creator.id,
    },
  });

  const obj3Child = await prisma.objective.create({
    data: {
      title: 'Implement user service API',
      description: 'REST API for user CRUD operations',
      targetDate: formatDate(addDays(today, 18)),
      projectId: project3.id,
      parentObjectiveId: obj3.id,
      fromTier: 2,
      createdBy: creator.id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: obj3Child.id, unitId: tier3Units[4].id },
  });
  await prisma.objectiveAssignment.create({
    data: { objectiveId: obj3Child.id, unitId: tier3Units[5].id },
  });

  const session3Child = await prisma.refinementSession.create({
    data: {
      projectId: project3.id,
      objectiveId: obj3Child.id,
      status: 'completed',
      createdBy: creator.id,
      completedAt: new Date(),
    },
  });

  await prisma.refinementUnitCompletion.create({
    data: {
      refinementSessionId: session3Child.id,
      organizationalUnitId: tier3Units[4].id,
      completedBy: creator.id,
    },
  });
  await prisma.refinementUnitCompletion.create({
    data: {
      refinementSessionId: session3Child.id,
      organizationalUnitId: tier3Units[5].id,
      completedBy: creator.id,
    },
  });

  const progressItems = [
    { title: 'Design user service schema', type: 'Story', priority: 'P1', completed: true },
    { title: 'Implement user CRUD endpoints', type: 'Story', priority: 'P1', completed: true },
    { title: 'Add authentication middleware', type: 'Story', priority: 'P1', completed: true },
    { title: 'Implement authorization logic', type: 'Story', priority: 'P1', completed: true },
    { title: 'Add input validation', type: 'Task', priority: 'P1', completed: false },
    { title: 'Write API integration tests', type: 'Task', priority: 'P2', completed: false },
    { title: 'Add rate limiting', type: 'Story', priority: 'P2', completed: false },
    { title: 'Setup service monitoring', type: 'Task', priority: 'P2', completed: false },
    { title: 'Create API documentation', type: 'Task', priority: 'P3', completed: false },
  ];

  for (const [index, item] of progressItems.entries()) {
    await prisma.workItem.create({
      data: {
        refinementSessionId: session3Child.id,
        title: item.title,
        description: `User service implementation`,
        type: item.type,
        priority: item.priority,
        stackRank: index,
        status: item.completed ? 'Done' : 'Backlog',
        assignedOrgUnit: index % 2 === 0 ? tier3Units[4].id : tier3Units[5].id,
        createdBy: creator.id,
        completedAt: item.completed ? addDays(today, -Math.floor(Math.random() * 15) - 5) : null,
      },
    });
  }
  console.log(`  ✓ Created 9 work items (4 completed, 5 remaining)\n`);

  // PROJECT 4: Security Upgrade (Early Planning)
  console.log('📋 Project 4: Security Compliance (Early Planning, Minimal Refinement)');
  const project4 = await prisma.project.create({
    data: {
      title: 'SOC 2 Security Compliance',
      description: 'Achieve SOC 2 Type II certification',
      owner: 'CISO',
      ownerUnit: tier2Units[3].id,
      ownerTier: 2,
      status: 'Planning',
      startDate: formatDate(addDays(today, 0)),
      targetDate: formatDate(addDays(today, 120)),
      budget: 180000,
      createdBy: creator.id,
    },
  });

  const obj4 = await prisma.objective.create({
    data: {
      title: 'Conduct security gap analysis',
      description: 'Identify compliance gaps',
      targetDate: formatDate(addDays(today, 30)),
      projectId: project4.id,
      fromTier: 1,
      createdBy: creator.id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: obj4.id, unitId: tier2Units[3].id },
  });

  // Session in progress
  await prisma.refinementSession.create({
    data: {
      projectId: project4.id,
      objectiveId: obj4.id,
      status: 'in-progress',
      createdBy: creator.id,
    },
  });
  console.log(`  ✓ Tier 2 currently refining (no work items yet)\n`);

  // PROJECT 5: Mobile App (Completed Successfully)
  console.log('📋 Project 5: Mobile App Rewrite (Completed Successfully)');
  const project5 = await prisma.project.create({
    data: {
      title: 'Mobile App v2.0',
      description: 'Complete mobile app rewrite',
      owner: 'VP Mobile',
      ownerUnit: tier2Units[4].id,
      ownerTier: 2,
      status: 'Completed',
      startDate: formatDate(addDays(today, -120)),
      targetDate: formatDate(addDays(today, -5)),
      budget: 420000,
      createdBy: creator.id,
    },
  });

  const obj5 = await prisma.objective.create({
    data: {
      title: 'Build core mobile features',
      description: 'Authentication, navigation, offline mode',
      targetDate: formatDate(addDays(today, -10)),
      projectId: project5.id,
      fromTier: 1,
      createdBy: creator.id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: obj5.id, unitId: tier2Units[4].id },
  });

  const session5 = await prisma.refinementSession.create({
    data: {
      projectId: project5.id,
      objectiveId: obj5.id,
      status: 'completed',
      createdBy: creator.id,
      completedAt: addDays(today, -15),
    },
  });

  await prisma.refinementUnitCompletion.create({
    data: {
      refinementSessionId: session5.id,
      organizationalUnitId: tier2Units[4].id,
      completedBy: creator.id,
    },
  });

  const obj5Child = await prisma.objective.create({
    data: {
      title: 'Implement offline sync',
      description: 'Local storage with cloud sync',
      targetDate: formatDate(addDays(today, -15)),
      projectId: project5.id,
      parentObjectiveId: obj5.id,
      fromTier: 2,
      createdBy: creator.id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: obj5Child.id, unitId: tier3Units[6].id },
  });

  const session5Child = await prisma.refinementSession.create({
    data: {
      projectId: project5.id,
      objectiveId: obj5Child.id,
      status: 'completed',
      createdBy: creator.id,
      completedAt: addDays(today, -20),
    },
  });

  await prisma.refinementUnitCompletion.create({
    data: {
      refinementSessionId: session5Child.id,
      organizationalUnitId: tier3Units[6].id,
      completedBy: creator.id,
    },
  });

  const completedItems = [
    'Design offline storage schema',
    'Implement local database',
    'Build sync conflict resolution',
    'Add background sync service',
    'Implement delta sync algorithm',
    'Add network detection',
    'Create sync status indicators',
    'Write offline mode tests',
    'Document sync architecture',
  ];

  for (const [index, title] of completedItems.entries()) {
    await prisma.workItem.create({
      data: {
        refinementSessionId: session5Child.id,
        title,
        description: `Offline sync feature`,
        type: index % 3 === 0 ? 'Story' : 'Task',
        priority: 'P1',
        stackRank: index,
        status: 'Done',
        assignedOrgUnit: tier3Units[6].id,
        createdBy: creator.id,
        completedAt: addDays(today, -Math.floor(Math.random() * 10) - 10),
      },
    });
  }
  console.log(`  ✓ Created 9 work items (all completed)\n`);

  console.log('✅ Seeding complete!\n');
  console.log('📊 Summary:');
  console.log('   • 5 projects spanning Planning → Completed');
  console.log('   • 3 projects with active work items');
  console.log('   • 1 at-risk project (Data Analytics)');
  console.log('   • 1 on-track project (Microservices)');
  console.log('   • 1 completed project (Mobile App)');
  console.log('   • ~35 work items with realistic throughput data');
  console.log('\n💡 Ready for dependency charts and roadmap visualization!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
