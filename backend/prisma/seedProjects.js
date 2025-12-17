/**
 * Project Seed Script - Comprehensive Test Data
 * 
 * Creates 15 projects in various stages:
 * - Early planning (objectives not assigned)
 * - Active refinement (some sessions completed)
 * - Ready for work (work items in team backlogs)
 * - In progress (some items completed)
 * - At risk (behind schedule)
 * 
 * Run with: node prisma/seedProjects.js
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
  console.log('🚀 Seeding 15 comprehensive projects...');

  // Get users and org units
  const users = await prisma.user.findMany();
  const opsC1 = users[0]; // Use first user
  const opsC2 = users[1] || users[0]; // Use second user or fallback to first
  
  const tier2Units = await prisma.organizationalUnit.findMany({ where: { tier: 2 } });
  const tier3Units = await prisma.organizationalUnit.findMany({ where: { tier: 3 } });

  const today = new Date();

  const projects = [
    // === EARLY PLANNING PROJECTS (1-3) ===
    {
      title: 'Cloud Migration Initiative',
      description: 'Migrate legacy systems to cloud infrastructure',
      owner: 'CTO',
      ownerUnit: tier2Units[0].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, 7)),
      targetDate: formatDate(addDays(today, 180)),
      budget: 500000,
      notes: 'High priority strategic initiative',
      createdBy: opsC1.id,
      objectives: [
        {
          title: 'Assess current infrastructure',
          description: 'Complete audit of existing systems',
          targetDate: formatDate(addDays(today, 30)),
          fromTier: 1,
        },
        {
          title: 'Select cloud provider',
          description: 'Evaluate AWS, Azure, and GCP',
          targetDate: formatDate(addDays(today, 45)),
          fromTier: 1,
        },
      ],
    },
    {
      title: 'Customer Portal Redesign',
      description: 'Modernize customer-facing portal with new UX',
      owner: 'VP Product',
      ownerUnit: tier2Units[1].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, 14)),
      targetDate: formatDate(addDays(today, 120)),
      budget: 250000,
      createdBy: opsC2.id,
      objectives: [
        {
          title: 'Conduct user research',
          description: 'Interview customers and analyze feedback',
          targetDate: formatDate(addDays(today, 30)),
          fromTier: 1,
        },
      ],
    },
    {
      title: 'Security Compliance Upgrade',
      description: 'Achieve SOC 2 Type II certification',
      owner: 'CISO',
      ownerUnit: tier2Units[2].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, 0)),
      targetDate: formatDate(addDays(today, 150)),
      budget: 180000,
      createdBy: opsC1.id,
      objectives: [
        {
          title: 'Gap analysis',
          description: 'Identify current compliance gaps',
          targetDate: formatDate(addDays(today, 21)),
          fromTier: 1,
        },
      ],
    },

    // === ACTIVE REFINEMENT PROJECTS (4-7) ===
    {
      title: 'Mobile App v2.0',
      description: 'Complete rewrite of mobile applications',
      owner: 'Head of Mobile',
      ownerUnit: tier2Units[3].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, -30)),
      targetDate: formatDate(addDays(today, 90)),
      budget: 400000,
      createdBy: opsC2.id,
      objectives: [
        {
          title: 'Design new architecture',
          description: 'Create scalable mobile architecture',
          targetDate: formatDate(addDays(today, 15)),
          fromTier: 1,
          assignedUnits: [tier2Units[3].id],
          refinementStatus: 'in-progress',
        },
        {
          title: 'Implement core features',
          description: 'Build authentication, navigation, offline mode',
          targetDate: formatDate(addDays(today, 60)),
          fromTier: 1,
        },
      ],
    },
    {
      title: 'API Gateway Modernization',
      description: 'Replace legacy API layer with modern gateway',
      owner: 'VP Engineering',
      ownerUnit: tier2Units[0].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, -45)),
      targetDate: formatDate(addDays(today, 75)),
      budget: 320000,
      createdBy: opsC1.id,
      objectives: [
        {
          title: 'Build gateway infrastructure',
          description: 'Set up Kong API Gateway',
          targetDate: formatDate(addDays(today, 30)),
          fromTier: 1,
          assignedUnits: [tier2Units[0].id],
          refinementStatus: 'in-progress',
          childObjectives: [
            {
              title: 'Configure rate limiting',
              targetDate: formatDate(addDays(today, 15)),
              assignedUnits: tier3Units.slice(0, 2).map(u => u.id),
              refinementStatus: 'completed',
              generateWorkItems: true,
            },
            {
              title: 'Setup authentication plugins',
              targetDate: formatDate(addDays(today, 20)),
              assignedUnits: tier3Units.slice(2, 4).map(u => u.id),
              refinementStatus: 'in-progress',
              generateWorkItems: false,
            },
          ],
        },
      ],
    },
    {
      title: 'Data Analytics Platform',
      description: 'Build real-time analytics dashboard',
      owner: 'Chief Data Officer',
      ownerUnit: tier2Units[1].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, -60)),
      targetDate: formatDate(addDays(today, 60)),
      budget: 450000,
      createdBy: opsC2.id,
      objectives: [
        {
          title: 'Data pipeline infrastructure',
          description: 'Build ETL pipelines',
          targetDate: formatDate(addDays(today, 30)),
          fromTier: 1,
          assignedUnits: [tier2Units[1].id],
          refinementStatus: 'completed',
          childObjectives: [
            {
              title: 'Implement data ingestion',
              targetDate: formatDate(addDays(today, 15)),
              assignedUnits: tier3Units.slice(4, 6).map(u => u.id),
              refinementStatus: 'completed',
              generateWorkItems: true,
            },
            {
              title: 'Build transformation layer',
              targetDate: formatDate(addDays(today, 25)),
              assignedUnits: tier3Units.slice(6, 8).map(u => u.id),
              refinementStatus: 'completed',
              generateWorkItems: true,
            },
          ],
        },
        {
          title: 'Visualization dashboard',
          description: 'Create interactive dashboards',
          targetDate: formatDate(addDays(today, 50)),
          fromTier: 1,
        },
      ],
    },
    {
      title: 'Payment System Upgrade',
      description: 'Modernize payment processing',
      owner: 'CFO',
      ownerUnit: tier2Units[2].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, -50)),
      targetDate: formatDate(addDays(today, 70)),
      budget: 380000,
      createdBy: opsC1.id,
      objectives: [
        {
          title: 'Integrate new payment gateway',
          description: 'Add Stripe and PayPal support',
          targetDate: formatDate(addDays(today, 40)),
          fromTier: 1,
          assignedUnits: [tier2Units[2].id],
          refinementStatus: 'in-progress',
          childObjectives: [
            {
              title: 'Stripe integration',
              targetDate: formatDate(addDays(today, 25)),
              assignedUnits: tier3Units.slice(8, 10).map(u => u.id),
              refinementStatus: 'completed',
              generateWorkItems: true,
            },
          ],
        },
      ],
    },

    // === READY FOR WORK PROJECTS (8-11) ===
    {
      title: 'DevOps Automation Suite',
      description: 'Automate deployment and monitoring',
      owner: 'VP Infrastructure',
      ownerUnit: tier2Units[3].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, -70)),
      targetDate: formatDate(addDays(today, 50)),
      budget: 290000,
      createdBy: opsC2.id,
      objectives: [
        {
          title: 'CI/CD pipeline',
          description: 'Automated testing and deployment',
          targetDate: formatDate(addDays(today, 25)),
          fromTier: 1,
          assignedUnits: [tier2Units[3].id],
          refinementStatus: 'completed',
          childObjectives: [
            {
              title: 'Setup Jenkins pipelines',
              targetDate: formatDate(addDays(today, 15)),
              assignedUnits: [tier3Units[0].id, tier3Units[1].id],
              refinementStatus: 'completed',
              generateWorkItems: true,
              workItemsConfig: { p1: 3, p2: 5, completed: 2 },
            },
            {
              title: 'Implement automated testing',
              targetDate: formatDate(addDays(today, 20)),
              assignedUnits: [tier3Units[2].id, tier3Units[3].id],
              refinementStatus: 'completed',
              generateWorkItems: true,
              workItemsConfig: { p1: 4, p2: 6, completed: 3 },
            },
          ],
        },
        {
          title: 'Monitoring and alerting',
          description: 'Real-time system monitoring',
          targetDate: formatDate(addDays(today, 45)),
          fromTier: 1,
        },
      ],
    },
    {
      title: 'ML Recommendation Engine',
      description: 'Build ML-powered product recommendations',
      owner: 'Head of AI',
      ownerUnit: tier2Units[4].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, -55)),
      targetDate: formatDate(addDays(today, 65)),
      budget: 520000,
      createdBy: opsC1.id,
      objectives: [
        {
          title: 'Data preparation',
          description: 'Clean and prepare training data',
          targetDate: formatDate(addDays(today, 20)),
          fromTier: 1,
          assignedUnits: [tier2Units[4].id],
          refinementStatus: 'completed',
          childObjectives: [
            {
              title: 'Feature engineering',
              targetDate: formatDate(addDays(today, 12)),
              assignedUnits: [tier3Units[4].id],
              refinementStatus: 'completed',
              generateWorkItems: true,
              workItemsConfig: { p1: 2, p2: 4, completed: 1 },
            },
          ],
        },
        {
          title: 'Model training',
          description: 'Train and validate ML models',
          targetDate: formatDate(addDays(today, 50)),
          fromTier: 1,
          assignedUnits: [tier2Units[4].id],
          refinementStatus: 'completed',
          childObjectives: [
            {
              title: 'Train collaborative filtering model',
              targetDate: formatDate(addDays(today, 35)),
              assignedUnits: [tier3Units[5].id, tier3Units[6].id],
              refinementStatus: 'completed',
              generateWorkItems: true,
              workItemsConfig: { p1: 5, p2: 7, completed: 4 },
            },
          ],
        },
      ],
    },
    {
      title: 'Microservices Migration',
      description: 'Break monolith into microservices',
      owner: 'Chief Architect',
      ownerUnit: tier2Units[0].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, -80)),
      targetDate: formatDate(addDays(today, 40)),
      budget: 600000,
      createdBy: opsC2.id,
      objectives: [
        {
          title: 'Extract user service',
          description: 'Separate user management into microservice',
          targetDate: formatDate(addDays(today, 20)),
          fromTier: 1,
          assignedUnits: [tier2Units[0].id],
          refinementStatus: 'completed',
          childObjectives: [
            {
              title: 'Implement user API',
              targetDate: formatDate(addDays(today, 10)),
              assignedUnits: [tier3Units[7].id, tier3Units[8].id],
              refinementStatus: 'completed',
              generateWorkItems: true,
              workItemsConfig: { p1: 6, p2: 8, completed: 5 },
            },
            {
              title: 'Migrate user data',
              targetDate: formatDate(addDays(today, 18)),
              assignedUnits: [tier3Units[9].id],
              refinementStatus: 'completed',
              generateWorkItems: true,
              workItemsConfig: { p1: 4, p2: 5, completed: 3 },
            },
          ],
        },
      ],
    },
    {
      title: 'Real-time Messaging Platform',
      description: 'Build WebSocket-based messaging system',
      owner: 'Product Manager',
      ownerUnit: tier2Units[1].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, -65)),
      targetDate: formatDate(addDays(today, 55)),
      budget: 340000,
      createdBy: opsC1.id,
      objectives: [
        {
          title: 'WebSocket infrastructure',
          description: 'Build scalable WebSocket server',
          targetDate: formatDate(addDays(today, 30)),
          fromTier: 1,
          assignedUnits: [tier2Units[1].id],
          refinementStatus: 'completed',
          childObjectives: [
            {
              title: 'Setup Socket.io cluster',
              targetDate: formatDate(addDays(today, 18)),
              assignedUnits: tier3Units.slice(0, 3).map(u => u.id),
              refinementStatus: 'completed',
              generateWorkItems: true,
              workItemsConfig: { p1: 3, p2: 6, completed: 2 },
            },
          ],
        },
      ],
    },

    // === AT RISK / BEHIND SCHEDULE PROJECTS (12-13) ===
    {
      title: 'Legacy System Retirement',
      description: 'Decommission old ERP system',
      owner: 'COO',
      ownerUnit: tier2Units[2].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, -100)),
      targetDate: formatDate(addDays(today, 10)), // Very soon!
      budget: 280000,
      createdBy: opsC2.id,
      objectives: [
        {
          title: 'Data migration',
          description: 'Migrate all data to new system',
          targetDate: formatDate(addDays(today, 5)),
          fromTier: 1,
          assignedUnits: [tier2Units[2].id],
          refinementStatus: 'completed',
          childObjectives: [
            {
              title: 'Export legacy data',
              targetDate: formatDate(addDays(today, 3)),
              assignedUnits: [tier3Units[1].id, tier3Units[2].id],
              refinementStatus: 'completed',
              generateWorkItems: true,
              workItemsConfig: { p1: 8, p2: 3, completed: 6 }, // Heavy P1 load
            },
          ],
        },
      ],
    },
    {
      title: 'Regulatory Reporting Automation',
      description: 'Automate quarterly compliance reports',
      owner: 'Head of Compliance',
      ownerUnit: tier2Units[3].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, -85)),
      targetDate: formatDate(addDays(today, 15)),
      budget: 190000,
      createdBy: opsC1.id,
      objectives: [
        {
          title: 'Build reporting engine',
          description: 'Automated data aggregation and reports',
          targetDate: formatDate(addDays(today, 10)),
          fromTier: 1,
          assignedUnits: [tier2Units[3].id],
          refinementStatus: 'completed',
          childObjectives: [
            {
              title: 'Data collection module',
              targetDate: formatDate(addDays(today, 8)),
              assignedUnits: [tier3Units[3].id, tier3Units[4].id],
              refinementStatus: 'completed',
              generateWorkItems: true,
              workItemsConfig: { p1: 7, p2: 4, completed: 5 },
            },
          ],
        },
      ],
    },

    // === COMPLETED PROJECTS (14-15) ===
    {
      title: 'Email Service Migration',
      description: 'Migrated to SendGrid',
      owner: 'VP Engineering',
      ownerUnit: tier2Units[4].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, -120)),
      targetDate: formatDate(addDays(today, -10)),
      budget: 85000,
      createdBy: opsC2.id,
      objectives: [
        {
          title: 'SendGrid integration',
          description: 'Replace custom email service',
          targetDate: formatDate(addDays(today, -15)),
          fromTier: 1,
          assignedUnits: [tier2Units[4].id],
          refinementStatus: 'completed',
          childObjectives: [
            {
              title: 'Implement SendGrid API',
              targetDate: formatDate(addDays(today, -20)),
              assignedUnits: [tier3Units[5].id],
              refinementStatus: 'completed',
              generateWorkItems: true,
              workItemsConfig: { p1: 0, p2: 0, p3: 0, completed: 8 },
            },
          ],
        },
      ],
    },
    {
      title: 'User Onboarding Flow',
      description: 'Improved new user experience',
      owner: 'Head of UX',
      ownerUnit: tier2Units[0].id,
      ownerTier: 2,
      startDate: formatDate(addDays(today, -90)),
      targetDate: formatDate(addDays(today, -5)),
      budget: 120000,
      createdBy: opsC1.id,
      objectives: [
        {
          title: 'Interactive tutorial',
          description: 'Build step-by-step onboarding',
          targetDate: formatDate(addDays(today, -10)),
          fromTier: 1,
          assignedUnits: [tier2Units[0].id],
          refinementStatus: 'completed',
          childObjectives: [
            {
              title: 'Tutorial UI components',
              targetDate: formatDate(addDays(today, -15)),
              assignedUnits: [tier3Units[6].id, tier3Units[7].id],
              refinementStatus: 'completed',
              generateWorkItems: true,
              workItemsConfig: { p1: 0, p2: 0, p3: 0, completed: 12 },
            },
          ],
        },
      ],
    },
  ];

  // Create projects with objectives and work items
  for (const projectData of projects) {
    console.log(`\n📋 Creating project: ${projectData.title}`);
    
    const { objectives, ...projectFields } = projectData;
    
    const project = await prisma.project.create({
      data: projectFields,
    });

    if (objectives && objectives.length > 0) {
      for (const objData of objectives) {
        const { childObjectives, assignedUnits, refinementStatus, generateWorkItems, workItemsConfig, ...objFields } = objData;
        
        // Create parent objective
        const objective = await prisma.objective.create({
          data: {
            ...objFields,
            projectId: project.id,
            createdBy: project.createdBy,
          },
        });

        // Assign to units if specified
        if (assignedUnits && assignedUnits.length > 0) {
          for (const unitId of assignedUnits) {
            await prisma.objectiveAssignment.create({
              data: {
                objectiveId: objective.id,
                unitId: unitId,
              },
            });
          }
        }

        // Create refinement session if needed
        if (refinementStatus) {
          const session = await prisma.refinementSession.create({
            data: {
              projectId: project.id,
              objectiveId: objective.id,
              createdBy: project.createdBy,
              completedAt: refinementStatus === 'completed' ? new Date() : null,
            },
          });

          console.log(`  ✓ Created refinement session: ${refinementStatus}`);
        }

        // Create child objectives
        if (childObjectives && childObjectives.length > 0) {
          for (const childData of childObjectives) {
            const { assignedUnits: childUnits, refinementStatus: childRefStatus, generateWorkItems: genItems, workItemsConfig: itemsConfig, ...childFields } = childData;
            
            const childObjective = await prisma.objective.create({
              data: {
                ...childFields,
                description: childFields.description || `Child objective for ${objective.title}`,
                projectId: project.id,
                parentObjectiveId: objective.id,
                fromTier: objective.fromTier + 1,
                createdBy: project.createdBy,
              },
            });

            // Assign child objective to units
            if (childUnits && childUnits.length > 0) {
              for (const unitId of childUnits) {
                await prisma.objectiveAssignment.create({
                  data: {
                    objectiveId: childObjective.id,
                    unitId: unitId,
                  },
                });
              }
            }

            // Create refinement session for child
            if (childRefStatus) {
              const childSession = await prisma.refinementSession.create({
                data: {
                  projectId: project.id,
                  objectiveId: childObjective.id,
                  createdBy: project.createdBy,
                  completedAt: childRefStatus === 'completed' ? new Date() : null,
                },
              });

              // Mark units as complete if session is completed
              if (childRefStatus === 'completed' && childUnits) {
                for (const unitId of childUnits) {
                  await prisma.refinementUnitCompletion.create({
                    data: {
                      refinementSessionId: childSession.id,
                      unitId: unitId,
                      completedBy: project.createdBy,
                    },
                  });
                }
              }

              // Generate work items if requested
              if (genItems && childUnits) {
                const config = itemsConfig || { p1: 3, p2: 5, p3: 0, completed: 0 };
                
                const workItemTypes = ['Story', 'Task', 'Bug'];
                const workItemTitles = {
                  Story: ['Implement feature', 'Build component', 'Create interface', 'Add functionality', 'Develop module'],
                  Task: ['Update configuration', 'Refactor code', 'Write tests', 'Update documentation', 'Deploy changes'],
                  Bug: ['Fix issue', 'Resolve error', 'Correct behavior', 'Fix validation', 'Resolve timeout'],
                };

                let stackRank = 0;
                
                // Create P1 items
                for (let i = 0; i < config.p1; i++) {
                  const type = workItemTypes[i % workItemTypes.length];
                  const unit = childUnits[i % childUnits.length];
                  await prisma.workItem.create({
                    data: {
                      refinementSessionId: childSession.id,
                      title: `${workItemTitles[type][i % workItemTitles[type].length]} - ${childObjective.title}`,
                      description: `P1 ${type} for ${childObjective.title}`,
                      type,
                      priority: 'P1',
                      stackRank: stackRank++,
                      assignedOrgUnit: unit,
                      createdBy: project.createdBy,
                    },
                  });
                }

                // Create P2 items
                for (let i = 0; i < config.p2; i++) {
                  const type = workItemTypes[i % workItemTypes.length];
                  const unit = childUnits[i % childUnits.length];
                  await prisma.workItem.create({
                    data: {
                      refinementSessionId: childSession.id,
                      title: `${workItemTitles[type][i % workItemTitles[type].length]} - ${childObjective.title}`,
                      description: `P2 ${type} for ${childObjective.title}`,
                      type,
                      priority: 'P2',
                      stackRank: stackRank++,
                      assignedOrgUnit: unit,
                      createdBy: project.createdBy,
                    },
                  });
                }

                // Create P3 items
                if (config.p3) {
                  for (let i = 0; i < config.p3; i++) {
                    const type = workItemTypes[i % workItemTypes.length];
                    const unit = childUnits[i % childUnits.length];
                    await prisma.workItem.create({
                      data: {
                        refinementSessionId: childSession.id,
                        title: `${workItemTitles[type][i % workItemTitles[type].length]} - ${childObjective.title}`,
                        description: `P3 ${type} for ${childObjective.title}`,
                        type,
                        priority: 'P3',
                        stackRank: stackRank++,
                        assignedOrgUnit: unit,
                        createdBy: project.createdBy,
                      },
                    });
                  }
                }

                // Create completed items
                if (config.completed) {
                  for (let i = 0; i < config.completed; i++) {
                    const type = workItemTypes[i % workItemTypes.length];
                    const unit = childUnits[i % childUnits.length];
                    await prisma.workItem.create({
                      data: {
                        refinementSessionId: childSession.id,
                        title: `${workItemTitles[type][i % workItemTitles[type].length]} - ${childObjective.title}`,
                        description: `Completed ${type} for ${childObjective.title}`,
                        type,
                        priority: 'P1',
                        stackRank: stackRank++,
                        assignedOrgUnit: unit,
                        createdBy: project.createdBy,
                        completedAt: addDays(today, -Math.floor(Math.random() * 30)),
                      },
                    });
                  }
                }

                console.log(`  ✓ Created ${config.p1 + config.p2 + (config.p3 || 0) + (config.completed || 0)} work items for ${childObjective.title}`);
              }
            }
          }
        }
      }
    }

    console.log(`✓ Completed: ${project.title}`);
  }

  console.log('\n✅ Project seeding complete!');
  console.log(`📊 Created ${projects.length} projects with objectives, refinements, and work items`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding projects:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
