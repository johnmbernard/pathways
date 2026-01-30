import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// UTILITY FUNCTIONS
// ============================================

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// DATA STRUCTURES
// ============================================

const PROJECT_TEMPLATES = [
  { name: 'Customer Portal v2.0', description: 'Enhanced portal with advanced features and better UX', budget: 350000 },
  { name: 'Cloud Migration Phase 1', description: 'Migrate core services to AWS', budget: 600000 },
  { name: 'AI-Powered Product Recommendations', description: 'Machine learning based product recommendation engine', budget: 420000 },
  { name: 'Security Operations Center (SOC)', description: '24/7 security monitoring and incident response', budget: 450000 },
  { name: 'API Marketplace', description: 'Public API catalog and management platform', budget: 280000 },
  { name: 'Mobile App v2.0', description: 'iOS and Android native apps', budget: 400000 },
  { name: 'Marketing Analytics Dashboard', description: 'Real-time marketing performance metrics', budget: 170000 },
  { name: 'QA Test Automation Framework', description: 'E2E and integration test automation', budget: 220000 },
  { name: 'Zero Trust Architecture', description: 'Implement zero trust security model', budget: 500000 },
  { name: 'Data Warehouse Migration', description: 'Migrate from legacy to modern data warehouse', budget: 300000 },
];

const OBJECTIVE_PATTERNS = {
  engineering: ['Design', 'Backend Development', 'Frontend Development', 'API Integration', 'Testing & QA', 'Deployment'],
  platform: ['Infrastructure Setup', 'CI/CD Pipeline', 'Monitoring', 'Security Hardening', 'Performance Optimization'],
  data: ['Data Model Design', 'ETL Pipeline', 'Analytics', 'Reporting', 'Data Quality'],
  security: ['Threat Assessment', 'Security Controls', 'Compliance', 'Monitoring', 'Incident Response'],
  product: ['Requirements', 'User Research', 'Design', 'Beta Testing', 'Documentation'],
};

const WORK_ITEM_TEMPLATES = {
  design: ['Create wireframes', 'Design UI mockups', 'Conduct user testing', 'Iterate on feedback'],
  backend: ['Setup database schema', 'Build REST APIs', 'Implement business logic', 'Add error handling', 'Write unit tests'],
  frontend: ['Setup project structure', 'Build components', 'Implement routing', 'Add state management', 'Style components'],
  testing: ['Write test plan', 'Create test cases', 'Setup test automation', 'Run regression tests', 'Document bugs'],
  deployment: ['Configure CI/CD', 'Setup staging environment', 'Deploy to production', 'Monitor metrics'],
};

// ============================================
// SEED HELPER FUNCTIONS
// ============================================

async function createOrgStructure() {
  console.log('🏢 Creating organizational structure...');

  // Tier 1: Company
  const company = await prisma.organizationalUnit.create({
    data: { name: 'Synapse Solutions', tier: 1, parentId: null },
  });

  // Tier 2: Divisions
  const divisions = await Promise.all([
    prisma.organizationalUnit.create({ data: { name: 'Engineering', tier: 2, parentId: company.id } }),
    prisma.organizationalUnit.create({ data: { name: 'Product', tier: 2, parentId: company.id } }),
    prisma.organizationalUnit.create({ data: { name: 'Operations', tier: 2, parentId: company.id } }),
  ]);

  // Tier 3: Departments
  const departments = await Promise.all([
    // Engineering departments
    prisma.organizationalUnit.create({ data: { name: 'Backend Engineering', tier: 3, parentId: divisions[0].id } }),
    prisma.organizationalUnit.create({ data: { name: 'Frontend Engineering', tier: 3, parentId: divisions[0].id } }),
    prisma.organizationalUnit.create({ data: { name: 'Platform Engineering', tier: 3, parentId: divisions[0].id } }),
    prisma.organizationalUnit.create({ data: { name: 'Security Engineering', tier: 3, parentId: divisions[0].id } }),
    prisma.organizationalUnit.create({ data: { name: 'QA Engineering', tier: 3, parentId: divisions[0].id } }),
    // Product departments
    prisma.organizationalUnit.create({ data: { name: 'Product Management', tier: 3, parentId: divisions[1].id } }),
    prisma.organizationalUnit.create({ data: { name: 'Product Design', tier: 3, parentId: divisions[1].id } }),
    prisma.organizationalUnit.create({ data: { name: 'Product Marketing', tier: 3, parentId: divisions[1].id } }),
    // Operations departments
    prisma.organizationalUnit.create({ data: { name: 'Data & Analytics', tier: 3, parentId: divisions[2].id } }),
    prisma.organizationalUnit.create({ data: { name: 'Customer Success', tier: 3, parentId: divisions[2].id } }),
  ]);

  // Tier 4: Teams (2-3 per department)
  const teams = [];
  const teamMapping = [
    { deptIdx: 0, teams: ['Backend Alpha', 'Backend Beta', 'Backend Gamma'] },
    { deptIdx: 1, teams: ['Frontend Alpha', 'Frontend Beta'] },
    { deptIdx: 2, teams: ['Platform Infra', 'Platform DevOps'] },
    { deptIdx: 3, teams: ['AppSec', 'InfraSec'] },
    { deptIdx: 4, teams: ['QA Automation', 'QA Manual'] },
    { deptIdx: 5, teams: ['Core Product', 'Growth Product'] },
    { deptIdx: 6, teams: ['UX Design', 'Visual Design'] },
    { deptIdx: 7, teams: ['Product Marketing', 'Growth Marketing'] },
    { deptIdx: 8, teams: ['Data Science', 'Data Engineering'] },
    { deptIdx: 9, teams: ['Customer Support', 'Implementation'] },
  ];

  for (const mapping of teamMapping) {
    for (const teamName of mapping.teams) {
      const team = await prisma.organizationalUnit.create({
        data: { name: teamName, tier: 4, parentId: departments[mapping.deptIdx].id },
      });
      teams.push(team);
    }
  }

  console.log(`✅ Created ${1 + divisions.length + departments.length + teams.length} organizational units`);
  return { company, divisions, departments, teams };
}

async function createUsers(orgUnits) {
  console.log('👥 Creating users...');

  const { company, divisions, departments, teams } = orgUnits;
  const allUnits = [company, ...divisions, ...departments, ...teams];

  const users = [];
  const names = [
    'Sarah Chen', 'Marcus Johnson', 'Aisha Patel', 'David Kim', 'Elena Rodriguez',
    'James Wilson', 'Priya Sharma', 'Alex Turner', 'Maya Foster', 'Carlos Santos',
    'Lisa Wong', 'Ahmed Hassan', 'Rachel Green', 'Tommy Nguyen', 'Zara Ali',
    'Chris Morgan', 'Nina Desai', 'Jordan Lee', 'Sophia Martinez', 'Ryan Park',
  ];

  for (let i = 0; i < allUnits.length && i < names.length; i++) {
    const unit = allUnits[i];
    const user = await prisma.user.create({
      data: {
        email: names[i].toLowerCase().replace(' ', '.') + '@synapsesolutions.com',
        name: names[i],
        role: unit.tier === 1 ? 'admin' : unit.tier <= 3 ? 'manager' : 'user',
        organizationalUnitId: unit.id,
      },
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function createProjectWithCascade(projectData, ownerUnit, childUnits, allUnits, users, projectIdx) {
  const { name, description, budget } = projectData;
  
  // Determine project status and dates based on index
  let status, startDate, targetDate;
  if (projectIdx < 3) {
    // Completed projects
    status = 'completed';
    startDate = daysFromNow(-120);
    targetDate = daysFromNow(-30);
  } else if (projectIdx < 8) {
    // Active projects
    status = 'active';
    startDate = daysFromNow(-60);
    targetDate = daysFromNow(90);
  } else {
    // Planning projects
    status = 'planning';
    startDate = daysFromNow(10);
    targetDate = daysFromNow(150);
  }

  const owner = users.find(u => u.organizationalUnitId === ownerUnit.id);

  const project = await prisma.project.create({
    data: {
      title: name,
      description,
      owner: ownerUnit.name,
      ownerTier: ownerUnit.tier,
      ownerUnit: ownerUnit.id,
      status,
      startDate,
      targetDate,
      budget,
      createdBy: owner.id,
    },
  });

  // Determine objective pattern based on owner
  let objectivePattern;
  if (ownerUnit.name.includes('Engineering')) objectivePattern = OBJECTIVE_PATTERNS.engineering;
  else if (ownerUnit.name.includes('Platform')) objectivePattern = OBJECTIVE_PATTERNS.platform;
  else if (ownerUnit.name.includes('Security')) objectivePattern = OBJECTIVE_PATTERNS.security;
  else if (ownerUnit.name.includes('Data')) objectivePattern = OBJECTIVE_PATTERNS.data;
  else objectivePattern = OBJECTIVE_PATTERNS.product;

  // Create 2-4 objectives for direct children
  const objectiveCount = randomInt(2, 4);
  const selectedObjectiveNames = objectivePattern.slice(0, objectiveCount);

  const objectives = [];
  for (const [idx, objName] of selectedObjectiveNames.entries()) {
    // Assign to 1-2 random child units
    const assignCount = Math.min(randomInt(1, 2), childUnits.length);
    const assignedUnits = childUnits.slice(0, assignCount);

    const objective = await prisma.objective.create({
      data: {
        title: `${objName} - ${name}`,
        description: `${objName} for project: ${name}`,
        projectId: project.id,
        targetDate: targetDate,
        createdBy: owner.id,
      },
    });

    // Create objective assignments
    for (const unit of assignedUnits) {
      await prisma.objectiveAssignment.create({
        data: {
          objectiveId: objective.id,
          organizationalUnitId: unit.id,
        },
      });
    }

    objectives.push({ objective, assignedUnits });
  }

  // Create cascading refinements and work items
  for (const { objective, assignedUnits } of objectives) {
    for (const unit of assignedUnits) {
      await createRefinementCascade(
        objective,
        unit,
        allUnits,
        users,
        status === 'completed' ? 1.0 : status === 'active' ? 0.4 : 0.0
      );
    }
  }

  return { project, objectives };
}

async function createRefinementCascade(parentObjective, currentUnit, allUnits, users, completionRate) {
  const user = users.find(u => u.organizationalUnitId === currentUnit.id);
  
  // Determine session status based on completion rate
  let sessionStatus;
  if (completionRate >= 0.8) sessionStatus = 'completed';
  else if (completionRate >= 0.2) sessionStatus = 'in-progress';
  else sessionStatus = 'not-started';

  const session = await prisma.refinementSession.create({
    data: {
      projectId: parentObjective.projectId,
      objectiveId: parentObjective.id,
      status: sessionStatus,
      createdBy: user.id,
      completedAt: sessionStatus === 'completed' ? daysAgo(randomInt(5, 30)) : null,
    },
  });

  // If leaf tier (tier 4), create work items
  if (currentUnit.tier === 4) {
    const itemCount = randomInt(5, 10);
    const workItemType = randomChoice(['backend', 'frontend', 'testing', 'deployment']);
    const templates = WORK_ITEM_TEMPLATES[workItemType];

    for (let i = 0; i < itemCount; i++) {
      const template = templates[i % templates.length];
      
      // Determine status based on completion rate
      let status, priority, completedAt;
      const rand = Math.random();
      if (rand < completionRate) {
        status = 'Done';
        priority = randomChoice(['P1', 'P2']);
        completedAt = daysAgo(randomInt(5, 60));
      } else if (rand < completionRate + 0.3) {
        status = 'In Progress';
        priority = 'P1';
        completedAt = null;
      } else if (rand < completionRate + 0.5) {
        status = 'Ready';
        priority = randomChoice(['P1', 'P2']);
        completedAt = null;
      } else {
        status = 'Backlog';
        priority = randomChoice(['P2', 'P3']);
        completedAt = null;
      }

      await prisma.workItem.create({
        data: {
          refinementSessionId: session.id,
          title: `${template} - ${i + 1}`,
          priority,
          stackRank: i,
          status,
          assignedOrgUnit: currentUnit.id,
          createdBy: user.id,
          completedAt,
        },
      });
    }
  } else {
    // Non-leaf tier: create 1-3 child objectives and assign to children
    const childUnits = allUnits.filter(u => u.parentId === currentUnit.id);
    if (childUnits.length === 0) return;

    const childObjCount = randomInt(1, Math.min(3, childUnits.length));
    
    for (let i = 0; i < childObjCount; i++) {
      const childObjective = await prisma.objective.create({
        data: {
          title: `${parentObjective.title} - Phase ${i + 1}`,
          description: `Child objective for ${parentObjective.title}`,
          projectId: parentObjective.projectId,
          targetDate: parentObjective.targetDate,
          parentObjectiveId: parentObjective.id,
          createdBy: user.id,
        },
      });

      // Assign to 1-2 child units
      const assignCount = Math.min(randomInt(1, 2), childUnits.length);
      const assignedUnits = childUnits.slice(i % childUnits.length, (i % childUnits.length) + assignCount);

      for (const unit of assignedUnits) {
        await prisma.objectiveAssignment.create({
          data: {
            objectiveId: childObjective.id,
            organizationalUnitId: unit.id,
          },
        });

        // Recursively cascade down
        await createRefinementCascade(
          childObjective,
          unit,
          allUnits,
          users,
          completionRate * 0.9 // Slightly reduce completion as we go down
        );
      }
    }
  }
}

async function createDependencies(allObjectives) {
  console.log('🔗 Creating objective dependencies...');

  // Group objectives by project
  const objectivesByProject = {};
  for (const obj of allObjectives) {
    if (!objectivesByProject[obj.projectId]) {
      objectivesByProject[obj.projectId] = [];
    }
    objectivesByProject[obj.projectId].push(obj);
  }

  let dependencyCount = 0;

  // Create dependencies within each project
  for (const [projectId, objectives] of Object.entries(objectivesByProject)) {
    if (objectives.length < 2) continue;

    // Sort by creation to get logical order
    objectives.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Create 1-3 dependencies per project
    const depCount = Math.min(randomInt(1, 3), objectives.length - 1);
    
    for (let i = 0; i < depCount; i++) {
      const predecessor = objectives[i];
      const successor = objectives[i + 1];

      await prisma.objectiveDependency.create({
        data: {
          predecessorId: predecessor.id,
          successorId: successor.id,
          type: 'FS', // Finish-to-Start
        },
      });
      dependencyCount++;
    }
  }

  console.log(`✅ Created ${dependencyCount} objective dependencies`);
}

async function createThroughputData(teams) {
  console.log('📊 Creating historical throughput data...');

  for (const team of teams) {
    for (let weekOffset = 12; weekOffset > 0; weekOffset--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (weekOffset * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Vary throughput: 3-8 items per week
      const throughput = randomInt(3, 8);

      await prisma.teamThroughput.create({
        data: {
          organizationalUnitId: team.id,
          weekStartDate: weekStart.toISOString().split('T')[0],
          weekEndDate: weekEnd.toISOString().split('T')[0],
          itemsCompleted: throughput,
        },
      });
    }
  }

  console.log(`✅ Created ${teams.length * 12} throughput records`);
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log('🌱 Starting production seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.workItem.deleteMany();
  await prisma.refinementSession.deleteMany();
  await prisma.objectiveDependency.deleteMany();
  await prisma.objectiveAssignment.deleteMany();
  await prisma.objective.deleteMany();
  await prisma.project.deleteMany();
  await prisma.teamThroughput.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organizationalUnit.deleteMany();
  console.log('✅ Cleared existing data\n');

  // Create org structure
  const orgUnits = await createOrgStructure();
  const { company, divisions, departments, teams } = orgUnits;
  const allUnits = [company, ...divisions, ...departments, ...teams];

  // Create users
  const users = await createUsers(orgUnits);

  // Create projects with cascading objectives
  console.log('\n📋 Creating projects with cascading objectives and refinements...');
  
  const allObjectives = [];
  
  for (let i = 0; i < PROJECT_TEMPLATES.length; i++) {
    const template = PROJECT_TEMPLATES[i];
    
    // Distribute ownership: 70% T1, 20% T2, 10% T3
    let ownerUnit, childUnits;
    const rand = Math.random();
    
    if (rand < 0.7) {
      // Tier 1 (Company) owns project
      ownerUnit = company;
      childUnits = divisions;
    } else if (rand < 0.9) {
      // Tier 2 (Division) owns project
      ownerUnit = randomChoice(divisions);
      childUnits = departments.filter(d => d.parentId === ownerUnit.id);
    } else {
      // Tier 3 (Department) owns project
      ownerUnit = randomChoice(departments);
      childUnits = teams.filter(t => t.parentId === ownerUnit.id);
    }

    const { project, objectives } = await createProjectWithCascade(
      template,
      ownerUnit,
      childUnits,
      allUnits,
      users,
      i
    );

    allObjectives.push(...objectives.map(o => o.objective));
    console.log(`  ✅ ${project.title} (${ownerUnit.name} → ${childUnits.length} units)`);
  }

  // Fetch all objectives (including child objectives created in cascade)
  const allDbObjectives = await prisma.objective.findMany();
  console.log(`\n✅ Created ${PROJECT_TEMPLATES.length} projects with ${allDbObjectives.length} total objectives`);

  // Create dependencies
  await createDependencies(allDbObjectives);

  // Create throughput data
  await createThroughputData(teams);

  console.log('\n🎉 Seed completed successfully!');
  console.log(`\nSummary:`);
  console.log(`  - ${allUnits.length} organizational units (4 tiers)`);
  console.log(`  - ${users.length} users`);
  console.log(`  - ${PROJECT_TEMPLATES.length} projects (3 completed, 5 active, 2 planning)`);
  console.log(`  - ${allDbObjectives.length} objectives (cascading through tiers)`);
  console.log(`  - ~${teams.length * 7} work items (dynamic based on cascade)`);
  console.log(`  - ${teams.length * 12} throughput records (12 weeks per team)\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
