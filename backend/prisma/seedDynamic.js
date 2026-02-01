import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============================================
// UTILITY FUNCTIONS
// ============================================

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD string
}

function daysAgoDateTime(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString(); // Return full ISO datetime string
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD string
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================
// CORE SEED FUNCTIONS
// ============================================

async function createOrganization() {
  console.log('🏢 Creating organizational structure...');

  // Tier 1: Company
  const company = await prisma.organizationalUnit.create({
    data: {
      name: 'Synapse Solutions',
      tier: 1,
      parentId: null,
    },
  });

  // Tier 2: Divisions
  const divisions = await Promise.all([
    prisma.organizationalUnit.create({
      data: { name: 'Engineering', tier: 2, parentId: company.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Product', tier: 2, parentId: company.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Data & Analytics', tier: 2, parentId: company.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Security', tier: 2, parentId: company.id },
    }),
  ]);

  const [engDiv, productDiv, dataDiv, secDiv] = divisions;

  // Tier 3: Departments
  const departments = await Promise.all([
    // Engineering departments
    prisma.organizationalUnit.create({
      data: { name: 'Backend Engineering', tier: 3, parentId: engDiv.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Frontend Engineering', tier: 3, parentId: engDiv.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'DevOps', tier: 3, parentId: engDiv.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'QA Engineering', tier: 3, parentId: engDiv.id },
    }),
    // Product departments
    prisma.organizationalUnit.create({
      data: { name: 'Product Management', tier: 3, parentId: productDiv.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Product Design', tier: 3, parentId: productDiv.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Product Marketing', tier: 3, parentId: productDiv.id },
    }),
    // Data departments
    prisma.organizationalUnit.create({
      data: { name: 'Data Science', tier: 3, parentId: dataDiv.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Data Engineering', tier: 3, parentId: dataDiv.id },
    }),
    // Security departments
    prisma.organizationalUnit.create({
      data: { name: 'Security Engineering', tier: 3, parentId: secDiv.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'IT Operations', tier: 3, parentId: secDiv.id },
    }),
  ]);

  const [
    backendDept,
    frontendDept,
    devopsDept,
    qaDept,
    productMgmtDept,
    productDesignDept,
    productMktgDept,
    dataSciDept,
    dataEngDept,
    secEngDept,
    itOpsDept,
  ] = departments;

  // Tier 4: Teams (leaf units)
  const teams = await Promise.all([
    // Backend teams
    prisma.organizationalUnit.create({
      data: { name: 'Core Backend Team', tier: 4, parentId: backendDept.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'API Team', tier: 4, parentId: backendDept.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Platform Team', tier: 4, parentId: backendDept.id },
    }),
    // Frontend teams
    prisma.organizationalUnit.create({
      data: { name: 'Web Team', tier: 4, parentId: frontendDept.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Mobile Team', tier: 4, parentId: frontendDept.id },
    }),
    // DevOps teams
    prisma.organizationalUnit.create({
      data: { name: 'Infrastructure Team', tier: 4, parentId: devopsDept.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'CI/CD Team', tier: 4, parentId: devopsDept.id },
    }),
    // QA teams
    prisma.organizationalUnit.create({
      data: { name: 'Automation QA Team', tier: 4, parentId: qaDept.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Manual QA Team', tier: 4, parentId: qaDept.id },
    }),
    // Product teams
    prisma.organizationalUnit.create({
      data: { name: 'Core Product Team', tier: 4, parentId: productMgmtDept.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Growth Product Team', tier: 4, parentId: productMgmtDept.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Design Systems Team', tier: 4, parentId: productDesignDept.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'UX Research Team', tier: 4, parentId: productDesignDept.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Marketing Team', tier: 4, parentId: productMktgDept.id },
    }),
    // Data teams
    prisma.organizationalUnit.create({
      data: { name: 'ML Team', tier: 4, parentId: dataSciDept.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Analytics Team', tier: 4, parentId: dataSciDept.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'Data Pipeline Team', tier: 4, parentId: dataEngDept.id },
    }),
    // Security teams
    prisma.organizationalUnit.create({
      data: { name: 'AppSec Team', tier: 4, parentId: secEngDept.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'InfraSec Team', tier: 4, parentId: secEngDept.id },
    }),
    prisma.organizationalUnit.create({
      data: { name: 'SecOps Team', tier: 4, parentId: itOpsDept.id },
    }),
  ]);

  console.log(
    `✅ Created ${1 + divisions.length + departments.length + teams.length} organizational units`
  );

  return {
    company,
    divisions: { engDiv, productDiv, dataDiv, secDiv },
    departments: {
      backendDept,
      frontendDept,
      devopsDept,
      qaDept,
      productMgmtDept,
      productDesignDept,
      productMktgDept,
      dataSciDept,
      dataEngDept,
      secEngDept,
      itOpsDept,
    },
    teams,
  };
}

async function createUsers(org) {
  console.log('👥 Creating users...');

  const allUnits = [
    org.company,
    ...Object.values(org.divisions),
    ...Object.values(org.departments),
    ...org.teams,
  ];

  const users = [];
  const names = [
    'Sarah Chen',
    'Marcus Johnson',
    'Priya Patel',
    'James Wilson',
    'Elena Rodriguez',
    'David Kim',
    'Aisha Mohammed',
    'Robert Taylor',
    'Maria Garcia',
    'Alex Thompson',
    'Yuki Tanaka',
    'Omar Hassan',
    'Sophie Martin',
    'Carlos Silva',
    'Fatima Ali',
    'Michael Brown',
    'Nadia Ivanova',
    'Jamal Williams',
    'Lisa Anderson',
    'Ahmed Khan',
  ];

  // Hash the default password once (password: "password")
  const hashedPassword = await bcrypt.hash('password', 10);
  
  // Hash demo password
  const demoPassword = await bcrypt.hash('PathwaysDemo2026', 10);

  // Create demo user for shared demo access
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@pathways.app',
      password: demoPassword,
      role: 'Member',
      organizationalUnit: org.company.id,
    },
  });
  users.push(demoUser);

  // Create Sarah Chen as company owner (Tier 1) - first user
  const sarahEmail = 'sarah.chen@synapse.io';
  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Chen',
      email: sarahEmail,
      password: hashedPassword,
      role: 'Member',
      organizationalUnit: org.company.id, // Explicitly assign to company
    },
  });
  users.push(sarah);

  // Create remaining users distributed across all units
  for (let idx = 1; idx < names.length; idx++) {
    const name = names[idx];
    const unit = allUnits[idx % allUnits.length];
    const email = name.toLowerCase().replace(' ', '.') + '@synapse.io';
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'Member',
        organizationalUnit: unit.id,
      },
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users`);
  console.log(`📝 All users have password: "password"`);
  return users;
}

function getUserByUnit(unitId, users, org) {
  const allUnits = [
    org.company,
    ...Object.values(org.divisions),
    ...Object.values(org.departments),
    ...org.teams,
  ];
  const user = users.find((u) => u.organizationalUnit === unitId);
  return user || users[0];
}

async function createThroughputData(teams, users, org) {
  console.log('📊 Creating historical throughput data...');

  const throughputData = [];
  for (const team of teams) {
    // Generate 12 weeks of throughput
    for (let weekOffset = 12; weekOffset > 0; weekOffset--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekOffset * 7);

      // Random throughput 3-8 items per week
      const itemsCompleted = Math.floor(Math.random() * 6) + 3;

      throughputData.push({
        teamId: team.id,
        weekStartDate: weekStart,
        itemsCompleted,
      });
    }
  }

  await prisma.teamThroughput.createMany({ data: throughputData });
  console.log(`✅ Created ${throughputData.length} throughput records`);
}

async function createProjectWithCascade({
  ownerUnit,
  ownerTierNum,
  childUnits,
  projectData,
  objectivesConfig,
  users,
  org,
}) {
  // Create project
  const project = await prisma.project.create({
    data: {
      ...projectData,
      ownerUnit: ownerUnit.id,
      ownerTier: ownerTierNum,
      createdBy: getUserByUnit(ownerUnit.id, users, org).id,
    },
  });

  const objectives = [];
  const refinementSessions = [];

  // Create objectives and assign to child units
  for (const objConfig of objectivesConfig) {
    const objective = await prisma.objective.create({
      data: {
        title: objConfig.title,
        description: objConfig.description || null,
        projectId: project.id,
        fromTier: ownerTierNum,
        targetDate: objConfig.targetDate,
        createdBy: getUserByUnit(ownerUnit.id, users, org).id,
      },
    });
    objectives.push(objective);

    // Assign to specified child units
    const assignedUnits = objConfig.assignedUnits || childUnits;
    await prisma.objectiveAssignment.createMany({
      data: assignedUnits.map((unit) => ({
        objectiveId: objective.id,
        unitId: unit.id,
      })),
    });

    // Create refinement session for the objective (one per objective)
    const session = await prisma.refinementSession.create({
      data: {
        projectId: project.id,
        objectiveId: objective.id,
        status: objConfig.sessionStatus || 'not-started',
        createdBy: getUserByUnit(ownerUnit.id, users, org).id,
        completedAt: objConfig.sessionStatus === 'completed' ? daysAgoDateTime(3) : null,
      },
    });
    refinementSessions.push(session);

    // Create unit completion records for each assigned unit if session is completed
    if (objConfig.sessionStatus === 'completed') {
      for (const unit of assignedUnits) {
        await prisma.refinementUnitCompletion.create({
          data: {
            refinementSessionId: session.id,
            organizationalUnitId: unit.id,
            completedBy: getUserByUnit(unit.id, users, org).id,
          },
        });
      }
    }
  }

  return { project, objectives, refinementSessions };
}

async function refineObjectiveIntoDeeperLevel({
  parentSession,
  childUnits,
  childObjectivesConfig,
  users,
  org,
}) {
  const childObjectives = [];
  const childSessions = [];

  for (const childConfig of childObjectivesConfig) {
    // Get the parent objective to determine the tier
    const parentObjective = await prisma.objective.findUnique({
      where: { id: parentSession.objectiveId },
    });
    
    const childObjective = await prisma.objective.create({
      data: {
        title: childConfig.title,
        description: childConfig.description || null,
        projectId: parentSession.projectId,
        parentObjectiveId: parentSession.objectiveId,
        fromTier: parentObjective.fromTier,
        targetDate: childConfig.targetDate,
        createdBy: getUserByUnit(childUnits[0].id, users, org).id,
      },
    });
    childObjectives.push(childObjective);

    // Assign to child units
    const assignedUnits = childConfig.assignedUnits || childUnits;
    await prisma.objectiveAssignment.createMany({
      data: assignedUnits.map((unit) => ({
        objectiveId: childObjective.id,
        unitId: unit.id,
      })),
    });

    // Create refinement session for the child objective
    const session = await prisma.refinementSession.create({
      data: {
        projectId: parentSession.projectId,
        objectiveId: childObjective.id,
        status: childConfig.sessionStatus || 'not-started',
        createdBy: getUserByUnit(assignedUnits[0].id, users, org).id,
        completedAt: childConfig.sessionStatus === 'completed' ? daysAgoDateTime(2) : null,
      },
    });
    childSessions.push(session);

    // Create unit completion records for each assigned unit if session is completed
    if (childConfig.sessionStatus === 'completed') {
      for (const unit of assignedUnits) {
        await prisma.refinementUnitCompletion.create({
          data: {
            refinementSessionId: session.id,
            organizationalUnitId: unit.id,
            completedBy: getUserByUnit(unit.id, users, org).id,
          },
        });
      }
    }
  }

  return { childObjectives, childSessions };
}

async function createWorkItemsForSession({
  session,
  workItemsConfig,
  leafTeam,
  users,
  org,
}) {
  const workItems = [];

  for (const [idx, itemConfig] of workItemsConfig.entries()) {
    const workItem = await prisma.workItem.create({
      data: {
        refinementSessionId: session.id,
        title: itemConfig.title,
        description: itemConfig.description || null,
        type: itemConfig.type || 'Story',
        priority: itemConfig.priority || 'P2',
        stackRank: idx,
        status: itemConfig.status || 'Backlog',
        assignedOrgUnit: leafTeam.id,
        createdBy: getUserByUnit(leafTeam.id, users, org).id,
        completedAt: itemConfig.completedAt || null,
      },
    });
    workItems.push(workItem);
  }

  return workItems;
}

async function createOandMWorkItems(teams, users, org) {
  console.log('🔧 Creating O&M (Operations & Maintenance) work items...');

  const omWorkItems = [];
  const omTasks = [
    'Update dependencies',
    'Fix security vulnerabilities',
    'Refactor legacy code',
    'Update documentation',
    'Database maintenance',
    'Server patching',
    'Monitor system health',
    'Investigate production errors',
    'Optimize slow queries',
    'Clean up old data',
    'Update SSL certificates',
    'Review access permissions',
    'Backup verification',
    'Log rotation setup',
    'Performance monitoring',
    'Error tracking setup',
    'Update CI/CD pipeline',
    'Library version updates',
    'Technical debt reduction',
    'Code quality improvements',
    'Test coverage improvements',
    'Fix flaky tests',
    'Update API documentation',
    'Infrastructure cost optimization',
    'Security audit tasks',
  ];

  // Distribute 100 O&M items across all teams
  for (let i = 0; i < 100; i++) {
    const team = teams[i % teams.length];
    const task = omTasks[i % omTasks.length];
    const user = getUserByUnit(team.id, users, org);
    
    // Mix of statuses weighted toward Done/In Progress
    const statusRoll = Math.random();
    let status, completedAt = null;
    if (statusRoll < 0.4) {
      status = 'Done';
      completedAt = daysAgoDateTime(Math.floor(Math.random() * 30) + 1);
    } else if (statusRoll < 0.6) {
      status = 'In Progress';
    } else if (statusRoll < 0.8) {
      status = 'Ready';
    } else {
      status = 'Backlog';
    }

    const priority = Math.random() < 0.3 ? 'P1' : 'P2';

    const workItem = await prisma.workItem.create({
      data: {
        title: `${task} #${i + 1}`,
        description: `Operational maintenance task for ${team.name}`,
        type: 'Task',
        priority,
        stackRank: i,
        status,
        assignedOrgUnit: team.id,
        createdBy: user.id,
        completedAt,
      },
    });
    omWorkItems.push(workItem);
  }

  console.log(`✅ Created ${omWorkItems.length} O&M work items`);
  return omWorkItems;
}

async function createProjects(org, users) {
  console.log('📋 Creating projects with cascading objectives...');

  const { company, divisions, departments, teams } = org;

  // ============================================
  // PROJECT 1: Customer Portal v2.0 (Tier 1 → Cascade All Tiers)
  // Status: Active, well-progressed
  // ============================================
  console.log('  Creating Customer Portal v2.0...');

  const portalProject = await createProjectWithCascade({
    ownerUnit: company,
    ownerTierNum: 1,
    childUnits: [divisions.engDiv, divisions.productDiv],
    projectData: {
      title: 'Customer Portal v2.0',
      description: 'Enhanced portal with advanced features and better UX',
      status: 'Active',
      startDate: daysAgo(60),
      targetDate: daysFromNow(30),
      budget: 350000,
    },
    objectivesConfig: [
      {
        title: 'Build Portal Backend Services',
        assignedUnits: [divisions.engDiv],
        targetDate: daysFromNow(15),
        sessionStatus: 'completed',
      },
      {
        title: 'Design Portal UI/UX',
        assignedUnits: [divisions.productDiv],
        targetDate: daysFromNow(20),
        sessionStatus: 'completed',
      },
    ],
    users,
    org,
  });

  // Refine Backend Services (Eng Division → Departments)
  const backendObjective = portalProject.objectives.find(
    (o) => o.title === 'Build Portal Backend Services'
  );
  const backendSession = portalProject.refinementSessions.find(
    (s) => s.objectiveId === backendObjective.id
  );

  const portalBackendRefinement = await refineObjectiveIntoDeeperLevel({
    parentSession: backendSession,
    childUnits: [departments.backendDept, departments.qaDept],
    childObjectivesConfig: [
      {
        title: 'Develop Backend APIs',
        assignedUnits: [departments.backendDept],
        targetDate: daysFromNow(10),
        sessionStatus: 'completed',
      },
      {
        title: 'QA Testing for Backend',
        assignedUnits: [departments.qaDept],
        targetDate: daysFromNow(15),
        sessionStatus: 'in-progress',
      },
    ],
    users,
    org,
  });

  // Backend APIs (Backend Dept → Teams)
  const backendApiObjective = portalBackendRefinement.childObjectives.find(
    (o) => o.title === 'Develop Backend APIs'
  );
  const backendApiSession = portalBackendRefinement.childSessions.find(
    (s) => s.objectiveId === backendApiObjective.id
  );

  const backendTeams = teams.filter((t) => t.parentId === departments.backendDept.id);
  await createWorkItemsForSession({
    session: backendApiSession,
    leafTeam: backendTeams[0],
    workItemsConfig: [
      { title: 'Design API schema', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(30) },
      { title: 'Implement auth endpoints', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(25) },
      { title: 'Build user profile APIs', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(20) },
      { title: 'Add caching layer', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(18) },
      { title: 'Optimize database queries', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(15) },
      { title: 'Implement rate limiting', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(12) },
      { title: 'Add API versioning', priority: 'P2', status: 'In Progress' },
      { title: 'Write API documentation', priority: 'P2', status: 'In Progress' },
      { title: 'Add request validation', priority: 'P2', status: 'Ready' },
      { title: 'Implement pagination', priority: 'P2', status: 'Ready' },
      { title: 'Add filtering capabilities', priority: 'P2', status: 'Ready' },
      { title: 'Error handling middleware', priority: 'P2', status: 'Backlog' },
      { title: 'API metrics & monitoring', priority: 'P2', status: 'Backlog' },
      { title: 'Request logging', priority: 'P2', status: 'Backlog' },
      { title: 'API key management', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // QA Testing (QA Dept → Teams)
  const qaObjective = portalBackendRefinement.childObjectives.find(
    (o) => o.title === 'QA Testing for Backend'
  );
  const qaSession = portalBackendRefinement.childSessions.find(
    (s) => s.objectiveId === qaObjective.id
  );

  const qaTeams = teams.filter((t) => t.parentId === departments.qaDept.id);
  await createWorkItemsForSession({
    session: qaSession,
    leafTeam: qaTeams[0],
    workItemsConfig: [
      { title: 'Write test plan', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(10) },
      { title: 'Create test cases', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(8) },
      { title: 'Execute regression tests', priority: 'P1', status: 'In Progress' },
      { title: 'Performance testing', priority: 'P2', status: 'In Progress' },
      { title: 'Security testing', priority: 'P2', status: 'Ready' },
      { title: 'Load testing', priority: 'P2', status: 'Ready' },
      { title: 'API contract testing', priority: 'P2', status: 'Ready' },
      { title: 'Cross-browser testing', priority: 'P2', status: 'Backlog' },
      { title: 'Accessibility testing', priority: 'P2', status: 'Backlog' },
      { title: 'Test automation', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // ============================================
  // PROJECT 2: Cloud Migration Phase 1 (Tier 1 → Full Cascade)
  // Status: Active, mid-progress
  // ============================================
  console.log('  Creating Cloud Migration Phase 1...');

  const cloudProject = await createProjectWithCascade({
    ownerUnit: company,
    ownerTierNum: 1,
    childUnits: [divisions.engDiv],
    projectData: {
      title: 'Cloud Migration Phase 1',
      description: 'Migrate core services to AWS',
      status: 'Active',
      startDate: daysAgo(45),
      targetDate: daysFromNow(60),
      budget: 500000,
    },
    objectivesConfig: [
      {
        title: 'Migrate Infrastructure',
        targetDate: daysFromNow(30),
        sessionStatus: 'completed',
      },
      {
        title: 'Implement Security Controls',
        targetDate: daysFromNow(50),
        sessionStatus: 'in-progress',
      },
    ],
    users,
    org,
  });

  const infraSession = cloudProject.refinementSessions[0];
  const cloudInfraRefinement = await refineObjectiveIntoDeeperLevel({
    parentSession: infraSession,
    childUnits: [departments.devopsDept, departments.backendDept],
    childObjectivesConfig: [
      {
        title: 'Setup AWS Infrastructure',
        assignedUnits: [departments.devopsDept],
        targetDate: daysFromNow(20),
        sessionStatus: 'completed',
      },
      {
        title: 'Migrate Application Services',
        assignedUnits: [departments.backendDept],
        targetDate: daysFromNow(30),
        sessionStatus: 'in-progress',
      },
    ],
    users,
    org,
  });

  const devopsObjective = cloudInfraRefinement.childObjectives.find(
    (o) => o.title === 'Setup AWS Infrastructure'
  );
  const devopsSession = cloudInfraRefinement.childSessions.find(
    (s) => s.objectiveId === devopsObjective.id
  );
  const devopsTeams = teams.filter((t) => t.parentId === departments.devopsDept.id);
  await createWorkItemsForSession({
    session: devopsSession,
    leafTeam: devopsTeams[0],
    workItemsConfig: [
      { title: 'Provision VPC and subnets', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(15) },
      { title: 'Setup EKS cluster', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(12) },
      { title: 'Configure RDS instances', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(10) },
      { title: 'Setup CloudFront CDN', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(8) },
      { title: 'Implement monitoring', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(6) },
      { title: 'Configure auto-scaling', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(5) },
      { title: 'Setup backup strategy', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(4) },
      { title: 'Configure WAF', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(3) },
      { title: 'Setup disaster recovery', priority: 'P2', status: 'In Progress' },
      { title: 'Implement blue-green deployment', priority: 'P2', status: 'Ready' },
      { title: 'Cost optimization review', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // Start Migrate Application Services with work items
  const migrateAppObjective = cloudInfraRefinement.childObjectives.find(
    (o) => o.title === 'Migrate Application Services'
  );
  const migrateAppSession = cloudInfraRefinement.childSessions.find(
    (s) => s.objectiveId === migrateAppObjective.id
  );
  const backendTeamsForCloud = teams.filter((t) => t.parentId === departments.backendDept.id);
  await createWorkItemsForSession({
    session: migrateAppSession,
    leafTeam: backendTeamsForCloud[2],
    workItemsConfig: [
      { title: 'Audit current services', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(8) },
      { title: 'Containerize applications', priority: 'P1', status: 'In Progress' }, // Changed from Done
      { title: 'Create Kubernetes manifests', priority: 'P1', status: 'In Progress' },
      { title: 'Migrate authentication service', priority: 'P1', status: 'Ready' }, // Changed from In Progress
      { title: 'Migrate API gateway', priority: 'P1', status: 'Ready' }, // Changed to P1
      { title: 'Update service discovery', priority: 'P1', status: 'Ready' }, // Changed to P1
      { title: 'Configure health checks', priority: 'P1', status: 'Backlog' }, // Changed to P1
      { title: 'Load testing', priority: 'P1', status: 'Backlog' }, // Changed to P1
      { title: 'Database migration', priority: 'P2', status: 'Backlog' },
      { title: 'Configure monitoring', priority: 'P2', status: 'Backlog' },
      { title: 'Setup alerting', priority: 'P2', status: 'Backlog' },
      { title: 'Update documentation', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // ============================================
  // PROJECT 3: Mobile App v2.0 (Tier 2 → Departments → Teams)
  // Status: Active, early stage
  // ============================================
  console.log('  Creating Mobile App v2.0...');

  const mobileProject = await createProjectWithCascade({
    ownerUnit: divisions.engDiv,
    ownerTierNum: 2,
    childUnits: [departments.frontendDept, departments.backendDept],
    projectData: {
      title: 'Mobile App v2.0',
      description: 'iOS and Android native apps',
      status: 'Active',
      startDate: daysAgo(30),
      targetDate: daysFromNow(90),
      budget: 400000,
    },
    objectivesConfig: [
      {
        title: 'Build Mobile Backend Services',
        assignedUnits: [departments.backendDept],
        targetDate: daysFromNow(30), // Aggressive target - won't make it
        sessionStatus: 'in-progress', // Still has work remaining
      },
      {
        title: 'Develop iOS App',
        assignedUnits: [departments.frontendDept],
        targetDate: daysFromNow(60), // Depends on backend finishing first
        sessionStatus: 'in-progress',
      },
      {
        title: 'Develop Android App',
        assignedUnits: [departments.frontendDept],
        targetDate: daysFromNow(75),
        sessionStatus: 'in-progress',
      },
    ],
    users,
    org,
  });

  const mobileBackendObjective = mobileProject.objectives.find(
    (o) => o.title === 'Build Mobile Backend Services'
  );
  const mobileBackendSession = mobileProject.refinementSessions.find(
    (s) => s.objectiveId === mobileBackendObjective.id
  );
  const backendTeamsForMobile = teams.filter((t) => t.parentId === departments.backendDept.id);
  await createWorkItemsForSession({
    session: mobileBackendSession,
    leafTeam: backendTeamsForMobile[1],
    workItemsConfig: [
      { title: 'Design mobile API', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(20) },
      { title: 'Implement sync endpoints', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(15) },
      { title: 'Add push notification service', priority: 'P1', status: 'In Progress' }, // Changed from Done
      { title: 'Setup CDN for assets', priority: 'P1', status: 'In Progress' }, // Changed from Done
      { title: 'Implement offline support', priority: 'P1', status: 'Ready' }, // Changed from In Progress
      { title: 'Add image optimization', priority: 'P1', status: 'Ready' }, // Changed to P1
      { title: 'Background sync service', priority: 'P1', status: 'Ready' }, // Changed to P1
      { title: 'Conflict resolution logic', priority: 'P1', status: 'Backlog' }, // Changed from Ready
      { title: 'Data compression', priority: 'P1', status: 'Backlog' }, // Changed to P1
      { title: 'Mobile analytics tracking', priority: 'P2', status: 'Backlog' },
      { title: 'Rate limiting', priority: 'P2', status: 'Backlog' },
      { title: 'API versioning', priority: 'P2', status: 'Backlog' },
      { title: 'Monitoring endpoints', priority: 'P2', status: 'Backlog' },
      { title: 'Health check system', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  const iosObjective = mobileProject.objectives.find(
    (o) => o.title === 'Develop iOS App'
  );
  const iosSession = mobileProject.refinementSessions.find(
    (s) => s.objectiveId === iosObjective.id
  );
  const frontendTeams = teams.filter((t) => t.parentId === departments.frontendDept.id);
  await createWorkItemsForSession({
    session: iosSession,
    leafTeam: frontendTeams[1],
    workItemsConfig: [
      { title: 'Setup iOS project', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(18) },
      { title: 'Implement navigation', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(14) },
      { title: 'Build auth screens', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(10) },
      { title: 'Implement offline sync', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(7) },
      { title: 'Add push notifications', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(5) },
      { title: 'Build settings screen', priority: 'P2', status: 'In Progress' },
      { title: 'Implement dark mode', priority: 'P2', status: 'In Progress' },
      { title: 'Add biometric auth', priority: 'P2', status: 'Ready' },
      { title: 'Localization support', priority: 'P2', status: 'Ready' },
      { title: 'App Store assets', priority: 'P2', status: 'Backlog' },
      { title: 'Crash reporting setup', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // Add Android work items
  const androidObjective = mobileProject.objectives.find(
    (o) => o.title === 'Develop Android App'
  );
  const androidSession = mobileProject.refinementSessions.find(
    (s) => s.objectiveId === androidObjective.id
  );
  await createWorkItemsForSession({
    session: androidSession,
    leafTeam: frontendTeams[1],
    workItemsConfig: [
      { title: 'Setup Android project', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(16) },
      { title: 'Implement navigation', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(12) },
      { title: 'Build auth screens', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(9) },
      { title: 'Implement offline sync', priority: 'P1', status: 'In Progress' },
      { title: 'Add push notifications', priority: 'P2', status: 'In Progress' },
      { title: 'Build settings screen', priority: 'P2', status: 'Ready' },
      { title: 'Implement Material Design', priority: 'P2', status: 'Ready' },
      { title: 'Add fingerprint auth', priority: 'P2', status: 'Ready' },
      { title: 'Localization support', priority: 'P2', status: 'Backlog' },
      { title: 'Play Store assets', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // ============================================
  // PROJECT 4: AI Recommendations (Tier 1 → Data Division)
  // Status: Active
  // ============================================
  console.log('  Creating AI-Powered Product Recommendations...');

  const aiProject = await createProjectWithCascade({
    ownerUnit: company,
    ownerTierNum: 1,
    childUnits: [divisions.dataDiv],
    projectData: {
      title: 'AI-Powered Product Recommendations',
      description: 'Machine learning based product recommendation engine',
      status: 'Active',
      startDate: daysAgo(40),
      targetDate: daysFromNow(45),
      budget: 280000,
    },
    objectivesConfig: [
      {
        title: 'Train ML Models',
        targetDate: daysFromNow(20),
        sessionStatus: 'completed',
      },
      {
        title: 'Build Recommendations API',
        targetDate: daysFromNow(35),
        sessionStatus: 'in-progress',
      },
    ],
    users,
    org,
  });

  const mlSession = aiProject.refinementSessions[0];
  const aiMlRefinement = await refineObjectiveIntoDeeperLevel({
    parentSession: mlSession,
    childUnits: [departments.dataSciDept, departments.dataEngDept],
    childObjectivesConfig: [
      {
        title: 'Develop ML Models',
        assignedUnits: [departments.dataSciDept],
        targetDate: daysFromNow(15),
        sessionStatus: 'completed',
      },
      {
        title: 'Build Data Pipeline',
        assignedUnits: [departments.dataEngDept],
        targetDate: daysFromNow(20),
        sessionStatus: 'completed',
      },
    ],
    users,
    org,
  });

  const mlDevObjective = aiMlRefinement.childObjectives.find(
    (o) => o.title === 'Develop ML Models'
  );
  const mlDevSession = aiMlRefinement.childSessions.find(
    (s) => s.objectiveId === mlDevObjective.id
  );
  const dataSciTeams = teams.filter((t) => t.parentId === departments.dataSciDept.id);
  await createWorkItemsForSession({
    session: mlDevSession,
    leafTeam: dataSciTeams[0],
    workItemsConfig: [
      { title: 'Collect training data', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(25) },
      { title: 'Feature engineering', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(18) },
      { title: 'Data cleaning & preprocessing', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(15) },
      { title: 'Train baseline model', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(12) },
      { title: 'Hyperparameter tuning', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(9) },
      { title: 'Model evaluation', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(7) },
      { title: 'Cross-validation', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(5) },
      { title: 'Deploy model to staging', priority: 'P2', status: 'In Progress' },
      { title: 'A/B testing setup', priority: 'P2', status: 'Ready' },
      { title: 'Model monitoring', priority: 'P2', status: 'Ready' },
      { title: 'Production deployment', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // Add Data Pipeline work items
  const dataPipelineObjective = aiMlRefinement.childObjectives.find(
    (o) => o.title === 'Build Data Pipeline'
  );
  const dataPipelineSession = aiMlRefinement.childSessions.find(
    (s) => s.objectiveId === dataPipelineObjective.id
  );
  const dataEngTeamsForAI = teams.filter((t) => t.parentId === departments.dataEngDept.id);
  await createWorkItemsForSession({
    session: dataPipelineSession,
    leafTeam: dataEngTeamsForAI[0],
    workItemsConfig: [
      { title: 'Design pipeline architecture', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(20) },
      { title: 'Setup Airflow DAGs', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(16) },
      { title: 'Implement data ingestion', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(13) },
      { title: 'Build feature store', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(10) },
      { title: 'Add data validation', priority: 'P2', status: 'In Progress' },
      { title: 'Setup monitoring', priority: 'P2', status: 'In Progress' },
      { title: 'Implement retry logic', priority: 'P2', status: 'Ready' },
      { title: 'Optimize pipeline performance', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // ============================================
  // PROJECT 5: Security Operations Center (Tier 3 → Teams directly)
  // Status: Active
  // ============================================
  console.log('  Creating Security Operations Center (SOC)...');

  const socProject = await createProjectWithCascade({
    ownerUnit: departments.secEngDept,
    ownerTierNum: 3,
    childUnits: teams.filter((t) => t.parentId === departments.secEngDept.id),
    projectData: {
      title: 'Security Operations Center (SOC)',
      description: '24/7 security monitoring and incident response',
      status: 'Active',
      startDate: daysAgo(20),
      targetDate: daysFromNow(80),
      budget: 450000,
    },
    objectivesConfig: [
      {
        title: 'Deploy SIEM and Monitoring Tools',
        targetDate: daysFromNow(40),
        sessionStatus: 'completed',
      },
      {
        title: 'Define SOC Processes',
        targetDate: daysFromNow(60),
        sessionStatus: 'in-progress',
      },
    ],
    users,
    org,
  });

  const siemSession = socProject.refinementSessions[0];
  const secTeams = teams.filter((t) => t.parentId === departments.secEngDept.id);
  await createWorkItemsForSession({
    session: siemSession,
    leafTeam: secTeams[0],
    workItemsConfig: [
      { title: 'Evaluate SIEM solutions', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(12) },
      { title: 'Deploy Splunk', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(8) },
      { title: 'Configure log aggregation', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(6) },
      { title: 'Setup alerting rules', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(4) },
      { title: 'Create dashboards', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(3) },
      { title: 'Integrate with ticketing', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(2) },
      { title: 'Define incident response playbooks', priority: 'P2', status: 'In Progress' },
      { title: 'Setup threat intelligence feeds', priority: 'P2', status: 'Ready' },
      { title: 'Compliance reporting', priority: 'P2', status: 'Ready' },
      { title: 'Security metrics & KPIs', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // Add SOC Processes work items
  const socProcessesSession = socProject.refinementSessions[1];
  await createWorkItemsForSession({
    session: socProcessesSession,
    leafTeam: secTeams[1],
    workItemsConfig: [
      { title: 'Document incident response procedures', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(5) },
      { title: 'Create escalation matrix', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(3) },
      { title: 'Define SLA requirements', priority: 'P1', status: 'In Progress' },
      { title: 'Setup on-call rotation', priority: 'P2', status: 'In Progress' },
      { title: 'Create runbooks', priority: 'P2', status: 'Ready' },
      { title: 'Train SOC team', priority: 'P2', status: 'Ready' },
      { title: 'Conduct tabletop exercises', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // ============================================
  // PROJECT 6: API Marketplace (Tier 1 → Planning, NOT YET RELEASED)
  // ============================================
  console.log('  Creating API Marketplace (incomplete initiation)...');

  await createProjectWithCascade({
    ownerUnit: company,
    ownerTierNum: 1,
    childUnits: [divisions.engDiv, divisions.productDiv],
    projectData: {
      title: 'API Marketplace',
      description: 'Centralized API management and monetization',
      status: 'Planning',
      startDate: daysFromNow(15),
      targetDate: daysFromNow(120),
      budget: 320000,
    },
    objectivesConfig: [
      {
        title: 'Design API Marketplace Architecture',
        assignedUnits: [divisions.engDiv],
        targetDate: daysFromNow(45),
        sessionStatus: 'not-started', // Not released yet
      },
      {
        title: 'Build API Catalog',
        assignedUnits: [divisions.engDiv],
        targetDate: daysFromNow(90),
        sessionStatus: 'not-started', // Not released yet
      },
      {
        title: 'API Developer Portal',
        assignedUnits: [divisions.productDiv],
        targetDate: daysFromNow(75),
        sessionStatus: 'not-started', // Not released yet
      },
      {
        title: 'Monetization & Billing System',
        assignedUnits: [divisions.productDiv],
        targetDate: daysFromNow(100),
        sessionStatus: 'not-started', // Not released yet
      },
    ],
    users,
    org,
  });

  // ============================================
  // PROJECT 7: Marketing Analytics (Tier 2 → Planning, NOT YET RELEASED)
  // ============================================
  console.log('  Creating Marketing Analytics Dashboard (incomplete initiation)...');

  await createProjectWithCascade({
    ownerUnit: divisions.productDiv,
    ownerTierNum: 2,
    childUnits: [departments.productMktgDept, departments.productMgmtDept],
    projectData: {
      title: 'Marketing Analytics Dashboard',
      description: 'Real-time marketing performance metrics',
      status: 'Planning',
      startDate: daysFromNow(20),
      targetDate: daysFromNow(100),
      budget: 170000,
    },
    objectivesConfig: [
      {
        title: 'Design Analytics Data Model',
        assignedUnits: [departments.productMktgDept],
        targetDate: daysFromNow(50),
        sessionStatus: 'not-started',
      },
      {
        title: 'Build Dashboard UI',
        assignedUnits: [departments.productMgmtDept],
        targetDate: daysFromNow(70),
        sessionStatus: 'not-started',
      },
      {
        title: 'Integrate with Marketing Platforms',
        assignedUnits: [departments.productMktgDept],
        targetDate: daysFromNow(85),
        sessionStatus: 'not-started',
      },
    ],
    users,
    org,
  });

  // ============================================
  // PROJECT 8: E-Commerce Platform (Tier 1 → Full cascade, ACTIVE)
  // ============================================
  console.log('  Creating E-Commerce Platform...');

  const ecomProject = await createProjectWithCascade({
    ownerUnit: company,
    ownerTierNum: 1,
    childUnits: [divisions.engDiv, divisions.productDiv],
    projectData: {
      title: 'E-Commerce Platform v3',
      description: 'Next-generation e-commerce with personalization',
      status: 'Active',
      startDate: daysAgo(50),
      targetDate: daysFromNow(60),
      budget: 600000,
    },
    objectivesConfig: [
      {
        title: 'Build Product Catalog Service',
        assignedUnits: [divisions.engDiv],
        targetDate: daysFromNow(25),
        sessionStatus: 'completed',
      },
      {
        title: 'Shopping Cart & Checkout',
        assignedUnits: [divisions.engDiv],
        targetDate: daysFromNow(40),
        sessionStatus: 'completed',
      },
      {
        title: 'Design E-Commerce UX',
        assignedUnits: [divisions.productDiv],
        targetDate: daysFromNow(30),
        sessionStatus: 'completed',
      },
      {
        title: 'Payment Integration',
        assignedUnits: [divisions.engDiv],
        targetDate: daysFromNow(35),
        sessionStatus: 'not-started',
      },
    ],
    users,
    org,
  });

  // Refine Product Catalog (Engineering → Backend/Frontend)
  const catalogObjective = ecomProject.objectives.find(o => o.title === 'Build Product Catalog Service');
  const catalogSession = ecomProject.refinementSessions.find(s => s.objectiveId === catalogObjective.id);
  const catalogRefinement = await refineObjectiveIntoDeeperLevel({
    parentSession: catalogSession,
    childUnits: [departments.backendDept, departments.frontendDept],
    childObjectivesConfig: [
      {
        title: 'Product Catalog API',
        assignedUnits: [departments.backendDept],
        targetDate: daysFromNow(15),
        sessionStatus: 'completed',
      },
      {
        title: 'Product Search & Filters',
        assignedUnits: [departments.frontendDept],
        targetDate: daysFromNow(20),
        sessionStatus: 'completed',
      },
    ],
    users,
    org,
  });

  // Refine Shopping Cart objective
  const shoppingCartObjective = ecomProject.objectives.find(o => o.title === 'Shopping Cart & Checkout');
  const shoppingCartSession = ecomProject.refinementSessions.find(s => s.objectiveId === shoppingCartObjective.id);
  const ecomBackendRefinement = await refineObjectiveIntoDeeperLevel({
    parentSession: shoppingCartSession,
    childUnits: [departments.backendDept, departments.frontendDept],
    childObjectivesConfig: [
      {
        title: 'Cart Backend Services',
        assignedUnits: [departments.backendDept],
        targetDate: daysFromNow(25),
        sessionStatus: 'in-progress',
      },
      {
        title: 'Checkout UI',
        assignedUnits: [departments.frontendDept],
        targetDate: daysFromNow(30),
        sessionStatus: 'in-progress',
      },
    ],
    users,
    org,
  });

  // Add Cart Backend work items
  const cartBackendObjective = ecomBackendRefinement.childObjectives.find(o => o.title === 'Cart Backend Services');
  const cartBackendSession = ecomBackendRefinement.childSessions.find(s => s.objectiveId === cartBackendObjective.id);
  await createWorkItemsForSession({
    session: cartBackendSession,
    leafTeam: backendTeams[1],
    workItemsConfig: [
      { title: 'Design cart schema', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(18) },
      { title: 'Implement cart CRUD', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(14) },
      { title: 'Add cart persistence', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(11) },
      { title: 'Implement inventory check', priority: 'P1', status: 'In Progress' },
      { title: 'Add promo code logic', priority: 'P2', status: 'In Progress' },
      { title: 'Cart abandonment tracking', priority: 'P2', status: 'Ready' },
      { title: 'Saved carts feature', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // Add Checkout UI work items
  const checkoutUIObjective = ecomBackendRefinement.childObjectives.find(o => o.title === 'Checkout UI');
  const checkoutUISession = ecomBackendRefinement.childSessions.find(s => s.objectiveId === checkoutUIObjective.id);
  await createWorkItemsForSession({
    session: checkoutUISession,
    leafTeam: frontendTeams[0],
    workItemsConfig: [
      { title: 'Design checkout flow', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(16) },
      { title: 'Build cart summary', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(13) },
      { title: 'Implement address form', priority: 'P1', status: 'In Progress' },
      { title: 'Add payment form', priority: 'P1', status: 'In Progress' },
      { title: 'Order confirmation page', priority: 'P2', status: 'Ready' },
      { title: 'Guest checkout', priority: 'P2', status: 'Ready' },
      { title: 'Express checkout', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // Create work items for catalog API
  const catalogApiObjective = catalogRefinement.childObjectives.find(o => o.title === 'Product Catalog API');
  const catalogApiSession = catalogRefinement.childSessions.find(s => s.objectiveId === catalogApiObjective.id);
  await createWorkItemsForSession({
    session: catalogApiSession,
    leafTeam: backendTeams[0],
    workItemsConfig: [
      { title: 'Design product schema', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(25) },
      { title: 'Implement CRUD endpoints', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(20) },
      { title: 'Add image upload', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(15) },
      { title: 'Implement caching', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(12) },
      { title: 'Add inventory tracking', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(10) },
      { title: 'Product search indexing', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(8) },
      { title: 'Category management', priority: 'P2', status: 'In Progress' },
      { title: 'Product variants support', priority: 'P2', status: 'Ready' },
      { title: 'Bulk import/export', priority: 'P2', status: 'Backlog' },
      { title: 'Product reviews API', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // Add work items for Product Search & Filters
  const searchObjective = catalogRefinement.childObjectives.find(o => o.title === 'Product Search & Filters');
  const searchSession = catalogRefinement.childSessions.find(s => s.objectiveId === searchObjective.id);
  await createWorkItemsForSession({
    session: searchSession,
    leafTeam: frontendTeams[0],
    workItemsConfig: [
      { title: 'Design search UI', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(15) },
      { title: 'Implement search bar', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(12) },
      { title: 'Build filter components', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(9) },
      { title: 'Add faceted search', priority: 'P2', status: 'In Progress' },
      { title: 'Implement sorting options', priority: 'P2', status: 'In Progress' },
      { title: 'Add search suggestions', priority: 'P2', status: 'Ready' },
      { title: 'Pagination component', priority: 'P2', status: 'Ready' },
      { title: 'Search analytics', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // ============================================
  // PROJECT 9: Internal Admin Tools (Tier 2 → Departments, PARTIAL)
  // ============================================
  console.log('  Creating Internal Admin Tools...');

  const adminProject = await createProjectWithCascade({
    ownerUnit: divisions.engDiv,
    ownerTierNum: 2,
    childUnits: [departments.backendDept, departments.frontendDept, departments.qaDept],
    projectData: {
      title: 'Internal Admin Tools',
      description: 'Admin dashboard for operations team',
      status: 'Active',
      startDate: daysAgo(35),
      targetDate: daysFromNow(45),
      budget: 180000,
    },
    objectivesConfig: [
      {
        title: 'User Management System',
        assignedUnits: [departments.backendDept],
        targetDate: daysFromNow(20),
        sessionStatus: 'completed',
      },
      {
        title: 'Admin Dashboard UI',
        assignedUnits: [departments.frontendDept],
        targetDate: daysFromNow(30),
        sessionStatus: 'completed',
      },
      {
        title: 'Reporting & Analytics',
        assignedUnits: [departments.backendDept],
        targetDate: daysFromNow(40),
        sessionStatus: 'in-progress',
      },
      {
        title: 'QA & Testing',
        assignedUnits: [departments.qaDept],
        targetDate: daysFromNow(42),
        sessionStatus: 'not-started',
      },
    ],
    users,
    org,
  });

  // Create work items for User Management
  const userMgmtObjective = adminProject.objectives.find(o => o.title === 'User Management System');
  const userMgmtSession = adminProject.refinementSessions.find(s => s.objectiveId === userMgmtObjective.id);
  await createWorkItemsForSession({
    session: userMgmtSession,
    leafTeam: backendTeams[1],
    workItemsConfig: [
      { title: 'User CRUD endpoints', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(22) },
      { title: 'Role-based access control', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(18) },
      { title: 'Audit logging', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(15) },
      { title: 'Password reset flow', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(12) },
      { title: 'User permissions management', priority: 'P2', status: 'In Progress' },
      { title: 'Session management', priority: 'P2', status: 'Ready' },
      { title: 'Two-factor authentication', priority: 'P2', status: 'Backlog' },
      { title: 'User activity tracking', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // Add work items for Admin Dashboard UI
  const dashboardUIObjective = adminProject.objectives.find(o => o.title === 'Admin Dashboard UI');
  const dashboardUISession = adminProject.refinementSessions.find(s => s.objectiveId === dashboardUIObjective.id);
  await createWorkItemsForSession({
    session: dashboardUISession,
    leafTeam: frontendTeams[0],
    workItemsConfig: [
      { title: 'Design dashboard layout', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(20) },
      { title: 'Build navigation', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(17) },
      { title: 'User list view', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(14) },
      { title: 'User detail page', priority: 'P1', status: 'In Progress' },
      { title: 'User edit form', priority: 'P2', status: 'In Progress' },
      { title: 'Permissions management UI', priority: 'P2', status: 'Ready' },
      { title: 'Activity log viewer', priority: 'P2', status: 'Ready' },
      { title: 'Bulk operations', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // ============================================
  // PROJECT 10: Data Warehouse Modernization (Tier 1 → Active with Planning objectives)
  // ============================================
  console.log('  Creating Data Warehouse Modernization...');

  const dataWarehouseProject = await createProjectWithCascade({
    ownerUnit: company,
    ownerTierNum: 1,
    childUnits: [divisions.dataDiv],
    projectData: {
      title: 'Data Warehouse Modernization',
      description: 'Migrate to Snowflake and implement data lake',
      status: 'Active',
      startDate: daysAgo(25),
      targetDate: daysFromNow(90),
      budget: 520000,
    },
    objectivesConfig: [
      {
        title: 'Migrate Historical Data',
        assignedUnits: [divisions.dataDiv],
        targetDate: daysFromNow(40),
        sessionStatus: 'completed',
      },
      {
        title: 'Build Data Pipeline',
        assignedUnits: [divisions.dataDiv],
        targetDate: daysFromNow(55),
        sessionStatus: 'not-started',
      },
      {
        title: 'Data Governance Framework',
        assignedUnits: [divisions.dataDiv],
        targetDate: daysFromNow(70),
        sessionStatus: 'not-started',
      },
      {
        title: 'Analytics Layer',
        assignedUnits: [divisions.dataDiv],
        targetDate: daysFromNow(85),
        sessionStatus: 'not-started',
      },
    ],
    users,
    org,
  });

  // Refine data migration
  const dataMigrationObjective = dataWarehouseProject.objectives.find(o => o.title === 'Migrate Historical Data');
  const dataMigrationSession = dataWarehouseProject.refinementSessions.find(s => s.objectiveId === dataMigrationObjective.id);
  const dataMigrationRefinement = await refineObjectiveIntoDeeperLevel({
    parentSession: dataMigrationSession,
    childUnits: [departments.dataEngDept],
    childObjectivesConfig: [
      {
        title: 'Extract Legacy Data',
        assignedUnits: [departments.dataEngDept],
        targetDate: daysFromNow(25),
        sessionStatus: 'completed',
      },
      {
        title: 'Transform & Load to Snowflake',
        assignedUnits: [departments.dataEngDept],
        targetDate: daysFromNow(35),
        sessionStatus: 'in-progress',
      },
    ],
    users,
    org,
  });

  const dataExtractObjective = dataMigrationRefinement.childObjectives.find(o => o.title === 'Extract Legacy Data');
  const dataExtractSession = dataMigrationRefinement.childSessions.find(s => s.objectiveId === dataExtractObjective.id);
  const dataEngTeams = teams.filter(t => t.parentId === departments.dataEngDept.id);
  await createWorkItemsForSession({
    session: dataExtractSession,
    leafTeam: dataEngTeams[0],
    workItemsConfig: [
      { title: 'Analyze legacy schema', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(14) },
      { title: 'Write extraction scripts', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(10) },
      { title: 'Test data extraction', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(8) },
      { title: 'Handle data validation', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(6) },
      { title: 'Data quality checks', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(4) },
      { title: 'Error handling & retry logic', priority: 'P2', status: 'In Progress' },
      { title: 'Performance optimization', priority: 'P2', status: 'Ready' },
      { title: 'Incremental extraction', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // Add Transform & Load work items
  const transformLoadObjective = dataMigrationRefinement.childObjectives.find(o => o.title === 'Transform & Load to Snowflake');
  const transformLoadSession = dataMigrationRefinement.childSessions.find(s => s.objectiveId === transformLoadObjective.id);
  await createWorkItemsForSession({
    session: transformLoadSession,
    leafTeam: dataEngTeams[0],
    workItemsConfig: [
      { title: 'Design Snowflake schema', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(7) },
      { title: 'Build transformation logic', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(5) },
      { title: 'Implement data loading', priority: 'P1', status: 'In Progress' },
      { title: 'Add data validation', priority: 'P1', status: 'In Progress' },
      { title: 'Reconciliation checks', priority: 'P2', status: 'Ready' },
      { title: 'Performance tuning', priority: 'P2', status: 'Ready' },
      { title: 'Cutover planning', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // ============================================
  // PROJECT 11: Customer Feedback System (Tier 2 → INCOMPLETE INITIATION)
  // ============================================
  console.log('  Creating Customer Feedback System (incomplete initiation)...');

  await createProjectWithCascade({
    ownerUnit: divisions.productDiv,
    ownerTierNum: 2,
    childUnits: [departments.productMgmtDept, departments.productMktgDept],
    projectData: {
      title: 'Customer Feedback System',
      description: 'Collect and analyze customer feedback across touchpoints',
      status: 'Planning',
      startDate: daysFromNow(10),
      targetDate: daysFromNow(70),
      budget: 145000,
    },
    objectivesConfig: [
      {
        title: 'Design Feedback Collection Flow',
        assignedUnits: [departments.productMgmtDept],
        targetDate: daysFromNow(30),
        sessionStatus: 'not-started',
      },
      {
        title: 'Build Feedback API',
        assignedUnits: [departments.productMgmtDept],
        targetDate: daysFromNow(45),
        sessionStatus: 'not-started',
      },
      {
        title: 'Sentiment Analysis Integration',
        assignedUnits: [departments.productMktgDept],
        targetDate: daysFromNow(55),
        sessionStatus: 'not-started',
      },
    ],
    users,
    org,
  });

  // ============================================
  // PROJECT 12: Performance Optimization (Tier 3 → Teams, ACTIVE)
  // ============================================
  console.log('  Creating Performance Optimization...');

  const perfProject = await createProjectWithCascade({
    ownerUnit: departments.backendDept,
    ownerTierNum: 3,
    childUnits: backendTeams,
    projectData: {
      title: 'System Performance Optimization',
      description: 'Improve application response times and throughput',
      status: 'Active',
      startDate: daysAgo(15),
      targetDate: daysFromNow(50),
      budget: 95000,
    },
    objectivesConfig: [
      {
        title: 'Database Query Optimization',
        assignedUnits: [backendTeams[0]],
        targetDate: daysFromNow(20),
        sessionStatus: 'completed',
      },
      {
        title: 'Implement Caching Strategy',
        assignedUnits: [backendTeams[1]],
        targetDate: daysFromNow(30),
        sessionStatus: 'completed',
      },
      {
        title: 'API Response Optimization',
        assignedUnits: [backendTeams[0]],
        targetDate: daysFromNow(40),
        sessionStatus: 'in-progress',
      },
    ],
    users,
    org,
  });

  // Create work items for DB optimization
  const dbOptObjective = perfProject.objectives.find(o => o.title === 'Database Query Optimization');
  const dbOptSession = perfProject.refinementSessions.find(s => s.objectiveId === dbOptObjective.id);
  await createWorkItemsForSession({
    session: dbOptSession,
    leafTeam: backendTeams[0],
    workItemsConfig: [
      { title: 'Identify slow queries', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(10) },
      { title: 'Add database indexes', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(7) },
      { title: 'Optimize join queries', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(5) },
      { title: 'Implement query batching', priority: 'P2', status: 'Done', completedAt: daysAgoDateTime(3) },
      { title: 'Add connection pooling', priority: 'P2', status: 'In Progress' },
      { title: 'Query result caching', priority: 'P2', status: 'Ready' },
      { title: 'Database partitioning strategy', priority: 'P2', status: 'Backlog' },
      { title: 'Read replicas setup', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // Add Caching Strategy work items
  const cachingObjective = perfProject.objectives.find(o => o.title === 'Implement Caching Strategy');
  const cachingSession = perfProject.refinementSessions.find(s => s.objectiveId === cachingObjective.id);
  await createWorkItemsForSession({
    session: cachingSession,
    leafTeam: backendTeams[1],
    workItemsConfig: [
      { title: 'Design caching architecture', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(8) },
      { title: 'Setup Redis cluster', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(6) },
      { title: 'Implement cache layers', priority: 'P1', status: 'In Progress' },
      { title: 'Add cache invalidation', priority: 'P1', status: 'In Progress' },
      { title: 'Cache monitoring', priority: 'P2', status: 'Ready' },
      { title: 'Cache warming strategies', priority: 'P2', status: 'Ready' },
      { title: 'Cache hit rate optimization', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // Add API Response Optimization work items (will be blocked by Cloud Migration)
  const apiOptObjective = perfProject.objectives.find(o => o.title === 'API Response Optimization');
  const apiOptSession = perfProject.refinementSessions.find(s => s.objectiveId === apiOptObjective.id);
  await createWorkItemsForSession({
    session: apiOptSession,
    leafTeam: backendTeams[0],
    workItemsConfig: [
      { title: 'Profile API endpoints', priority: 'P1', status: 'Done', completedAt: daysAgoDateTime(5) },
      { title: 'Optimize serialization', priority: 'P1', status: 'In Progress' },
      { title: 'Reduce payload sizes', priority: 'P1', status: 'In Progress' },
      { title: 'Implement response compression', priority: 'P1', status: 'Ready' },
      { title: 'Add request batching', priority: 'P1', status: 'Ready' },
      { title: 'Optimize database queries', priority: 'P1', status: 'Backlog' },
      { title: 'Add API throttling', priority: 'P2', status: 'Backlog' },
      { title: 'Response time monitoring', priority: 'P2', status: 'Backlog' },
      { title: 'Load testing', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // ============================================
  // Add completed projects for historical context
  // ============================================
  console.log('  Creating completed projects...');

  await prisma.project.createMany({
    data: [
      {
        title: 'Customer Onboarding Redesign',
        description: 'Streamline new customer onboarding process',
        status: 'Completed',
        startDate: daysAgo(120),
        targetDate: daysAgo(30),
        budget: 125000,
        ownerUnit: company.id,
        ownerTier: 1,
        createdBy: users[0].id,
      },
      {
        title: 'Payment Gateway Integration',
        description: 'Integrate with Stripe and PayPal',
        status: 'Completed',
        startDate: daysAgo(100),
        targetDate: daysAgo(20),
        budget: 85000,
        ownerUnit: divisions.engDiv.id,
        ownerTier: 2,
        createdBy: users[1].id,
      },
      {
        title: 'Data Warehouse Migration Phase 1',
        description: 'Migrate from legacy to modern data warehouse',
        status: 'Completed',
        startDate: daysAgo(150),
        targetDate: daysAgo(40),
        budget: 300000,
        ownerUnit: company.id,
        ownerTier: 1,
        createdBy: users[0].id,
      },
      {
        title: 'Mobile App v1.0',
        description: 'Initial mobile app release',
        status: 'Completed',
        startDate: daysAgo(180),
        targetDate: daysAgo(60),
        budget: 250000,
        ownerUnit: divisions.engDiv.id,
        ownerTier: 2,
        createdBy: users[2].id,
      },
      {
        title: 'Security Audit 2025',
        description: 'Annual security audit and remediation',
        status: 'Completed',
        startDate: daysAgo(90),
        targetDate: daysAgo(15),
        budget: 110000,
        ownerUnit: departments.secEngDept.id,
        ownerTier: 3,
        createdBy: users[3].id,
      },
    ],
  });

  console.log('✅ Created 17 projects (12 with cascading objectives, 5 completed)');
}

async function createDependencies() {
  console.log('🔗 Creating objective dependencies...');

  const objectives = await prisma.objective.findMany();

  // Find specific objectives to create dependencies
  const portalBackendApis = objectives.find((o) => o.title === 'Develop Backend APIs');
  const portalQa = objectives.find((o) => o.title === 'QA Testing for Backend');

  const cloudInfra = objectives.find((o) => o.title === 'Setup AWS Infrastructure');
  const cloudMigrate = objectives.find((o) => o.title === 'Migrate Application Services');

  const mlModels = objectives.find((o) => o.title === 'Develop ML Models');
  const mlPipeline = objectives.find((o) => o.title === 'Build Data Pipeline');

  // Mobile App objectives
  const mobileBackend = objectives.find((o) => o.title === 'Build Mobile Backend Services');
  const iosApp = objectives.find((o) => o.title === 'Develop iOS App');
  const androidApp = objectives.find((o) => o.title === 'Develop Android App');

  // E-Commerce objectives
  const productCatalog = objectives.find((o) => o.title === 'Build Product Catalog Service');
  const shoppingCart = objectives.find((o) => o.title === 'Shopping Cart & Checkout');

  // SOC objectives
  const siem = objectives.find((o) => o.title === 'Deploy SIEM Solution');
  const socProcesses = objectives.find((o) => o.title === 'Establish SOC Processes');

  // Data Warehouse objectives
  const dataExtraction = objectives.find((o) => o.title === 'Data Extraction Layer');
  const dataTransform = objectives.find((o) => o.title === 'Transform & Load Pipeline');

  // Performance objectives
  const dbOptimization = objectives.find((o) => o.title === 'Database Query Optimization');
  const apiOptimization = objectives.find((o) => o.title === 'API Response Optimization');

  const dependencies = [];

  // ============================================
  // SIMPLE DEPENDENCIES (existing)
  // ============================================
  
  // Portal: Backend APIs must complete before QA
  if (portalBackendApis && portalQa) {
    dependencies.push({
      predecessorId: portalBackendApis.id,
      successorId: portalQa.id,
      type: 'FS',
    });
  }

  // Cloud: Infrastructure must be ready before migration
  if (cloudInfra && cloudMigrate) {
    dependencies.push({
      predecessorId: cloudInfra.id,
      successorId: cloudMigrate.id,
      type: 'FS',
    });
  }

  // AI: Data pipeline needed before ML models
  if (mlPipeline && mlModels) {
    dependencies.push({
      predecessorId: mlPipeline.id,
      successorId: mlModels.id,
      type: 'FS',
    });
  }

  // ============================================
  // COMPLEX DEPENDENCIES (will cause delays/alerts)
  // ============================================

  // Mobile App: Backend must be done before iOS and Android apps can complete
  // This creates pressure since iOS/Android are in-progress but backend still has work
  if (mobileBackend && iosApp) {
    dependencies.push({
      predecessorId: mobileBackend.id,
      successorId: iosApp.id,
      type: 'FS',
    });
  }

  if (mobileBackend && androidApp) {
    dependencies.push({
      predecessorId: mobileBackend.id,
      successorId: androidApp.id,
      type: 'FS',
    });
  }

  // E-Commerce: Product catalog must be ready before shopping cart
  if (productCatalog && shoppingCart) {
    dependencies.push({
      predecessorId: productCatalog.id,
      successorId: shoppingCart.id,
      type: 'FS',
    });
  }

  // SOC: SIEM must be deployed before processes can be fully established
  if (siem && socProcesses) {
    dependencies.push({
      predecessorId: siem.id,
      successorId: socProcesses.id,
      type: 'FS',
    });
  }

  // Data Warehouse: Extraction must complete before Transform
  if (dataExtraction && dataTransform) {
    dependencies.push({
      predecessorId: dataExtraction.id,
      successorId: dataTransform.id,
      type: 'FS',
    });
  }

  // ============================================
  // CROSS-PROJECT DEPENDENCIES (create cascading delays)
  // ============================================

  // Cloud migration services must complete before performance API optimization can start
  // This creates a chain: Cloud Infra → Cloud Migrate → API Optimization
  if (cloudMigrate && apiOptimization) {
    dependencies.push({
      predecessorId: cloudMigrate.id,
      successorId: apiOptimization.id,
      type: 'FS',
    });
  }

  // API optimization must complete before mobile backend can finish
  // Chain: Cloud Migrate → API Optimization → Mobile Backend
  if (apiOptimization && mobileBackend) {
    dependencies.push({
      predecessorId: apiOptimization.id,
      successorId: mobileBackend.id,
      type: 'FS',
    });
  }

  // E-commerce shopping cart depends on AI recommendations being ready
  // This shows cross-functional dependency
  if (mlModels && shoppingCart) {
    dependencies.push({
      predecessorId: mlModels.id,
      successorId: shoppingCart.id,
      type: 'FS',
    });
  }

  if (dependencies.length > 0) {
    await prisma.objectiveDependency.createMany({ data: dependencies });
  }

  console.log(`✅ Created ${dependencies.length} objective dependencies (including complex chains that may cause delays)`);
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log('🌱 Starting dynamic seed process...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.objectiveDependency.deleteMany({});
  await prisma.workItem.deleteMany({});
  await prisma.refinementSession.deleteMany({});
  await prisma.objectiveAssignment.deleteMany({});
  await prisma.objective.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.teamThroughput.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organizationalUnit.deleteMany({});
  console.log('✅ Cleaned existing data\n');

  // Create organizational structure
  const org = await createOrganization();

  // Create users
  const users = await createUsers(org);

  // Create throughput data
  await createThroughputData(org.teams, users, org);

  // Create projects with cascading objectives (creates ~200 project work items)
  await createProjects(org, users);

  // Create O&M work items (100 operational work items)
  await createOandMWorkItems(org.teams, users, org);

  // Create dependencies
  await createDependencies();

  // Final summary
  const projectCount = await prisma.project.count();
  const objectiveCount = await prisma.objective.count();
  const workItemCount = await prisma.workItem.count();
  const sessionCount = await prisma.refinementSession.count();

  console.log('\n📊 Seed Summary:');
  console.log(`   Projects: ${projectCount}`);
  console.log(`   Objectives: ${objectiveCount}`);
  console.log(`   Work Items: ${workItemCount}`);
  console.log(`   Refinement Sessions: ${sessionCount}`);

  console.log('\n🎉 Dynamic seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
