import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// UTILITY FUNCTIONS
// ============================================

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
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

  for (const [idx, name] of names.entries()) {
    const unit = allUnits[idx % allUnits.length];
    const email = name.toLowerCase().replace(' ', '.') + '@synapse.io';
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: 'hashed_password_placeholder',
        role: 'Member',
        organizationalUnit: unit.id,
      },
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users`);
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
        organizationalUnitId: unit.id,
      })),
    });

    // Create refinement sessions for each assigned unit
    for (const unit of assignedUnits) {
      const session = await prisma.refinementSession.create({
        data: {
          projectId: project.id,
          objectiveId: objective.id,
          assignedUnitId: unit.id,
          status: objConfig.sessionStatus || 'not-started',
          createdBy: getUserByUnit(unit.id, users, org).id,
          completedAt: objConfig.sessionStatus === 'completed' ? daysAgo(3) : null,
        },
      });
      refinementSessions.push(session);
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
    const childObjective = await prisma.objective.create({
      data: {
        title: childConfig.title,
        description: childConfig.description || null,
        projectId: parentSession.projectId,
        parentId: parentSession.objectiveId,
        targetDate: childConfig.targetDate,
        createdBy: getUserByUnit(parentSession.assignedUnitId, users, org).id,
      },
    });
    childObjectives.push(childObjective);

    // Assign to child units
    const assignedUnits = childConfig.assignedUnits || childUnits;
    await prisma.objectiveAssignment.createMany({
      data: assignedUnits.map((unit) => ({
        objectiveId: childObjective.id,
        organizationalUnitId: unit.id,
      })),
    });

    // Create refinement sessions for each assigned child unit
    for (const unit of assignedUnits) {
      const session = await prisma.refinementSession.create({
        data: {
          projectId: parentSession.projectId,
          objectiveId: childObjective.id,
          assignedUnitId: unit.id,
          status: childConfig.sessionStatus || 'not-started',
          createdBy: getUserByUnit(unit.id, users, org).id,
          completedAt: childConfig.sessionStatus === 'completed' ? daysAgo(2) : null,
        },
      });
      childSessions.push(session);
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
        sessionStatus: 'in-progress',
      },
    ],
    users,
    org,
  });

  // Refine Backend Services (Eng Division → Departments)
  const backendSession = portalProject.refinementSessions.find(
    (s) => s.assignedUnitId === divisions.engDiv.id
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
  const backendApiSession = portalBackendRefinement.childSessions.find(
    (s) => s.assignedUnitId === departments.backendDept.id
  );

  const backendTeams = teams.filter((t) => t.parentId === departments.backendDept.id);
  await createWorkItemsForSession({
    session: backendApiSession,
    leafTeam: backendTeams[0],
    workItemsConfig: [
      { title: 'Design API schema', priority: 'P1', status: 'Done', completedAt: daysAgo(30) },
      { title: 'Implement auth endpoints', priority: 'P1', status: 'Done', completedAt: daysAgo(25) },
      { title: 'Build user profile APIs', priority: 'P1', status: 'Done', completedAt: daysAgo(20) },
      { title: 'Add caching layer', priority: 'P2', status: 'In Progress' },
      { title: 'Optimize database queries', priority: 'P2', status: 'Ready' },
    ],
    users,
    org,
  });

  // QA Testing (QA Dept → Teams)
  const qaSession = portalBackendRefinement.childSessions.find(
    (s) => s.assignedUnitId === departments.qaDept.id
  );

  const qaTeams = teams.filter((t) => t.parentId === departments.qaDept.id);
  await createWorkItemsForSession({
    session: qaSession,
    leafTeam: qaTeams[0],
    workItemsConfig: [
      { title: 'Write test plan', priority: 'P1', status: 'Done', completedAt: daysAgo(10) },
      { title: 'Create test cases', priority: 'P1', status: 'In Progress' },
      { title: 'Execute regression tests', priority: 'P2', status: 'Ready' },
      { title: 'Performance testing', priority: 'P2', status: 'Backlog' },
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
        sessionStatus: 'in-progress',
      },
      {
        title: 'Implement Security Controls',
        targetDate: daysFromNow(50),
        sessionStatus: 'not-started',
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
        sessionStatus: 'in-progress',
      },
      {
        title: 'Migrate Application Services',
        assignedUnits: [departments.backendDept],
        targetDate: daysFromNow(30),
        sessionStatus: 'not-started',
      },
    ],
    users,
    org,
  });

  const devopsSession = cloudInfraRefinement.childSessions.find(
    (s) => s.assignedUnitId === departments.devopsDept.id
  );
  const devopsTeams = teams.filter((t) => t.parentId === departments.devopsDept.id);
  await createWorkItemsForSession({
    session: devopsSession,
    leafTeam: devopsTeams[0],
    workItemsConfig: [
      { title: 'Provision VPC and subnets', priority: 'P1', status: 'Done', completedAt: daysAgo(15) },
      { title: 'Setup EKS cluster', priority: 'P1', status: 'In Progress' },
      { title: 'Configure RDS instances', priority: 'P1', status: 'Ready' },
      { title: 'Setup CloudFront CDN', priority: 'P2', status: 'Backlog' },
      { title: 'Implement monitoring', priority: 'P2', status: 'Backlog' },
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
        targetDate: daysFromNow(45),
        sessionStatus: 'completed',
      },
      {
        title: 'Develop iOS App',
        assignedUnits: [departments.frontendDept],
        targetDate: daysFromNow(75),
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

  const mobileBackendSession = mobileProject.refinementSessions.find(
    (s) => s.assignedUnitId === departments.backendDept.id
  );
  const backendTeamsForMobile = teams.filter((t) => t.parentId === departments.backendDept.id);
  await createWorkItemsForSession({
    session: mobileBackendSession,
    leafTeam: backendTeamsForMobile[1],
    workItemsConfig: [
      { title: 'Design mobile API', priority: 'P1', status: 'Done', completedAt: daysAgo(20) },
      { title: 'Implement sync endpoints', priority: 'P1', status: 'Done', completedAt: daysAgo(15) },
      { title: 'Add push notification service', priority: 'P1', status: 'Done', completedAt: daysAgo(10) },
      { title: 'Setup CDN for assets', priority: 'P2', status: 'Done', completedAt: daysAgo(5) },
    ],
    users,
    org,
  });

  const iosSession = mobileProject.refinementSessions.find(
    (s) =>
      s.assignedUnitId === departments.frontendDept.id &&
      s.objectiveId === mobileProject.objectives.find((o) => o.title === 'Develop iOS App').id
  );
  const frontendTeams = teams.filter((t) => t.parentId === departments.frontendDept.id);
  await createWorkItemsForSession({
    session: iosSession,
    leafTeam: frontendTeams[1],
    workItemsConfig: [
      { title: 'Setup iOS project', priority: 'P1', status: 'Done', completedAt: daysAgo(18) },
      { title: 'Implement navigation', priority: 'P1', status: 'In Progress' },
      { title: 'Build auth screens', priority: 'P1', status: 'Ready' },
      { title: 'Implement offline sync', priority: 'P1', status: 'Backlog' },
      { title: 'Add push notifications', priority: 'P2', status: 'Backlog' },
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
        sessionStatus: 'in-progress',
      },
      {
        title: 'Build Recommendations API',
        targetDate: daysFromNow(35),
        sessionStatus: 'not-started',
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
        sessionStatus: 'in-progress',
      },
      {
        title: 'Build Data Pipeline',
        assignedUnits: [departments.dataEngDept],
        targetDate: daysFromNow(20),
        sessionStatus: 'in-progress',
      },
    ],
    users,
    org,
  });

  const mlDevSession = aiMlRefinement.childSessions.find(
    (s) => s.assignedUnitId === departments.dataSciDept.id
  );
  const dataSciTeams = teams.filter((t) => t.parentId === departments.dataSciDept.id);
  await createWorkItemsForSession({
    session: mlDevSession,
    leafTeam: dataSciTeams[0],
    workItemsConfig: [
      { title: 'Collect training data', priority: 'P1', status: 'Done', completedAt: daysAgo(25) },
      { title: 'Feature engineering', priority: 'P1', status: 'Done', completedAt: daysAgo(18) },
      { title: 'Train baseline model', priority: 'P1', status: 'In Progress' },
      { title: 'Hyperparameter tuning', priority: 'P2', status: 'Ready' },
      { title: 'Model evaluation', priority: 'P2', status: 'Backlog' },
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
        sessionStatus: 'in-progress',
      },
      {
        title: 'Define SOC Processes',
        targetDate: daysFromNow(60),
        sessionStatus: 'not-started',
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
      { title: 'Evaluate SIEM solutions', priority: 'P1', status: 'Done', completedAt: daysAgo(12) },
      { title: 'Deploy Splunk', priority: 'P1', status: 'In Progress' },
      { title: 'Configure log aggregation', priority: 'P1', status: 'Ready' },
      { title: 'Setup alerting rules', priority: 'P2', status: 'Backlog' },
      { title: 'Create dashboards', priority: 'P2', status: 'Backlog' },
    ],
    users,
    org,
  });

  // ============================================
  // Add more projects in Planning status
  // ============================================
  console.log('  Creating planning-stage projects...');

  await createProjectWithCascade({
    ownerUnit: company,
    ownerTierNum: 1,
    childUnits: [divisions.engDiv],
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
        targetDate: daysFromNow(45),
        sessionStatus: 'not-started',
      },
      {
        title: 'Build API Catalog',
        targetDate: daysFromNow(90),
        sessionStatus: 'not-started',
      },
    ],
    users,
    org,
  });

  await createProjectWithCascade({
    ownerUnit: divisions.productDiv,
    ownerTierNum: 2,
    childUnits: [departments.productMktgDept],
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
        targetDate: daysFromNow(50),
        sessionStatus: 'not-started',
      },
    ],
    users,
    org,
  });

  // ============================================
  // Add completed projects
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
        title: 'Data Warehouse Migration',
        description: 'Migrate from legacy to modern data warehouse',
        status: 'Completed',
        startDate: daysAgo(150),
        targetDate: daysAgo(40),
        budget: 300000,
        ownerUnit: company.id,
        ownerTier: 1,
        createdBy: users[0].id,
      },
    ],
  });

  console.log('✅ Created 10 projects with cascading objectives and refinement sessions');
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

  const dependencies = [];

  if (portalBackendApis && portalQa) {
    dependencies.push({
      predecessorId: portalBackendApis.id,
      successorId: portalQa.id,
      type: 'FS',
    });
  }

  if (cloudInfra && cloudMigrate) {
    dependencies.push({
      predecessorId: cloudInfra.id,
      successorId: cloudMigrate.id,
      type: 'FS',
    });
  }

  if (mlPipeline && mlModels) {
    dependencies.push({
      predecessorId: mlPipeline.id,
      successorId: mlModels.id,
      type: 'FS',
    });
  }

  if (dependencies.length > 0) {
    await prisma.objectiveDependency.createMany({ data: dependencies });
  }

  console.log(`✅ Created ${dependencies.length} objective dependencies`);
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

  // Create projects with cascading objectives
  await createProjects(org, users);

  // Create dependencies
  await createDependencies();

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
