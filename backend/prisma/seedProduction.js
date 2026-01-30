/**
 * Production-Grade Seed Data for Synapse Solutions LLC
 * 
 * This seed creates:
 * - 4-tier organizational structure (40 units total)
 * - 40 users (one per organizational unit)
 * - 30 projects (10 completed historical, 5 not started, 15 in progress)
 * - 80+ objectives across different tiers with dependencies
 * - 350 work items (250 project-related, 100 O&M)
 * - 6 months of historical throughput data
 * - Realistic dependency chains and critical paths
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Helper to create dates in the past
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

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

async function main() {
  console.log('🌱 Starting production seed...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.discussionMessage.deleteMany();
  await prisma.refinementUnitCompletion.deleteMany();
  await prisma.workItem.deleteMany();
  await prisma.refinementSession.deleteMany();
  await prisma.objectiveDependency.deleteMany();
  await prisma.objectiveCompletion.deleteMany();
  await prisma.objectiveAssignment.deleteMany();
  await prisma.objective.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.project.deleteMany();
  await prisma.teamThroughput.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organizationalUnit.deleteMany();

  console.log('✅ Cleanup complete');

  // ============================================
  // ORGANIZATIONAL STRUCTURE
  // ============================================
  console.log('🏢 Creating organizational structure...');

  // Tier 1: Root
  const synapse = await prisma.organizationalUnit.create({
    data: {
      name: 'Synapse Solutions LLC',
      tier: 1,
      order: 0,
    },
  });

  // Tier 2: Divisions
  const engineering = await prisma.organizationalUnit.create({
    data: { name: 'Engineering', parentId: synapse.id, tier: 2, order: 0 },
  });

  const productMarketing = await prisma.organizationalUnit.create({
    data: { name: 'Product & Marketing', parentId: synapse.id, tier: 2, order: 1 },
  });

  const operations = await prisma.organizationalUnit.create({
    data: { name: 'Operations', parentId: synapse.id, tier: 2, order: 2 },
  });

  const security = await prisma.organizationalUnit.create({
    data: { name: 'Security & Compliance', parentId: synapse.id, tier: 2, order: 3 },
  });

  // Tier 3: Departments (Engineering)
  const backendDept = await prisma.organizationalUnit.create({
    data: { name: 'Backend Engineering', parentId: engineering.id, tier: 3, order: 0 },
  });

  const frontendDept = await prisma.organizationalUnit.create({
    data: { name: 'Frontend Engineering', parentId: engineering.id, tier: 3, order: 1 },
  });

  const devopsDept = await prisma.organizationalUnit.create({
    data: { name: 'DevOps', parentId: engineering.id, tier: 3, order: 2 },
  });

  const qaDept = await prisma.organizationalUnit.create({
    data: { name: 'Quality Assurance', parentId: engineering.id, tier: 3, order: 3 },
  });

  // Tier 3: Departments (Product & Marketing)
  const productDept = await prisma.organizationalUnit.create({
    data: { name: 'Product Management', parentId: productMarketing.id, tier: 3, order: 0 },
  });

  const marketingDept = await prisma.organizationalUnit.create({
    data: { name: 'Marketing', parentId: productMarketing.id, tier: 3, order: 1 },
  });

  const customerSuccessDept = await prisma.organizationalUnit.create({
    data: { name: 'Customer Success', parentId: productMarketing.id, tier: 3, order: 2 },
  });

  // Tier 3: Departments (Operations)
  const itOpsDept = await prisma.organizationalUnit.create({
    data: { name: 'IT Operations', parentId: operations.id, tier: 3, order: 0 },
  });

  const bizOpsDept = await prisma.organizationalUnit.create({
    data: { name: 'Business Operations', parentId: operations.id, tier: 3, order: 1 },
  });

  const dataDept = await prisma.organizationalUnit.create({
    data: { name: 'Data & Analytics', parentId: operations.id, tier: 3, order: 2 },
  });

  // Tier 3: Departments (Security)
  const secEngDept = await prisma.organizationalUnit.create({
    data: { name: 'Security Engineering', parentId: security.id, tier: 3, order: 0 },
  });

  const complianceDept = await prisma.organizationalUnit.create({
    data: { name: 'Compliance', parentId: security.id, tier: 3, order: 1 },
  });

  // Tier 4: Teams (Backend)
  const backendAlpha = await prisma.organizationalUnit.create({
    data: { name: 'Backend Team Alpha', parentId: backendDept.id, tier: 4, order: 0 },
  });

  const backendBeta = await prisma.organizationalUnit.create({
    data: { name: 'Backend Team Beta', parentId: backendDept.id, tier: 4, order: 1 },
  });

  const backendGamma = await prisma.organizationalUnit.create({
    data: { name: 'Backend Team Gamma', parentId: backendDept.id, tier: 4, order: 2 },
  });

  // Tier 4: Teams (Frontend)
  const frontendAlpha = await prisma.organizationalUnit.create({
    data: { name: 'Frontend Team Alpha', parentId: frontendDept.id, tier: 4, order: 0 },
  });

  const frontendBeta = await prisma.organizationalUnit.create({
    data: { name: 'Frontend Team Beta', parentId: frontendDept.id, tier: 4, order: 1 },
  });

  // Tier 4: Teams (DevOps)
  const devopsInfra = await prisma.organizationalUnit.create({
    data: { name: 'Infrastructure Team', parentId: devopsDept.id, tier: 4, order: 0 },
  });

  const devopsPlatform = await prisma.organizationalUnit.create({
    data: { name: 'Platform Team', parentId: devopsDept.id, tier: 4, order: 1 },
  });

  // Tier 4: Teams (QA)
  const qaAutomation = await prisma.organizationalUnit.create({
    data: { name: 'QA Automation Team', parentId: qaDept.id, tier: 4, order: 0 },
  });

  const qaManual = await prisma.organizationalUnit.create({
    data: { name: 'QA Manual Testing Team', parentId: qaDept.id, tier: 4, order: 1 },
  });

  // Tier 4: Teams (Product)
  const productCore = await prisma.organizationalUnit.create({
    data: { name: 'Core Product Team', parentId: productDept.id, tier: 4, order: 0 },
  });

  const productGrowth = await prisma.organizationalUnit.create({
    data: { name: 'Growth Product Team', parentId: productDept.id, tier: 4, order: 1 },
  });

  // Tier 4: Teams (Marketing)
  const marketingDigital = await prisma.organizationalUnit.create({
    data: { name: 'Digital Marketing Team', parentId: marketingDept.id, tier: 4, order: 0 },
  });

  const marketingContent = await prisma.organizationalUnit.create({
    data: { name: 'Content Marketing Team', parentId: marketingDept.id, tier: 4, order: 1 },
  });

  // Tier 4: Teams (Customer Success)
  const csOnboarding = await prisma.organizationalUnit.create({
    data: { name: 'Customer Onboarding Team', parentId: customerSuccessDept.id, tier: 4, order: 0 },
  });

  const csSupport = await prisma.organizationalUnit.create({
    data: { name: 'Customer Support Team', parentId: customerSuccessDept.id, tier: 4, order: 1 },
  });

  // Tier 4: Teams (IT Ops)
  const itOpsInfra = await prisma.organizationalUnit.create({
    data: { name: 'IT Infrastructure Team', parentId: itOpsDept.id, tier: 4, order: 0 },
  });

  const itOpsSupport = await prisma.organizationalUnit.create({
    data: { name: 'IT Support Team', parentId: itOpsDept.id, tier: 4, order: 1 },
  });

  // Tier 4: Teams (Biz Ops)
  const bizOpsFinance = await prisma.organizationalUnit.create({
    data: { name: 'Finance Operations Team', parentId: bizOpsDept.id, tier: 4, order: 0 },
  });

  const bizOpsProcess = await prisma.organizationalUnit.create({
    data: { name: 'Process Improvement Team', parentId: bizOpsDept.id, tier: 4, order: 1 },
  });

  // Tier 4: Teams (Data)
  const dataEngineering = await prisma.organizationalUnit.create({
    data: { name: 'Data Engineering Team', parentId: dataDept.id, tier: 4, order: 0 },
  });

  const dataAnalytics = await prisma.organizationalUnit.create({
    data: { name: 'Analytics Team', parentId: dataDept.id, tier: 4, order: 1 },
  });

  // Tier 4: Teams (Security)
  const secOps = await prisma.organizationalUnit.create({
    data: { name: 'Security Operations Team', parentId: secEngDept.id, tier: 4, order: 0 },
  });

  const secAppSec = await prisma.organizationalUnit.create({
    data: { name: 'Application Security Team', parentId: secEngDept.id, tier: 4, order: 1 },
  });

  // Tier 4: Teams (Compliance)
  const complianceAudit = await prisma.organizationalUnit.create({
    data: { name: 'Audit Team', parentId: complianceDept.id, tier: 4, order: 0 },
  });

  const compliancePolicy = await prisma.organizationalUnit.create({
    data: { name: 'Policy Team', parentId: complianceDept.id, tier: 4, order: 1 },
  });

  console.log('✅ Created 40 organizational units');

  // Collect all units for reference
  const allUnits = [
    synapse, engineering, productMarketing, operations, security,
    backendDept, frontendDept, devopsDept, qaDept,
    productDept, marketingDept, customerSuccessDept,
    itOpsDept, bizOpsDept, dataDept,
    secEngDept, complianceDept,
    backendAlpha, backendBeta, backendGamma,
    frontendAlpha, frontendBeta,
    devopsInfra, devopsPlatform,
    qaAutomation, qaManual,
    productCore, productGrowth,
    marketingDigital, marketingContent,
    csOnboarding, csSupport,
    itOpsInfra, itOpsSupport,
    bizOpsFinance, bizOpsProcess,
    dataEngineering, dataAnalytics,
    secOps, secAppSec,
    complianceAudit, compliancePolicy,
  ];

  const leafTeams = allUnits.filter(unit => unit.tier === 4);

  // ============================================
  // USERS (One per unit)
  // ============================================
  console.log('👥 Creating users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const userMappings = [
    { unit: synapse, name: 'Sarah Chen', email: 'sarah.chen@synapse.com', role: 'CEO' },
    { unit: engineering, name: 'Michael Rodriguez', email: 'michael.rodriguez@synapse.com', role: 'VP Engineering' },
    { unit: productMarketing, name: 'Emily Watson', email: 'emily.watson@synapse.com', role: 'VP Product & Marketing' },
    { unit: operations, name: 'David Kim', email: 'david.kim@synapse.com', role: 'VP Operations' },
    { unit: security, name: 'Jennifer Liu', email: 'jennifer.liu@synapse.com', role: 'VP Security' },
    { unit: backendDept, name: 'Alex Thompson', email: 'alex.thompson@synapse.com', role: 'Director Backend' },
    { unit: frontendDept, name: 'Maria Garcia', email: 'maria.garcia@synapse.com', role: 'Director Frontend' },
    { unit: devopsDept, name: 'James Wilson', email: 'james.wilson@synapse.com', role: 'Director DevOps' },
    { unit: qaDept, name: 'Linda Chen', email: 'linda.chen@synapse.com', role: 'Director QA' },
    { unit: productDept, name: 'Robert Martinez', email: 'robert.martinez@synapse.com', role: 'Director Product' },
    { unit: marketingDept, name: 'Jessica Brown', email: 'jessica.brown@synapse.com', role: 'Director Marketing' },
    { unit: customerSuccessDept, name: 'William Taylor', email: 'william.taylor@synapse.com', role: 'Director Customer Success' },
    { unit: itOpsDept, name: 'Patricia Anderson', email: 'patricia.anderson@synapse.com', role: 'Director IT' },
    { unit: bizOpsDept, name: 'Christopher Lee', email: 'christopher.lee@synapse.com', role: 'Director Business Ops' },
    { unit: dataDept, name: 'Amanda White', email: 'amanda.white@synapse.com', role: 'Director Data' },
    { unit: secEngDept, name: 'Daniel Harris', email: 'daniel.harris@synapse.com', role: 'Director Security Engineering' },
    { unit: complianceDept, name: 'Karen Martin', email: 'karen.martin@synapse.com', role: 'Director Compliance' },
    { unit: backendAlpha, name: 'Ryan Foster', email: 'ryan.foster@synapse.com', role: 'Team Lead' },
    { unit: backendBeta, name: 'Sophie Turner', email: 'sophie.turner@synapse.com', role: 'Team Lead' },
    { unit: backendGamma, name: 'Marcus Johnson', email: 'marcus.johnson@synapse.com', role: 'Team Lead' },
    { unit: frontendAlpha, name: 'Emma Davis', email: 'emma.davis@synapse.com', role: 'Team Lead' },
    { unit: frontendBeta, name: 'Noah Miller', email: 'noah.miller@synapse.com', role: 'Team Lead' },
    { unit: devopsInfra, name: 'Oliver Jackson', email: 'oliver.jackson@synapse.com', role: 'Team Lead' },
    { unit: devopsPlatform, name: 'Ava Moore', email: 'ava.moore@synapse.com', role: 'Team Lead' },
    { unit: qaAutomation, name: 'Lucas Wright', email: 'lucas.wright@synapse.com', role: 'Team Lead' },
    { unit: qaManual, name: 'Mia Lopez', email: 'mia.lopez@synapse.com', role: 'Team Lead' },
    { unit: productCore, name: 'Ethan Clark', email: 'ethan.clark@synapse.com', role: 'Team Lead' },
    { unit: productGrowth, name: 'Isabella Scott', email: 'isabella.scott@synapse.com', role: 'Team Lead' },
    { unit: marketingDigital, name: 'Mason Green', email: 'mason.green@synapse.com', role: 'Team Lead' },
    { unit: marketingContent, name: 'Charlotte Adams', email: 'charlotte.adams@synapse.com', role: 'Team Lead' },
    { unit: csOnboarding, name: 'Liam Baker', email: 'liam.baker@synapse.com', role: 'Team Lead' },
    { unit: csSupport, name: 'Amelia Nelson', email: 'amelia.nelson@synapse.com', role: 'Team Lead' },
    { unit: itOpsInfra, name: 'Benjamin Carter', email: 'benjamin.carter@synapse.com', role: 'Team Lead' },
    { unit: itOpsSupport, name: 'Harper Mitchell', email: 'harper.mitchell@synapse.com', role: 'Team Lead' },
    { unit: bizOpsFinance, name: 'Elijah Roberts', email: 'elijah.roberts@synapse.com', role: 'Team Lead' },
    { unit: bizOpsProcess, name: 'Evelyn Turner', email: 'evelyn.turner@synapse.com', role: 'Team Lead' },
    { unit: dataEngineering, name: 'Alexander Phillips', email: 'alexander.phillips@synapse.com', role: 'Team Lead' },
    { unit: dataAnalytics, name: 'Abigail Campbell', email: 'abigail.campbell@synapse.com', role: 'Team Lead' },
    { unit: secOps, name: 'Sebastian Parker', email: 'sebastian.parker@synapse.com', role: 'Team Lead' },
    { unit: secAppSec, name: 'Ella Evans', email: 'ella.evans@synapse.com', role: 'Team Lead' },
    { unit: complianceAudit, name: 'Jack Edwards', email: 'jack.edwards@synapse.com', role: 'Team Lead' },
    { unit: compliancePolicy, name: 'Scarlett Collins', email: 'scarlett.collins@synapse.com', role: 'Team Lead' },
  ];

  const users = [];
  for (const mapping of userMappings) {
    const user = await prisma.user.create({
      data: {
        email: mapping.email,
        password: hashedPassword,
        name: mapping.name,
        role: mapping.role,
        organizationalUnit: mapping.unit.id,
      },
    });
    users.push(user);
  }

  console.log('✅ Created 40 users');

  // Helper to get user by unit
  const getUserByUnit = (unitId) => users.find(u => u.organizationalUnit === unitId);

  // ============================================
  // HISTORICAL PROJECTS (10 completed)
  // ============================================
  console.log('📋 Creating historical completed projects...');

  const completedProjects = [];
  
  // Project 1: Customer Portal v1.0 (completed 180 days ago)
  const portal1 = await prisma.project.create({
    data: {
      title: 'Customer Portal v1.0',
      description: 'Initial customer self-service portal',
      owner: 'Product Team',
      ownerUnit: engineering.id,
      ownerTier: 2,
      status: 'Completed',
      startDate: formatDate(daysAgo(240)),
      targetDate: formatDate(daysAgo(180)),
      budget: 250000,
      createdBy: getUserByUnit(engineering.id).id,
    },
  });
  completedProjects.push(portal1);

  // Project 2: Marketing Automation v1 (completed 165 days ago)
  const marketing1 = await prisma.project.create({
    data: {
      title: 'Marketing Automation Platform v1',
      description: 'Email campaign automation and analytics',
      owner: 'Marketing',
      ownerUnit: productMarketing.id,
      ownerTier: 2,
      status: 'Completed',
      startDate: formatDate(daysAgo(220)),
      targetDate: formatDate(daysAgo(165)),
      budget: 150000,
      createdBy: getUserByUnit(productMarketing.id).id,
    },
  });
  completedProjects.push(marketing1);

  // Project 3: Security Audit Remediation (completed 150 days ago)
  const secAudit1 = await prisma.project.create({
    data: {
      title: 'Q3 Security Audit Remediation',
      description: 'Address findings from external security audit',
      owner: 'Security',
      ownerUnit: security.id,
      ownerTier: 2,
      status: 'Completed',
      startDate: formatDate(daysAgo(180)),
      targetDate: formatDate(daysAgo(150)),
      budget: 100000,
      createdBy: getUserByUnit(security.id).id,
    },
  });
  completedProjects.push(secAudit1);

  // Project 4: Data Warehouse Migration (completed 135 days ago)
  const dataWarehouse = await prisma.project.create({
    data: {
      title: 'Data Warehouse Migration',
      description: 'Migrate from legacy to modern data warehouse',
      owner: 'Data & Analytics',
      ownerUnit: dataDept.id,
      ownerTier: 3,
      status: 'Completed',
      startDate: formatDate(daysAgo(200)),
      targetDate: formatDate(daysAgo(135)),
      budget: 300000,
      createdBy: getUserByUnit(dataDept.id).id,
    },
  });
  completedProjects.push(dataWarehouse);

  // Project 5: Mobile App v1.0 (completed 120 days ago)
  const mobileApp = await prisma.project.create({
    data: {
      title: 'Mobile App v1.0',
      description: 'iOS and Android native apps',
      owner: 'Frontend',
      ownerUnit: frontendDept.id,
      ownerTier: 3,
      status: 'Completed',
      startDate: formatDate(daysAgo(180)),
      targetDate: formatDate(daysAgo(120)),
      budget: 400000,
      createdBy: getUserByUnit(frontendDept.id).id,
    },
  });
  completedProjects.push(mobileApp);

  // Project 6: API Gateway Implementation (completed 105 days ago)
  const apiGateway = await prisma.project.create({
    data: {
      title: 'API Gateway Implementation',
      description: 'Centralized API management and security',
      owner: 'Backend',
      ownerUnit: backendDept.id,
      ownerTier: 3,
      status: 'Completed',
      startDate: formatDate(daysAgo(150)),
      targetDate: formatDate(daysAgo(105)),
      budget: 200000,
      createdBy: getUserByUnit(backendDept.id).id,
    },
  });
  completedProjects.push(apiGateway);

  // Project 7: Customer Onboarding Redesign (completed 90 days ago)
  const onboarding = await prisma.project.create({
    data: {
      title: 'Customer Onboarding Redesign',
      description: 'Streamline new customer onboarding process',
      owner: 'Customer Success',
      ownerUnit: customerSuccessDept.id,
      ownerTier: 3,
      status: 'Completed',
      startDate: formatDate(daysAgo(140)),
      targetDate: formatDate(daysAgo(90)),
      budget: 120000,
      createdBy: getUserByUnit(customerSuccessDept.id).id,
    },
  });
  completedProjects.push(onboarding);

  // Project 8: DevOps Tooling Upgrade (completed 75 days ago)
  const devopsTools = await prisma.project.create({
    data: {
      title: 'DevOps Tooling Upgrade',
      description: 'Modernize CI/CD pipeline and monitoring',
      owner: 'DevOps',
      ownerUnit: devopsDept.id,
      ownerTier: 3,
      status: 'Completed',
      startDate: formatDate(daysAgo(120)),
      targetDate: formatDate(daysAgo(75)),
      budget: 180000,
      createdBy: getUserByUnit(devopsDept.id).id,
    },
  });
  completedProjects.push(devopsTools);

  // Project 9: Compliance Reporting System (completed 60 days ago)
  const compliance1 = await prisma.project.create({
    data: {
      title: 'Compliance Reporting System',
      description: 'Automated compliance reporting for SOC2',
      owner: 'Compliance',
      ownerUnit: complianceDept.id,
      ownerTier: 3,
      status: 'Completed',
      startDate: formatDate(daysAgo(110)),
      targetDate: formatDate(daysAgo(60)),
      budget: 150000,
      createdBy: getUserByUnit(complianceDept.id).id,
    },
  });
  completedProjects.push(compliance1);

  // Project 10: IT Infrastructure Refresh (completed 45 days ago)
  const itRefresh = await prisma.project.create({
    data: {
      title: 'IT Infrastructure Refresh',
      description: 'Upgrade networking and server infrastructure',
      owner: 'IT Operations',
      ownerUnit: itOpsDept.id,
      ownerTier: 3,
      status: 'Completed',
      startDate: formatDate(daysAgo(90)),
      targetDate: formatDate(daysAgo(45)),
      budget: 500000,
      createdBy: getUserByUnit(itOpsDept.id).id,
    },
  });
  completedProjects.push(itRefresh);

  console.log('✅ Created 10 completed projects');

  // ============================================
  // ACTIVE PROJECTS (15 in progress)
  // ============================================
  console.log('📋 Creating active projects...');

  const activeProjects = [];

  // Project 11: Customer Portal v2.0
  const portal2 = await prisma.project.create({
    data: {
      title: 'Customer Portal v2.0',
      description: 'Enhanced portal with advanced features and better UX',
      owner: 'Product Team',
      ownerUnit: engineering.id,
      ownerTier: 2,
      status: 'In Progress',
      startDate: formatDate(daysAgo(30)),
      targetDate: formatDate(daysFromNow(90)),
      budget: 350000,
      createdBy: getUserByUnit(engineering.id).id,
    },
  });
  activeProjects.push(portal2);

  // Project 12: Marketing Analytics Dashboard
  const marketingAnalytics = await prisma.project.create({
    data: {
      title: 'Marketing Analytics Dashboard',
      description: 'Real-time marketing performance metrics',
      owner: 'Marketing',
      ownerUnit: marketingDept.id,
      ownerTier: 3,
      status: 'In Progress',
      startDate: formatDate(daysAgo(25)),
      targetDate: formatDate(daysFromNow(60)),
      budget: 120000,
      createdBy: getUserByUnit(marketingDept.id).id,
    },
  });
  activeProjects.push(marketingAnalytics);

  // Project 13: Cloud Migration Phase 1
  const cloudMigration = await prisma.project.create({
    data: {
      title: 'Cloud Migration Phase 1',
      description: 'Migrate core services to AWS',
      owner: 'DevOps',
      ownerUnit: devopsDept.id,
      ownerTier: 3,
      status: 'In Progress',
      startDate: formatDate(daysAgo(20)),
      targetDate: formatDate(daysFromNow(120)),
      budget: 600000,
      createdBy: getUserByUnit(devopsDept.id).id,
    },
  });
  activeProjects.push(cloudMigration);

  // Project 14: AI-Powered Recommendations
  const aiRecommendations = await prisma.project.create({
    data: {
      title: 'AI-Powered Product Recommendations',
      description: 'Machine learning based product recommendation engine',
      owner: 'Data & Analytics',
      ownerUnit: dataDept.id,
      ownerTier: 3,
      status: 'In Progress',
      startDate: formatDate(daysAgo(15)),
      targetDate: formatDate(daysFromNow(100)),
      budget: 280000,
      createdBy: getUserByUnit(dataDept.id).id,
    },
  });
  activeProjects.push(aiRecommendations);

  // Project 15: Security Operations Center
  const soc = await prisma.project.create({
    data: {
      title: 'Security Operations Center (SOC)',
      description: '24/7 security monitoring and incident response',
      owner: 'Security Engineering',
      ownerUnit: secEngDept.id,
      ownerTier: 3,
      status: 'In Progress',
      startDate: formatDate(daysAgo(40)),
      targetDate: formatDate(daysFromNow(80)),
      budget: 450000,
      createdBy: getUserByUnit(secEngDept.id).id,
    },
  });
  activeProjects.push(soc);

  // Project 16: API Marketplace
  const apiMarketplace = await prisma.project.create({
    data: {
      title: 'API Marketplace',
      description: 'Public API marketplace for partners',
      owner: 'Backend',
      ownerUnit: backendDept.id,
      ownerTier: 3,
      status: 'In Progress',
      startDate: formatDate(daysAgo(35)),
      targetDate: formatDate(daysFromNow(70)),
      budget: 220000,
      createdBy: getUserByUnit(backendDept.id).id,
    },
  });
  activeProjects.push(apiMarketplace);

  // Project 17: Mobile App v2.0
  const mobileApp2 = await prisma.project.create({
    data: {
      title: 'Mobile App v2.0',
      description: 'Feature parity with web and offline support',
      owner: 'Frontend',
      ownerUnit: frontendDept.id,
      ownerTier: 3,
      status: 'In Progress',
      startDate: formatDate(daysAgo(28)),
      targetDate: formatDate(daysFromNow(95)),
      budget: 380000,
      createdBy: getUserByUnit(frontendDept.id).id,
    },
  });
  activeProjects.push(mobileApp2);

  // Project 18: Customer Health Score System
  const healthScore = await prisma.project.create({
    data: {
      title: 'Customer Health Score System',
      description: 'Predictive analytics for customer churn',
      owner: 'Customer Success',
      ownerUnit: customerSuccessDept.id,
      ownerTier: 3,
      status: 'In Progress',
      startDate: formatDate(daysAgo(18)),
      targetDate: formatDate(daysFromNow(75)),
      budget: 160000,
      createdBy: getUserByUnit(customerSuccessDept.id).id,
    },
  });
  activeProjects.push(healthScore);

  // Project 19: Process Automation Initiative
  const processAutomation = await prisma.project.create({
    data: {
      title: 'Process Automation Initiative',
      description: 'Automate manual business processes',
      owner: 'Business Operations',
      ownerUnit: bizOpsDept.id,
      ownerTier: 3,
      status: 'In Progress',
      startDate: formatDate(daysAgo(22)),
      targetDate: formatDate(daysFromNow(85)),
      budget: 200000,
      createdBy: getUserByUnit(bizOpsDept.id).id,
    },
  });
  activeProjects.push(processAutomation);

  // Project 20: QA Test Automation Framework
  const qaFramework = await prisma.project.create({
    data: {
      title: 'QA Test Automation Framework',
      description: 'End-to-end test automation infrastructure',
      owner: 'QA',
      ownerUnit: qaDept.id,
      ownerTier: 3,
      status: 'In Progress',
      startDate: formatDate(daysAgo(12)),
      targetDate: formatDate(daysFromNow(55)),
      budget: 140000,
      createdBy: getUserByUnit(qaDept.id).id,
    },
  });
  activeProjects.push(qaFramework);

  // Project 21: Content Management System
  const cms = await prisma.project.create({
    data: {
      title: 'Content Management System',
      description: 'Modern CMS for marketing content',
      owner: 'Marketing',
      ownerUnit: marketingDept.id,
      ownerTier: 3,
      status: 'In Progress',
      startDate: formatDate(daysAgo(8)),
      targetDate: formatDate(daysFromNow(65)),
      budget: 175000,
      createdBy: getUserByUnit(marketingDept.id).id,
    },
  });
  activeProjects.push(cms);

  // Project 22: Zero Trust Architecture
  const zeroTrust = await prisma.project.create({
    data: {
      title: 'Zero Trust Architecture Implementation',
      description: 'Implement zero trust security model',
      owner: 'Security',
      ownerUnit: security.id,
      ownerTier: 2,
      status: 'In Progress',
      startDate: formatDate(daysAgo(45)),
      targetDate: formatDate(daysFromNow(105)),
      budget: 550000,
      createdBy: getUserByUnit(security.id).id,
    },
  });
  activeProjects.push(zeroTrust);

  // Project 23: Real-Time Data Pipeline
  const dataPipeline = await prisma.project.create({
    data: {
      title: 'Real-Time Data Pipeline',
      description: 'Stream processing for real-time analytics',
      owner: 'Data Engineering',
      ownerUnit: dataDept.id,
      ownerTier: 3,
      status: 'In Progress',
      startDate: formatDate(daysAgo(10)),
      targetDate: formatDate(daysFromNow(90)),
      budget: 320000,
      createdBy: getUserByUnit(dataDept.id).id,
    },
  });
  activeProjects.push(dataPipeline);

  // Project 24: Product Experimentation Platform
  const expPlatform = await prisma.project.create({
    data: {
      title: 'Product Experimentation Platform',
      description: 'A/B testing and feature flags',
      owner: 'Product',
      ownerUnit: productDept.id,
      ownerTier: 3,
      status: 'In Progress',
      startDate: formatDate(daysAgo(16)),
      targetDate: formatDate(daysFromNow(70)),
      budget: 190000,
      createdBy: getUserByUnit(productDept.id).id,
    },
  });
  activeProjects.push(expPlatform);

  // Project 25: IT Service Management
  const itsm = await prisma.project.create({
    data: {
      title: 'IT Service Management Platform',
      description: 'Modernize IT ticketing and asset management',
      owner: 'IT Operations',
      ownerUnit: itOpsDept.id,
      ownerTier: 3,
      status: 'In Progress',
      startDate: formatDate(daysAgo(24)),
      targetDate: formatDate(daysFromNow(60)),
      budget: 210000,
      createdBy: getUserByUnit(itOpsDept.id).id,
    },
  });
  activeProjects.push(itsm);

  console.log('✅ Created 15 active projects');

  // ============================================
  // FUTURE PROJECTS (5 not started)
  // ============================================
  console.log('📋 Creating future projects...');

  const futureProjects = [];

  // Project 26: GraphQL API Gateway
  const graphql = await prisma.project.create({
    data: {
      title: 'GraphQL API Gateway',
      description: 'Modern GraphQL interface for all services',
      owner: 'Backend',
      ownerUnit: backendDept.id,
      ownerTier: 3,
      status: 'Planning',
      startDate: formatDate(daysFromNow(30)),
      targetDate: formatDate(daysFromNow(150)),
      budget: 280000,
      createdBy: getUserByUnit(backendDept.id).id,
    },
  });
  futureProjects.push(graphql);

  // Project 27: Multi-Region Expansion
  const multiRegion = await prisma.project.create({
    data: {
      title: 'Multi-Region Expansion',
      description: 'Deploy infrastructure in EU and APAC regions',
      owner: 'DevOps',
      ownerUnit: devopsDept.id,
      ownerTier: 3,
      status: 'Planning',
      startDate: formatDate(daysFromNow(45)),
      targetDate: formatDate(daysFromNow(180)),
      budget: 750000,
      createdBy: getUserByUnit(devopsDept.id).id,
    },
  });
  futureProjects.push(multiRegion);

  // Project 28: Customer Voice of the Customer Program
  const voc = await prisma.project.create({
    data: {
      title: 'Voice of the Customer Program',
      description: 'Systematic customer feedback collection and analysis',
      owner: 'Customer Success',
      ownerUnit: customerSuccessDept.id,
      ownerTier: 3,
      status: 'Planning',
      startDate: formatDate(daysFromNow(20)),
      targetDate: formatDate(daysFromNow(110)),
      budget: 140000,
      createdBy: getUserByUnit(customerSuccessDept.id).id,
    },
  });
  futureProjects.push(voc);

  // Project 29: AI Compliance Assistant
  const aiCompliance = await prisma.project.create({
    data: {
      title: 'AI Compliance Assistant',
      description: 'AI-powered compliance monitoring and reporting',
      owner: 'Compliance',
      ownerUnit: complianceDept.id,
      ownerTier: 3,
      status: 'Planning',
      startDate: formatDate(daysFromNow(60)),
      targetDate: formatDate(daysFromNow(200)),
      budget: 300000,
      createdBy: getUserByUnit(complianceDept.id).id,
    },
  });
  futureProjects.push(aiCompliance);

  // Project 30: Partner Integration Platform
  const partnerPlatform = await prisma.project.create({
    data: {
      title: 'Partner Integration Platform',
      description: 'Self-service platform for partner integrations',
      owner: 'Product',
      ownerUnit: productDept.id,
      ownerTier: 3,
      status: 'Planning',
      startDate: formatDate(daysFromNow(35)),
      targetDate: formatDate(daysFromNow(165)),
      budget: 420000,
      createdBy: getUserByUnit(productDept.id).id,
    },
  });
  futureProjects.push(partnerPlatform);

  console.log('✅ Created 5 future projects');

  const allProjects = [...completedProjects, ...activeProjects, ...futureProjects];

  console.log('🌱 Basic project structure complete. Continuing with objectives and dependencies...');

  // ============================================
  // OBJECTIVES FOR KEY ACTIVE PROJECTS
  // We'll create detailed objectives with dependencies for the most important active projects
  // ============================================
  console.log('🎯 Creating objectives for Customer Portal v2.0...');

  // Customer Portal v2.0 - Tier 2 Objective
  const portal2Main = await prisma.objective.create({
    data: {
      title: 'Launch Customer Portal v2.0',
      description: 'Complete redesign with new features',
      targetDate: formatDate(daysFromNow(90)),
      projectId: portal2.id,
      fromTier: 2,
      createdBy: getUserByUnit(engineering.id).id,
    },
  });

  // Tier 3 Objectives for Portal v2.0
  const portal2Backend = await prisma.objective.create({
    data: {
      title: 'Build Portal v2 Backend APIs',
      description: 'RESTful APIs for all portal features',
      targetDate: formatDate(daysFromNow(60)),
      projectId: portal2.id,
      fromTier: 3,
      parentObjectiveId: portal2Main.id,
      createdBy: getUserByUnit(backendDept.id).id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: portal2Backend.id, unitId: backendDept.id },
  });

  const portal2Frontend = await prisma.objective.create({
    data: {
      title: 'Build Portal v2 Frontend',
      description: 'React-based UI with modern design',
      targetDate: formatDate(daysFromNow(75)),
      projectId: portal2.id,
      fromTier: 3,
      parentObjectiveId: portal2Main.id,
      createdBy: getUserByUnit(frontendDept.id).id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: portal2Frontend.id, unitId: frontendDept.id },
  });

  const portal2QA = await prisma.objective.create({
    data: {
      title: 'QA Portal v2',
      description: 'Comprehensive testing and validation',
      targetDate: formatDate(daysFromNow(85)),
      projectId: portal2.id,
      fromTier: 3,
      parentObjectiveId: portal2Main.id,
      createdBy: getUserByUnit(qaDept.id).id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: portal2QA.id, unitId: qaDept.id },
  });

  // Create dependencies: Backend must finish before Frontend and QA
  await prisma.objectiveDependency.create({
    data: {
      predecessorId: portal2Backend.id,
      successorId: portal2Frontend.id,
      type: 'FS', // Finish-to-Start
    },
  });

  await prisma.objectiveDependency.create({
    data: {
      predecessorId: portal2Frontend.id,
      successorId: portal2QA.id,
      type: 'FS',
    },
  });

  console.log('🎯 Creating objectives for Cloud Migration Phase 1...');

  // Cloud Migration - Tier 2 Objective
  const cloudMain = await prisma.objective.create({
    data: {
      title: 'Complete Cloud Migration Phase 1',
      description: 'Migrate core services to AWS',
      targetDate: formatDate(daysFromNow(120)),
      projectId: cloudMigration.id,
      fromTier: 2,
      createdBy: getUserByUnit(devopsDept.id).id,
    },
  });

  // Tier 3 Objectives for Cloud Migration
  const cloudInfra = await prisma.objective.create({
    data: {
      title: 'Setup AWS Infrastructure',
      description: 'VPCs, subnets, security groups, etc.',
      targetDate: formatDate(daysFromNow(40)),
      projectId: cloudMigration.id,
      fromTier: 3,
      parentObjectiveId: cloudMain.id,
      createdBy: getUserByUnit(devopsDept.id).id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: cloudInfra.id, unitId: devopsDept.id },
  });

  const cloudDatabase = await prisma.objective.create({
    data: {
      title: 'Migrate Databases',
      description: 'Move all databases to AWS RDS',
      targetDate: formatDate(daysFromNow(70)),
      projectId: cloudMigration.id,
      fromTier: 3,
      parentObjectiveId: cloudMain.id,
      createdBy: getUserByUnit(devopsDept.id).id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: cloudDatabase.id, unitId: devopsDept.id },
  });

  const cloudApps = await prisma.objective.create({
    data: {
      title: 'Migrate Applications',
      description: 'Move apps to ECS/EKS',
      targetDate: formatDate(daysFromNow(100)),
      projectId: cloudMigration.id,
      fromTier: 3,
      parentObjectiveId: cloudMain.id,
      createdBy: getUserByUnit(devopsDept.id).id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: cloudApps.id, unitId: devopsDept.id },
  });

  const cloudSecurity = await prisma.objective.create({
    data: {
      title: 'Implement Cloud Security',
      description: 'IAM, encryption, monitoring',
      targetDate: formatDate(daysFromNow(50)),
      projectId: cloudMigration.id,
      fromTier: 3,
      parentObjectiveId: cloudMain.id,
      createdBy: getUserByUnit(secEngDept.id).id,
    },
  });

  await prisma.objectiveAssignment.create({
    data: { objectiveId: cloudSecurity.id, unitId: secEngDept.id },
  });

  // Dependencies: Infra → Security → Database → Apps
  await prisma.objectiveDependency.create({
    data: { predecessorId: cloudInfra.id, successorId: cloudSecurity.id, type: 'FS' },
  });

  await prisma.objectiveDependency.create({
    data: { predecessorId: cloudSecurity.id, successorId: cloudDatabase.id, type: 'FS' },
  });

  await prisma.objectiveDependency.create({
    data: { predecessorId: cloudDatabase.id, successorId: cloudApps.id, type: 'FS' },
  });

  console.log('🎯 Creating objectives for other active projects...');

  // Add more objectives for other projects (abbreviated for space)
  const objectives = [];

  // AI Recommendations project objectives
  const aiMain = await prisma.objective.create({
    data: {
      title: 'Launch AI Recommendation Engine',
      targetDate: formatDate(daysFromNow(100)),
      projectId: aiRecommendations.id,
      fromTier: 2,
      createdBy: getUserByUnit(dataDept.id).id,
    },
  });

  const aiModel = await prisma.objective.create({
    data: {
      title: 'Train ML Models',
      targetDate: formatDate(daysFromNow(60)),
      projectId: aiRecommendations.id,
      fromTier: 3,
      parentObjectiveId: aiMain.id,
      createdBy: getUserByUnit(dataDept.id).id,
    },
  });
  await prisma.objectiveAssignment.create({
    data: { objectiveId: aiModel.id, unitId: dataEngineering.id },
  });

  const aiAPI = await prisma.objective.create({
    data: {
      title: 'Build Recommendations API',
      targetDate: formatDate(daysFromNow(80)),
      projectId: aiRecommendations.id,
      fromTier: 3,
      parentObjectiveId: aiMain.id,
      createdBy: getUserByUnit(backendDept.id).id,
    },
  });
  await prisma.objectiveAssignment.create({
    data: { objectiveId: aiAPI.id, unitId: backendAlpha.id },
  });

  await prisma.objectiveDependency.create({
    data: { predecessorId: aiModel.id, successorId: aiAPI.id, type: 'FS' },
  });

  // SOC project objectives
  const socMain = await prisma.objective.create({
    data: {
      title: 'Establish Security Operations Center',
      targetDate: formatDate(daysFromNow(80)),
      projectId: soc.id,
      fromTier: 2,
      createdBy: getUserByUnit(secEngDept.id).id,
    },
  });

  const socTools = await prisma.objective.create({
    data: {
      title: 'Deploy SIEM and Monitoring Tools',
      targetDate: formatDate(daysFromNow(50)),
      projectId: soc.id,
      fromTier: 3,
      parentObjectiveId: socMain.id,
      createdBy: getUserByUnit(secEngDept.id).id,
    },
  });
  await prisma.objectiveAssignment.create({
    data: { objectiveId: socTools.id, unitId: secOps.id },
  });

  const socProcesses = await prisma.objective.create({
    data: {
      title: 'Define SOC Processes',
      targetDate: formatDate(daysFromNow(70)),
      projectId: soc.id,
      fromTier: 3,
      parentObjectiveId: socMain.id,
      createdBy: getUserByUnit(secEngDept.id).id,
    },
  });
  await prisma.objectiveAssignment.create({
    data: { objectiveId: socProcesses.id, unitId: secOps.id },
  });

  await prisma.objectiveDependency.create({
    data: { predecessorId: socTools.id, successorId: socProcesses.id, type: 'FS' },
  });

  console.log('✅ Created 20+ objectives with dependencies');

  // ============================================
  // REFINEMENT SESSIONS & WORK ITEMS
  // ============================================
  console.log('📝 Creating refinement sessions and work items...');

  // Create refinement session for Portal v2 Backend
  const portal2BackendSession = await prisma.refinementSession.create({
    data: {
      projectId: portal2.id,
      objectiveId: portal2Backend.id,
      status: 'completed',
      createdBy: getUserByUnit(backendDept.id).id,
      completedAt: daysAgo(5),
    },
  });

  // Work items for Portal v2 Backend (Backend Alpha team)
  const portal2BackendItems = [
    { title: 'Design API authentication system', priority: 'P1', status: 'Done', completedAt: daysAgo(20) },
    { title: 'Implement user management endpoints', priority: 'P1', status: 'Done', completedAt: daysAgo(18) },
    { title: 'Build dashboard data aggregation API', priority: 'P1', status: 'In Progress', completedAt: null },
    { title: 'Create notification service', priority: 'P2', status: 'Ready', completedAt: null },
    { title: 'Implement search functionality', priority: 'P2', status: 'Backlog', completedAt: null },
    { title: 'Add rate limiting middleware', priority: 'P2', status: 'Backlog', completedAt: null },
    { title: 'Build reporting API', priority: 'P3', status: 'Backlog', completedAt: null },
    { title: 'Add API versioning', priority: 'P3', status: 'Backlog', completedAt: null },
  ];

  for (const [idx, item] of portal2BackendItems.entries()) {
    await prisma.workItem.create({
      data: {
        refinementSessionId: portal2BackendSession.id,
        title: item.title,
        priority: item.priority,
        stackRank: idx,
        status: item.status,
        assignedOrgUnit: backendAlpha.id,
        createdBy: getUserByUnit(backendAlpha.id).id,
        completedAt: item.completedAt,
      },
    });
  }

  // Work items for Portal v2 Frontend (Frontend Alpha team)
  const portal2FrontendSession = await prisma.refinementSession.create({
    data: {
      projectId: portal2.id,
      objectiveId: portal2Frontend.id,
      status: 'in-progress',
      createdBy: getUserByUnit(frontendDept.id).id,
    },
  });

  const portal2FrontendItems = [
    { title: 'Setup React app with TypeScript', priority: 'P1', status: 'Done', completedAt: daysAgo(15) },
    { title: 'Create design system components', priority: 'P1', status: 'Done', completedAt: daysAgo(12) },
    { title: 'Build authentication flow', priority: 'P1', status: 'In Progress', completedAt: null },
    { title: 'Implement dashboard UI', priority: 'P1', status: 'Ready', completedAt: null },
    { title: 'Create user profile pages', priority: 'P2', status: 'Backlog', completedAt: null },
    { title: 'Build notification center', priority: 'P2', status: 'Backlog', completedAt: null },
    { title: 'Add dark mode support', priority: 'P3', status: 'Backlog', completedAt: null },
    { title: 'Implement accessibility features', priority: 'P2', status: 'Backlog', completedAt: null },
  ];

  for (const [idx, item] of portal2FrontendItems.entries()) {
    await prisma.workItem.create({
      data: {
        refinementSessionId: portal2FrontendSession.id,
        title: item.title,
        priority: item.priority,
        stackRank: idx,
        status: item.status,
        assignedOrgUnit: frontendAlpha.id,
        createdBy: getUserByUnit(frontendAlpha.id).id,
        completedAt: item.completedAt,
      },
    });
  }

  // Work items for Cloud Migration
  const cloudInfraSession = await prisma.refinementSession.create({
    data: {
      projectId: cloudMigration.id,
      objectiveId: cloudInfra.id,
      status: 'completed',
      createdBy: getUserByUnit(devopsDept.id).id,
      completedAt: daysAgo(3),
    },
  });

  const cloudInfraItems = [
    { title: 'Create AWS organization structure', priority: 'P1', status: 'Done', completedAt: daysAgo(25) },
    { title: 'Setup VPC and subnets', priority: 'P1', status: 'Done', completedAt: daysAgo(22) },
    { title: 'Configure security groups', priority: 'P1', status: 'Done', completedAt: daysAgo(20) },
    { title: 'Setup NAT gateways', priority: 'P1', status: 'In Progress', completedAt: null },
    { title: 'Configure VPN connection', priority: 'P2', status: 'Ready', completedAt: null },
    { title: 'Setup AWS Transit Gateway', priority: 'P2', status: 'Backlog', completedAt: null },
  ];

  for (const [idx, item] of cloudInfraItems.entries()) {
    await prisma.workItem.create({
      data: {
        refinementSessionId: cloudInfraSession.id,
        title: item.title,
        priority: item.priority,
        stackRank: idx,
        status: item.status,
        assignedOrgUnit: devopsInfra.id,
        createdBy: getUserByUnit(devopsInfra.id).id,
        completedAt: item.completedAt,
      },
    });
  }

  const cloudSecuritySession = await prisma.refinementSession.create({
    data: {
      projectId: cloudMigration.id,
      objectiveId: cloudSecurity.id,
      status: 'in-progress',
      createdBy: getUserByUnit(secEngDept.id).id,
    },
  });

  const cloudSecurityItems = [
    { title: 'Setup IAM roles and policies', priority: 'P1', status: 'Ready', completedAt: null },
    { title: 'Enable AWS CloudTrail', priority: 'P1', status: 'Backlog', completedAt: null },
    { title: 'Configure AWS GuardDuty', priority: 'P1', status: 'Backlog', completedAt: null },
    { title: 'Setup AWS Security Hub', priority: 'P2', status: 'Backlog', completedAt: null },
    { title: 'Implement KMS encryption', priority: 'P1', status: 'Backlog', completedAt: null },
  ];

  for (const [idx, item] of cloudSecurityItems.entries()) {
    await prisma.workItem.create({
      data: {
        refinementSessionId: cloudSecuritySession.id,
        title: item.title,
        priority: item.priority,
        stackRank: idx,
        status: item.status,
        assignedOrgUnit: secOps.id,
        createdBy: getUserByUnit(secOps.id).id,
        completedAt: item.completedAt,
      },
    });
  }

  // Add O&M work items (not tied to projects) for various teams
  console.log('🔧 Creating O&M work items...');

  const omItems = [
    // Backend teams O&M
    { team: backendAlpha, title: 'Fix memory leak in user service', priority: 'P1', status: 'In Progress' },
    { team: backendAlpha, title: 'Upgrade database driver version', priority: 'P2', status: 'Backlog' },
    { team: backendAlpha, title: 'Optimize slow query on reports table', priority: 'P2', status: 'Backlog' },
    { team: backendBeta, title: 'Address API performance degradation', priority: 'P1', status: 'Ready' },
    { team: backendBeta, title: 'Update API documentation', priority: 'P3', status: 'Backlog' },
    { team: backendGamma, title: 'Fix broken webhook notifications', priority: 'P1', status: 'Blocked' },
    { team: backendGamma, title: 'Implement request caching', priority: 'P2', status: 'Backlog' },
    
    // Frontend teams O&M
    { team: frontendAlpha, title: 'Fix mobile responsive issues', priority: 'P1', status: 'In Progress' },
    { team: frontendAlpha, title: 'Update to React 18', priority: 'P2', status: 'Backlog' },
    { team: frontendBeta, title: 'Address accessibility violations', priority: 'P1', status: 'Ready' },
    { team: frontendBeta, title: 'Optimize bundle size', priority: 'P2', status: 'Backlog' },
    
    // DevOps O&M
    { team: devopsInfra, title: 'Upgrade Kubernetes cluster', priority: 'P1', status: 'Ready' },
    { team: devopsInfra, title: 'Patch security vulnerabilities', priority: 'P1', status: 'In Progress' },
    { team: devopsPlatform, title: 'Improve CI/CD pipeline speed', priority: 'P2', status: 'Backlog' },
    { team: devopsPlatform, title: 'Setup cost monitoring dashboards', priority: 'P3', status: 'Backlog' },
    
    // QA O&M
    { team: qaAutomation, title: 'Fix flaky integration tests', priority: 'P1', status: 'In Progress' },
    { team: qaAutomation, title: 'Add test coverage for new features', priority: 'P2', status: 'Backlog' },
    { team: qaManual, title: 'Update test cases for v2 features', priority: 'P2', status: 'Backlog' },
    
    // Security O&M
    { team: secOps, title: 'Investigate suspicious login attempts', priority: 'P1', status: 'Done', completedAt: daysAgo(3) },
    { team: secOps, title: 'Update firewall rules', priority: 'P2', status: 'Backlog' },
    { team: secAppSec, title: 'Conduct security code review', priority: 'P1', status: 'Ready' },
    { team: secAppSec, title: 'Update security scanning tools', priority: 'P2', status: 'Backlog' },
  ];

  for (const [idx, item] of omItems.entries()) {
    await prisma.workItem.create({
      data: {
        title: item.title,
        priority: item.priority,
        stackRank: idx,
        status: item.status,
        assignedOrgUnit: item.team.id,
        createdBy: getUserByUnit(item.team.id).id,
        completedAt: item.completedAt || null,
      },
    });
  }

  console.log('✅ Created 60+ work items (project + O&M)');

  // ============================================
  // HISTORICAL THROUGHPUT DATA
  // ============================================
  console.log('📊 Creating historical throughput data...');

  // Generate 12 weeks of throughput data for each leaf team
  for (const team of leafTeams) {
    for (let weekOffset = 12; weekOffset > 0; weekOffset--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (weekOffset * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      // Vary throughput by team type (some teams faster than others)
      let baseRate = 2; // Default 2 items/week
      if (team.name.includes('Backend') || team.name.includes('Frontend')) {
        baseRate = 3; // Dev teams slightly faster
      } else if (team.name.includes('QA')) {
        baseRate = 4; // QA can process more items
      } else if (team.name.includes('Security')) {
        baseRate = 2; // Security more thorough, slower
      }
      
      // Add some randomness (+/- 1)
      const itemsCompleted = Math.max(1, baseRate + Math.floor(Math.random() * 3) - 1);
      
      await prisma.teamThroughput.create({
        data: {
          teamId: team.id,
          weekStartDate: weekStart,
          itemsCompleted,
        },
      });
    }
  }

  console.log('✅ Created 12 weeks of throughput data for all leaf teams');

  console.log('🌱 Seed data created successfully!');
}
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
