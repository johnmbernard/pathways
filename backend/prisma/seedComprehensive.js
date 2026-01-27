/**
 * Comprehensive Seed Script - Complete Database Setup
 * 
 * Creates complete system with:
 * - Organizational structure (Tier 1, Tier 2, Tier 3)
 * - Demo users with credentials
 * - 12 projects created by Tier 1 across refinement lifecycle
 * - Tier 1 objectives with Tier 2 refined child objectives
 * - Work items created by Tier 3 leaf units
 * 
 * Run with: npm run seed
 */

import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

async function main() {
  console.log('🚀 Starting comprehensive seed...');
  console.log('');

  // ===== STEP 1: Clear existing data =====
  console.log('🗑️  Clearing existing data...');
  await prisma.discussionMessage.deleteMany();
  await prisma.workItem.deleteMany();
  await prisma.refinementUnitCompletion.deleteMany();
  await prisma.refinementSession.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.objectiveCompletion.deleteMany();
  await prisma.objectiveAssignment.deleteMany();
  await prisma.objective.deleteMany();
  await prisma.project.deleteMany();
  await prisma.teamThroughput.deleteMany();
  await prisma.organizationalUnit.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Database cleared');
  console.log('');

  // ===== STEP 2: Create organizational structure =====
  console.log('🏢 Creating organizational structure...');
  
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

  // Tier 2 - Departments
  const tier2Names = [
    'Operations C2',
    'Wing C2',
    'Security',
    'Application Dev',
    'Infrastructure',
    'Data & Analytics',
    'Platform Engineering',
    'DevSecOps',
  ];

  const tier2Units = [];
  for (let i = 0; i < tier2Names.length; i++) {
    const unit = await prisma.organizationalUnit.create({
      data: {
        id: `org-2-${i + 1}`,
        name: tier2Names[i],
        parentId: kesselRun.id,
        tier: 2,
        order: i,
      },
    });
    tier2Units.push(unit);
  }

  // Tier 3 - Teams (4-5 teams per department)
  const tier3TeamNames = ['Alpha Team', 'Bravo Team', 'Charlie Team', 'Delta Team', 'Echo Team'];
  const tier3Units = [];
  
  for (const tier2Unit of tier2Units) {
    const teamCount = 4 + Math.floor(Math.random() * 2); // 4-5 teams
    for (let i = 0; i < teamCount; i++) {
      const unit = await prisma.organizationalUnit.create({
        data: {
          id: `org-3-${tier2Unit.id}-${i + 1}`,
          name: `${tier2Unit.name} - ${tier3TeamNames[i]}`,
          parentId: tier2Unit.id,
          tier: 3,
          order: i,
        },
      });
      tier3Units.push(unit);
    }
  }

  console.log(`✅ Created: 1 Tier 1 org, ${tier2Units.length} Tier 2 departments, ${tier3Units.length} Tier 3 teams`);
  console.log('');

  // ===== STEP 3: Create users =====
  console.log('👥 Creating demo users...');
  
  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Tier 1 leader
  const user1 = await prisma.user.create({
    data: {
      id: 'user-1',
      email: 'kessel.lead@pathways.dev',
      password: hashedPassword,
      name: 'Admiral Kessel',
      organizationalUnit: kesselRun.id,
      role: 'Organization Leader',
    },
  });

  // Tier 2 department leads
  for (let i = 0; i < tier2Units.length; i++) {
    await prisma.user.create({
      data: {
        id: `user-2-${i + 1}`,
        email: `dept${i + 1}.lead@pathways.dev`,
        password: hashedPassword,
        name: `${tier2Units[i].name} Director`,
        organizationalUnit: tier2Units[i].id,
        role: 'Department Lead',
      },
    });
  }

  // Tier 3 team leads
  for (let i = 0; i < Math.min(tier3Units.length, 20); i++) {
    await prisma.user.create({
      data: {
        id: `user-3-${i + 1}`,
        email: `team${i + 1}.lead@pathways.dev`,
        password: hashedPassword,
        name: `Team ${i + 1} Lead`,
        organizationalUnit: tier3Units[i].id,
        role: 'Team Lead',
      },
    });
  }

  console.log(`✅ Created ${await prisma.user.count()} users (all password: demo123)`);
  console.log('');

  // ===== STEP 4: Create projects with tiered objectives =====
  const rootUnit = kesselRun;
  const today = new Date();

  console.log(`Found ${tier2Units.length} Tier 2 units and ${tier3Units.length} Tier 3 units`);
  console.log('');

  // ===== PHASE 1: EARLY PLANNING (3 projects) =====
  // Only Tier 1 objectives, no refinement started
  console.log('\n📋 Creating Early Planning projects...');
  
  const earlyPlanningProjects = [
    {
      title: 'AI Integration Initiative',
      description: 'Integrate AI capabilities across product suite',
      owner: 'Chief Innovation Officer',
      ownerUnit: rootUnit.id,
      ownerTier: 1,
      startDate: formatDate(addDays(today, 14)),
      targetDate: formatDate(addDays(today, 180)),
      budget: 750000,
      status: 'Planning',
      objectives: [
        { title: 'Assess AI technology landscape', description: 'Research available AI solutions and vendors', targetDate: formatDate(addDays(today, 30)) },
        { title: 'Define AI use cases', description: 'Identify high-value AI applications', targetDate: formatDate(addDays(today, 45)) },
        { title: 'Develop AI roadmap', description: 'Create phased implementation plan', targetDate: formatDate(addDays(today, 60)) },
        { title: 'Establish AI governance', description: 'Define policies and oversight framework', targetDate: formatDate(addDays(today, 60)) },
      ],
    },
    {
      title: 'Global Expansion - APAC Markets',
      description: 'Launch operations in Asia-Pacific region',
      owner: 'SVP International Growth',
      ownerUnit: rootUnit.id,
      ownerTier: 1,
      startDate: formatDate(addDays(today, 21)),
      targetDate: formatDate(addDays(today, 365)),
      budget: 2500000,
      status: 'Planning',
      objectives: [
        { title: 'Market research and analysis', description: 'Analyze target markets in APAC', targetDate: formatDate(addDays(today, 60)) },
        { title: 'Regulatory compliance assessment', description: 'Understand legal requirements per country', targetDate: formatDate(addDays(today, 90)) },
        { title: 'Partnership strategy', description: 'Identify potential local partners', targetDate: formatDate(addDays(today, 90)) },
      ],
    },
    {
      title: 'Sustainability Program Launch',
      description: 'Implement company-wide sustainability initiatives',
      owner: 'Chief Sustainability Officer',
      ownerUnit: rootUnit.id,
      ownerTier: 1,
      startDate: formatDate(addDays(today, 30)),
      targetDate: formatDate(addDays(today, 270)),
      budget: 450000,
      status: 'Planning',
      objectives: [
        { title: 'Carbon footprint baseline', description: 'Measure current environmental impact', targetDate: formatDate(addDays(today, 45)) },
        { title: 'Set sustainability targets', description: 'Define measurable goals for reduction', targetDate: formatDate(addDays(today, 60)) },
        { title: 'Renewable energy transition', description: 'Plan migration to renewable sources', targetDate: formatDate(addDays(today, 90)) },
        { title: 'Supplier sustainability assessment', description: 'Evaluate supply chain practices', targetDate: formatDate(addDays(today, 75)) },
      ],
    },
  ];

  for (const projectData of earlyPlanningProjects) {
    const { objectives, ...projectFields } = projectData;
    const project = await prisma.project.create({
      data: {
        ...projectFields,
        createdBy: user1.id,
      },
    });

    // Create Tier 1 objectives only (no children)
    for (const objData of objectives) {
      await prisma.objective.create({
        data: {
          ...objData,
          projectId: project.id,
          fromTier: 1,
          createdBy: user1.id,
        },
      });
    }
    console.log(`  ✓ ${project.title} (${objectives.length} Tier 1 objectives)`);
  }

  // ===== PHASE 2: PARTIAL REFINEMENT (3 projects) =====
  // Some Tier 1 objectives have been refined into Tier 2 objectives
  console.log('\n🔄 Creating Partial Refinement projects...');

  const partialRefinementProjects = [
    {
      title: 'Cloud Infrastructure Modernization',
      description: 'Migrate to cloud-native architecture',
      owner: 'CTO',
      ownerUnit: rootUnit.id,
      ownerTier: 1,
      startDate: formatDate(addDays(today, -14)),
      targetDate: formatDate(addDays(today, 150)),
      budget: 1200000,
      status: 'In Progress',
      objectives: [
        {
          title: 'Infrastructure assessment and planning',
          description: 'Audit current infrastructure and plan migration',
          targetDate: formatDate(addDays(today, 30)),
          refined: true, // This one has been refined
          childObjectives: [
            { title: 'Audit legacy systems', description: 'Catalog all existing infrastructure', targetDate: formatDate(addDays(today, 20)), assignedUnits: [tier2Units[0].id, tier2Units[1].id] },
            { title: 'Cloud provider selection', description: 'Evaluate and select cloud vendor', targetDate: formatDate(addDays(today, 25)), assignedUnits: [tier2Units[0].id] },
          ],
        },
        {
          title: 'Migration wave 1 - Non-critical systems',
          description: 'Move development and staging environments',
          targetDate: formatDate(addDays(today, 60)),
          refined: true,
          childObjectives: [
            { title: 'Migrate dev environments', description: 'Move all development infrastructure', targetDate: formatDate(addDays(today, 40)), assignedUnits: [tier2Units[1].id] },
            { title: 'Migrate staging systems', description: 'Move staging infrastructure', targetDate: formatDate(addDays(today, 55)), assignedUnits: [tier2Units[1].id] },
          ],
        },
        {
          title: 'Migration wave 2 - Production systems',
          description: 'Move production workloads to cloud',
          targetDate: formatDate(addDays(today, 90)),
          refined: false, // Not yet refined
        },
        {
          title: 'Cloud optimization and cost management',
          description: 'Implement cost controls and optimization',
          targetDate: formatDate(addDays(today, 120)),
          refined: false, // Not yet refined
        },
      ],
    },
    {
      title: 'Customer Experience Platform',
      description: 'Build unified customer engagement platform',
      owner: 'VP Customer Success',
      ownerUnit: rootUnit.id,
      ownerTier: 1,
      startDate: formatDate(addDays(today, -7)),
      targetDate: formatDate(addDays(today, 180)),
      budget: 850000,
      status: 'In Progress',
      objectives: [
        {
          title: 'Customer data unification',
          description: 'Consolidate customer data from all sources',
          targetDate: formatDate(addDays(today, 60)),
          refined: true,
          childObjectives: [
            { title: 'Data source integration', description: 'Connect all customer data systems', targetDate: formatDate(addDays(today, 40)), assignedUnits: [tier2Units[2].id] },
            { title: 'Customer 360 view implementation', description: 'Build unified customer profile', targetDate: formatDate(addDays(today, 55)), assignedUnits: [tier2Units[2].id] },
          ],
        },
        {
          title: 'Omnichannel communication hub',
          description: 'Enable consistent communication across channels',
          targetDate: formatDate(addDays(today, 90)),
          refined: false,
        },
        {
          title: 'Self-service portal enhancement',
          description: 'Improve customer self-service capabilities',
          targetDate: formatDate(addDays(today, 120)),
          refined: false,
        },
      ],
    },
    {
      title: 'Product Innovation Lab',
      description: 'Establish rapid prototyping and innovation capability',
      owner: 'Chief Product Officer',
      ownerUnit: rootUnit.id,
      ownerTier: 1,
      startDate: formatDate(addDays(today, -10)),
      targetDate: formatDate(addDays(today, 120)),
      budget: 500000,
      status: 'In Progress',
      objectives: [
        {
          title: 'Innovation lab setup',
          description: 'Establish physical and virtual lab infrastructure',
          targetDate: formatDate(addDays(today, 30)),
          refined: true,
          childObjectives: [
            { title: 'Lab space and equipment', description: 'Set up physical innovation space', targetDate: formatDate(addDays(today, 20)), assignedUnits: [tier2Units[3]?.id || tier2Units[0].id] },
            { title: 'Development tools and platforms', description: 'Procure rapid prototyping tools', targetDate: formatDate(addDays(today, 25)), assignedUnits: [tier2Units[3]?.id || tier2Units[0].id] },
          ],
        },
        {
          title: 'Innovation process definition',
          description: 'Create ideation and validation framework',
          targetDate: formatDate(addDays(today, 45)),
          refined: false,
        },
        {
          title: 'First innovation cohort',
          description: 'Run first batch of innovation projects',
          targetDate: formatDate(addDays(today, 90)),
          refined: false,
        },
      ],
    },
  ];

  for (const projectData of partialRefinementProjects) {
    const { objectives, ...projectFields } = projectData;
    const project = await prisma.project.create({
      data: {
        ...projectFields,
        createdBy: user1.id,
      },
    });

    let tier1Count = 0;
    let tier2Count = 0;

    for (const objData of objectives) {
      const { childObjectives, refined, ...tier1Fields } = objData;
      
      // Create Tier 1 objective
      const tier1Objective = await prisma.objective.create({
        data: {
          ...tier1Fields,
          projectId: project.id,
          fromTier: 1,
          createdBy: user1.id,
        },
      });
      tier1Count++;

      // Create Tier 2 child objectives if refined
      if (refined && childObjectives) {
        for (const childData of childObjectives) {
          const { assignedUnits, ...childFields } = childData;
          
          const tier2Objective = await prisma.objective.create({
            data: {
              ...childFields,
              projectId: project.id,
              fromTier: 2,
              parentObjectiveId: tier1Objective.id,
              createdBy: user1.id,
            },
          });
          tier2Count++;

          // Assign to Tier 2 units
          if (assignedUnits) {
            for (const unitId of assignedUnits) {
              await prisma.objectiveAssignment.create({
                data: {
                  objectiveId: tier2Objective.id,
                  unitId: unitId,
                },
              });
            }
          }
        }
      }
    }
    console.log(`  ✓ ${project.title} (${tier1Count} Tier 1, ${tier2Count} Tier 2 objectives)`);
  }

  // ===== PHASE 3: FULLY REFINED (2 projects) =====
  // All Tier 1 objectives refined to Tier 2, assigned to Tier 3 leaf units
  console.log('\n✅ Creating Fully Refined projects...');

  const fullyRefinedProjects = [
    {
      title: 'Security Infrastructure Overhaul',
      description: 'Comprehensive security modernization',
      owner: 'CISO',
      ownerUnit: rootUnit.id,
      ownerTier: 1,
      startDate: formatDate(addDays(today, -30)),
      targetDate: formatDate(addDays(today, 120)),
      budget: 950000,
      status: 'In Progress',
      objectives: [
        {
          title: 'Identity and access management',
          description: 'Implement zero-trust IAM',
          targetDate: formatDate(addDays(today, 40)),
          childObjectives: [
            { title: 'SSO implementation', description: 'Deploy single sign-on across all systems', targetDate: formatDate(addDays(today, 25)), assignedUnits: [tier2Units[0].id], tier3Assignments: [tier3Units[0].id, tier3Units[1].id] },
            { title: 'MFA rollout', description: 'Enable multi-factor authentication company-wide', targetDate: formatDate(addDays(today, 30)), assignedUnits: [tier2Units[0].id], tier3Assignments: [tier3Units[2].id] },
          ],
        },
        {
          title: 'Network security enhancement',
          description: 'Upgrade network security controls',
          targetDate: formatDate(addDays(today, 60)),
          childObjectives: [
            { title: 'Firewall modernization', description: 'Replace legacy firewalls with next-gen', targetDate: formatDate(addDays(today, 45)), assignedUnits: [tier2Units[1].id], tier3Assignments: [tier3Units[3]?.id || tier3Units[0].id] },
            { title: 'Intrusion detection system', description: 'Deploy advanced threat detection', targetDate: formatDate(addDays(today, 55)), assignedUnits: [tier2Units[1].id], tier3Assignments: [tier3Units[4]?.id || tier3Units[1].id] },
          ],
        },
        {
          title: 'Security monitoring and response',
          description: 'Build SOC capability',
          targetDate: formatDate(addDays(today, 90)),
          childObjectives: [
            { title: 'SIEM implementation', description: 'Deploy security information and event management', targetDate: formatDate(addDays(today, 70)), assignedUnits: [tier2Units[2].id], tier3Assignments: [tier3Units[5]?.id || tier3Units[2].id] },
            { title: 'Incident response playbooks', description: 'Document response procedures', targetDate: formatDate(addDays(today, 80)), assignedUnits: [tier2Units[2].id], tier3Assignments: [tier3Units[6]?.id || tier3Units[0].id] },
          ],
        },
      ],
    },
    {
      title: 'Mobile App Redesign',
      description: 'Complete mobile application overhaul',
      owner: 'VP Mobile Products',
      ownerUnit: rootUnit.id,
      ownerTier: 1,
      startDate: formatDate(addDays(today, -21)),
      targetDate: formatDate(addDays(today, 90)),
      budget: 650000,
      status: 'In Progress',
      objectives: [
        {
          title: 'User research and design',
          description: 'Research user needs and create new design',
          targetDate: formatDate(addDays(today, 30)),
          childObjectives: [
            { title: 'User interviews and surveys', description: 'Gather user feedback and requirements', targetDate: formatDate(addDays(today, 15)), assignedUnits: [tier2Units[3]?.id || tier2Units[0].id], tier3Assignments: [tier3Units[7]?.id || tier3Units[0].id] },
            { title: 'Design system creation', description: 'Build comprehensive design system', targetDate: formatDate(addDays(today, 25)), assignedUnits: [tier2Units[3]?.id || tier2Units[0].id], tier3Assignments: [tier3Units[8]?.id || tier3Units[1].id] },
          ],
        },
        {
          title: 'Core functionality rebuild',
          description: 'Rebuild key app features',
          targetDate: formatDate(addDays(today, 60)),
          childObjectives: [
            { title: 'Navigation and information architecture', description: 'Implement new navigation', targetDate: formatDate(addDays(today, 45)), assignedUnits: [tier2Units[1].id], tier3Assignments: [tier3Units[2].id] },
            { title: 'Dashboard and analytics', description: 'Build new dashboard views', targetDate: formatDate(addDays(today, 55)), assignedUnits: [tier2Units[1].id], tier3Assignments: [tier3Units[3]?.id || tier3Units[0].id] },
          ],
        },
        {
          title: 'Performance optimization',
          description: 'Improve app speed and responsiveness',
          targetDate: formatDate(addDays(today, 75)),
          childObjectives: [
            { title: 'Load time optimization', description: 'Reduce initial load time by 50%', targetDate: formatDate(addDays(today, 65)), assignedUnits: [tier2Units[2].id], tier3Assignments: [tier3Units[1].id] },
            { title: 'Memory management', description: 'Optimize memory usage and prevent leaks', targetDate: formatDate(addDays(today, 70)), assignedUnits: [tier2Units[2].id], tier3Assignments: [tier3Units[2].id] },
          ],
        },
      ],
    },
  ];

  for (const projectData of fullyRefinedProjects) {
    const { objectives, ...projectFields } = projectData;
    const project = await prisma.project.create({
      data: {
        ...projectFields,
        createdBy: user1.id,
      },
    });

    let tier1Count = 0;
    let tier2Count = 0;

    for (const objData of objectives) {
      const { childObjectives, ...tier1Fields } = objData;
      
      // Create Tier 1 objective
      const tier1Objective = await prisma.objective.create({
        data: {
          ...tier1Fields,
          projectId: project.id,
          fromTier: 1,
          createdBy: user1.id,
        },
      });
      tier1Count++;

      // All objectives are refined
      if (childObjectives) {
        for (const childData of childObjectives) {
          const { assignedUnits, tier3Assignments, ...childFields } = childData;
          
          const tier2Objective = await prisma.objective.create({
            data: {
              ...childFields,
              projectId: project.id,
              fromTier: 2,
              parentObjectiveId: tier1Objective.id,
              createdBy: user1.id,
            },
          });
          tier2Count++;

          // Assign to Tier 2 units (who then assign to their Tier 3 children)
          if (assignedUnits) {
            for (const unitId of assignedUnits) {
              await prisma.objectiveAssignment.create({
                data: {
                  objectiveId: tier2Objective.id,
                  unitId: unitId,
                },
              });
            }
          }

          // Also assign to Tier 3 leaf units (they will create work items)
          if (tier3Assignments) {
            for (const tier3UnitId of tier3Assignments) {
              await prisma.objectiveAssignment.create({
                data: {
                  objectiveId: tier2Objective.id,
                  unitId: tier3UnitId,
                },
              });
            }
          }
        }
      }
    }
    console.log(`  ✓ ${project.title} (${tier1Count} Tier 1, ${tier2Count} Tier 2 objectives)`);
  }

  // ===== PHASE 4: IN EXECUTION (2 projects) =====
  // Tier 3 units have created work items
  console.log('\n⚙️  Creating In Execution projects...');

  const executionProjects = [
    {
      title: 'Data Analytics Platform',
      description: 'Build enterprise-wide analytics capability',
      owner: 'Chief Data Officer',
      ownerUnit: rootUnit.id,
      ownerTier: 1,
      startDate: formatDate(addDays(today, -45)),
      targetDate: formatDate(addDays(today, 90)),
      budget: 1100000,
      status: 'In Progress',
      objectives: [
        {
          title: 'Data warehouse implementation',
          description: 'Build centralized data warehouse',
          targetDate: formatDate(addDays(today, 40)),
          childObjectives: [
            {
              title: 'Data warehouse architecture',
              description: 'Design and implement warehouse structure',
              targetDate: formatDate(addDays(today, 25)),
              assignedUnits: [tier2Units[0].id],
              tier3Assignments: [tier3Units[0].id],
              workItems: [
                { title: 'Design dimensional model', description: 'Create star schema design', status: 'Completed', estimatedEffort: 8 },
                { title: 'Set up cloud data warehouse', description: 'Provision Snowflake/BigQuery instance', status: 'Completed', estimatedEffort: 5 },
                { title: 'Implement ETL pipelines', description: 'Build data ingestion workflows', status: 'In Progress', estimatedEffort: 13 },
              ],
            },
            {
              title: 'Data quality framework',
              description: 'Implement data validation and monitoring',
              targetDate: formatDate(addDays(today, 35)),
              assignedUnits: [tier2Units[0].id],
              tier3Assignments: [tier3Units[1].id],
              workItems: [
                { title: 'Define data quality metrics', description: 'Establish quality KPIs', status: 'Completed', estimatedEffort: 5 },
                { title: 'Build validation rules', description: 'Implement automated data checks', status: 'In Progress', estimatedEffort: 8 },
              ],
            },
          ],
        },
        {
          title: 'Self-service BI tools',
          description: 'Deploy business intelligence platform',
          targetDate: formatDate(addDays(today, 60)),
          childObjectives: [
            {
              title: 'BI tool selection and setup',
              description: 'Choose and configure BI platform',
              targetDate: formatDate(addDays(today, 45)),
              assignedUnits: [tier2Units[1].id],
              tier3Assignments: [tier3Units[2].id],
              workItems: [
                { title: 'Evaluate BI tools', description: 'Compare Tableau, PowerBI, Looker', status: 'Completed', estimatedEffort: 8 },
                { title: 'Deploy BI platform', description: 'Set up selected tool', status: 'In Progress', estimatedEffort: 13 },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'API Ecosystem Development',
      description: 'Build comprehensive API platform',
      owner: 'VP Engineering',
      ownerUnit: rootUnit.id,
      ownerTier: 1,
      startDate: formatDate(addDays(today, -35)),
      targetDate: formatDate(addDays(today, 105)),
      budget: 800000,
      status: 'In Progress',
      objectives: [
        {
          title: 'API gateway and management',
          description: 'Implement API infrastructure',
          targetDate: formatDate(addDays(today, 45)),
          childObjectives: [
            {
              title: 'API gateway setup',
              description: 'Deploy and configure API gateway',
              targetDate: formatDate(addDays(today, 30)),
              assignedUnits: [tier2Units[2].id],
              tier3Assignments: [tier3Units[3]?.id || tier3Units[0].id],
              workItems: [
                { title: 'Select API gateway solution', description: 'Evaluate Kong, Apigee, AWS Gateway', status: 'Completed', estimatedEffort: 5 },
                { title: 'Deploy gateway infrastructure', description: 'Set up gateway in production', status: 'In Progress', estimatedEffort: 13 },
                { title: 'Configure rate limiting', description: 'Implement throttling policies', status: 'Not Started', estimatedEffort: 5 },
              ],
            },
          ],
        },
        {
          title: 'API documentation portal',
          description: 'Create developer documentation site',
          targetDate: formatDate(addDays(today, 60)),
          childObjectives: [
            {
              title: 'Documentation platform',
              description: 'Build API docs website',
              targetDate: formatDate(addDays(today, 50)),
              assignedUnits: [tier2Units[1].id],
              tier3Assignments: [tier3Units[1].id],
              workItems: [
                { title: 'Set up docs framework', description: 'Configure Swagger/OpenAPI', status: 'Completed', estimatedEffort: 8 },
                { title: 'Write API documentation', description: 'Document all endpoints', status: 'In Progress', estimatedEffort: 21 },
              ],
            },
          ],
        },
      ],
    },
  ];

  for (const projectData of executionProjects) {
    const { objectives, ...projectFields } = projectData;
    const project = await prisma.project.create({
      data: {
        ...projectFields,
        createdBy: user1.id,
      },
    });

    let tier1Count = 0;
    let tier2Count = 0;
    let workItemCount = 0;

    for (const objData of objectives) {
      const { childObjectives, ...tier1Fields } = objData;
      
      // Create Tier 1 objective
      const tier1Objective = await prisma.objective.create({
        data: {
          ...tier1Fields,
          projectId: project.id,
          fromTier: 1,
          createdBy: user1.id,
        },
      });
      tier1Count++;

      if (childObjectives) {
        for (const childData of childObjectives) {
          const { assignedUnits, tier3Assignments, workItems, ...childFields } = childData;
          
          const tier2Objective = await prisma.objective.create({
            data: {
              ...childFields,
              projectId: project.id,
              fromTier: 2,
              parentObjectiveId: tier1Objective.id,
              createdBy: user1.id,
            },
          });
          tier2Count++;

          // Assign to units
          if (assignedUnits) {
            for (const unitId of assignedUnits) {
              await prisma.objectiveAssignment.create({
                data: { objectiveId: tier2Objective.id, unitId: unitId },
              });
            }
          }
          if (tier3Assignments) {
            for (const tier3UnitId of tier3Assignments) {
              await prisma.objectiveAssignment.create({
                data: { objectiveId: tier2Objective.id, unitId: tier3UnitId },
              });
            }
          }

          // Create work items (created by Tier 3 units)
          if (workItems) {
            for (const workItemData of workItems) {
              await prisma.workItem.create({
                data: {
                  ...workItemData,
                  projectId: project.id,
                  objectiveId: tier2Objective.id,
                  priority: 'Medium',
                  createdBy: user1.id,
                },
              });
              workItemCount++;
            }
          }
        }
      }
    }
    console.log(`  ✓ ${project.title} (${tier1Count} Tier 1, ${tier2Count} Tier 2, ${workItemCount} work items)`);
  }

  // ===== PHASE 5: ACTIVE PROGRESS (2 projects) =====
  // Work items in various states, some completed
  console.log('\n🚀 Creating Active Progress projects...');

  const activeProjects = [
    {
      title: 'E-commerce Platform Enhancement',
      description: 'Major improvements to online shopping experience',
      owner: 'VP E-commerce',
      ownerUnit: rootUnit.id,
      ownerTier: 1,
      startDate: formatDate(addDays(today, -60)),
      targetDate: formatDate(addDays(today, 60)),
      budget: 1500000,
      status: 'In Progress',
      objectives: [
        {
          title: 'Checkout experience redesign',
          description: 'Streamline purchase flow',
          targetDate: formatDate(addDays(today, 20)),
          childObjectives: [
            {
              title: 'One-click checkout',
              description: 'Implement express checkout',
              targetDate: formatDate(addDays(today, 15)),
              assignedUnits: [tier2Units[0].id],
              tier3Assignments: [tier3Units[0].id],
              workItems: [
                { title: 'Design checkout UI', description: 'Create streamlined checkout design', status: 'Completed', estimatedEffort: 8 },
                { title: 'Implement payment tokenization', description: 'Store payment methods securely', status: 'Completed', estimatedEffort: 13 },
                { title: 'Build one-click flow', description: 'Implement express checkout logic', status: 'Completed', estimatedEffort: 13 },
                { title: 'Testing and QA', description: 'Comprehensive checkout testing', status: 'In Progress', estimatedEffort: 8 },
              ],
            },
            {
              title: 'Guest checkout optimization',
              description: 'Improve experience for non-logged-in users',
              targetDate: formatDate(addDays(today, 18)),
              assignedUnits: [tier2Units[0].id],
              tier3Assignments: [tier3Units[1].id],
              workItems: [
                { title: 'Remove unnecessary form fields', description: 'Minimize required information', status: 'Completed', estimatedEffort: 5 },
                { title: 'Implement autofill support', description: 'Add browser autofill', status: 'Completed', estimatedEffort: 8 },
                { title: 'Guest order tracking', description: 'Allow tracking without account', status: 'In Progress', estimatedEffort: 8 },
              ],
            },
          ],
        },
        {
          title: 'Product recommendations engine',
          description: 'Personalized product suggestions',
          targetDate: formatDate(addDays(today, 40)),
          childObjectives: [
            {
              title: 'Recommendation algorithm',
              description: 'Build ML-based recommendation system',
              targetDate: formatDate(addDays(today, 35)),
              assignedUnits: [tier2Units[1].id],
              tier3Assignments: [tier3Units[2].id],
              workItems: [
                { title: 'Collect training data', description: 'Gather historical purchase data', status: 'Completed', estimatedEffort: 8 },
                { title: 'Train recommendation model', description: 'Build collaborative filtering model', status: 'In Progress', estimatedEffort: 21 },
                { title: 'A/B testing framework', description: 'Set up recommendation testing', status: 'Not Started', estimatedEffort: 13 },
              ],
            },
          ],
        },
        {
          title: 'Mobile shopping experience',
          description: 'Optimize for mobile devices',
          targetDate: formatDate(addDays(today, 50)),
          childObjectives: [
            {
              title: 'Mobile-first product pages',
              description: 'Redesign product detail pages for mobile',
              targetDate: formatDate(addDays(today, 45)),
              assignedUnits: [tier2Units[2].id],
              tier3Assignments: [tier3Units[3]?.id || tier3Units[0].id],
              workItems: [
                { title: 'Mobile UI design', description: 'Create mobile-optimized layouts', status: 'Completed', estimatedEffort: 13 },
                { title: 'Image optimization', description: 'Implement responsive images', status: 'Completed', estimatedEffort: 8 },
                { title: 'Mobile product page implementation', description: 'Build mobile product views', status: 'In Progress', estimatedEffort: 13 },
                { title: 'Performance optimization', description: 'Achieve <2s load time', status: 'Not Started', estimatedEffort: 8 },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'DevOps Transformation',
      description: 'Implement modern DevOps practices',
      owner: 'VP Engineering',
      ownerUnit: rootUnit.id,
      ownerTier: 1,
      startDate: formatDate(addDays(today, -50)),
      targetDate: formatDate(addDays(today, 70)),
      budget: 700000,
      status: 'In Progress',
      objectives: [
        {
          title: 'CI/CD pipeline modernization',
          description: 'Implement automated deployment pipelines',
          targetDate: formatDate(addDays(today, 30)),
          childObjectives: [
            {
              title: 'Build automation infrastructure',
              description: 'Set up CI/CD tooling',
              targetDate: formatDate(addDays(today, 25)),
              assignedUnits: [tier2Units[1].id],
              tier3Assignments: [tier3Units[1].id],
              workItems: [
                { title: 'Configure CI server', description: 'Set up Jenkins/GitLab CI', status: 'Completed', estimatedEffort: 8 },
                { title: 'Create build pipelines', description: 'Automate build process', status: 'Completed', estimatedEffort: 13 },
                { title: 'Implement deployment automation', description: 'Automated deploy to environments', status: 'In Progress', estimatedEffort: 13 },
                { title: 'Add automated testing', description: 'Integrate test suites in pipeline', status: 'In Progress', estimatedEffort: 13 },
              ],
            },
          ],
        },
        {
          title: 'Infrastructure as Code',
          description: 'Manage infrastructure through code',
          targetDate: formatDate(addDays(today, 50)),
          childObjectives: [
            {
              title: 'IaC implementation',
              description: 'Implement Terraform/CloudFormation',
              targetDate: formatDate(addDays(today, 45)),
              assignedUnits: [tier2Units[2].id],
              tier3Assignments: [tier3Units[2].id],
              workItems: [
                { title: 'Select IaC tool', description: 'Evaluate Terraform vs alternatives', status: 'Completed', estimatedEffort: 5 },
                { title: 'Define infrastructure modules', description: 'Create reusable IaC modules', status: 'Completed', estimatedEffort: 13 },
                { title: 'Migrate existing infrastructure', description: 'Convert manual configs to code', status: 'In Progress', estimatedEffort: 21 },
                { title: 'Set up state management', description: 'Configure remote state backend', status: 'Not Started', estimatedEffort: 8 },
              ],
            },
          ],
        },
      ],
    },
  ];

  for (const projectData of activeProjects) {
    const { objectives, ...projectFields } = projectData;
    const project = await prisma.project.create({
      data: {
        ...projectFields,
        createdBy: user1.id,
      },
    });

    let tier1Count = 0;
    let tier2Count = 0;
    let workItemCount = 0;

    for (const objData of objectives) {
      const { childObjectives, ...tier1Fields } = objData;
      
      const tier1Objective = await prisma.objective.create({
        data: {
          ...tier1Fields,
          projectId: project.id,
          fromTier: 1,
          createdBy: user1.id,
        },
      });
      tier1Count++;

      if (childObjectives) {
        for (const childData of childObjectives) {
          const { assignedUnits, tier3Assignments, workItems, ...childFields } = childData;
          
          const tier2Objective = await prisma.objective.create({
            data: {
              ...childFields,
              projectId: project.id,
              fromTier: 2,
              parentObjectiveId: tier1Objective.id,
              createdBy: user1.id,
            },
          });
          tier2Count++;

          if (assignedUnits) {
            for (const unitId of assignedUnits) {
              await prisma.objectiveAssignment.create({
                data: { objectiveId: tier2Objective.id, unitId: unitId },
              });
            }
          }
          if (tier3Assignments) {
            for (const tier3UnitId of tier3Assignments) {
              await prisma.objectiveAssignment.create({
                data: { objectiveId: tier2Objective.id, unitId: tier3UnitId },
              });
            }
          }

          if (workItems) {
            for (const workItemData of workItems) {
              await prisma.workItem.create({
                data: {
                  ...workItemData,
                  projectId: project.id,
                  objectiveId: tier2Objective.id,
                  priority: 'Medium',
                  createdBy: user1.id,
                },
              });
              workItemCount++;
            }
          }
        }
      }
    }
    console.log(`  ✓ ${project.title} (${tier1Count} Tier 1, ${tier2Count} Tier 2, ${workItemCount} work items)`);
  }

  console.log('\n✅ Comprehensive seed complete!');
  console.log(`📊 Summary:`);
  console.log(`   • 12 projects across 5 phases`);
  console.log(`   • Early Planning: 3 projects (Tier 1 objectives only)`);
  console.log(`   • Partial Refinement: 3 projects (some Tier 2 objectives)`);
  console.log(`   • Fully Refined: 2 projects (all objectives refined to Tier 2)`);
  console.log(`   • In Execution: 2 projects (with work items)`);
  console.log(`   • Active Progress: 2 projects (work items in various states)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
