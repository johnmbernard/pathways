/**
 * Database Seed Script - Main Entry Point
 * 
 * This script populates the database with comprehensive test data:
 * - Large organizational structure (3 tiers, 50+ units)
 * - 12 projects across refinement lifecycle phases
 * - Tier 1 objectives with Tier 2 refined objectives
 * - Work items created by Tier 3 leaf units
 * - Realistic capacity data for forecasting
 * - Demo users with hashed passwords
 * 
 * Run with: npm run seed
 */

import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Utility functions for generating realistic data
const workItemTitles = {
  Story: [
    'Implement user authentication flow',
    'Add real-time notifications',
    'Create dashboard analytics view',
    'Build mobile responsive layout',
    'Integrate third-party API',
    'Add data export functionality',
    'Implement search with filters',
    'Create admin panel interface',
    'Add multi-language support',
    'Build reporting module',
  ],
  Task: [
    'Update database schema',
    'Refactor legacy code module',
    'Write API documentation',
    'Set up CI/CD pipeline',
    'Configure monitoring alerts',
    'Optimize database queries',
    'Update dependencies',
    'Create unit tests',
    'Deploy to staging environment',
    'Perform security audit',
  ],
  Bug: [
    'Fix login redirect issue',
    'Resolve memory leak in background process',
    'Correct timezone calculation bug',
    'Fix broken pagination on mobile',
    'Resolve API timeout errors',
    'Fix data validation issues',
    'Correct calculation errors in reports',
    'Fix race condition in async code',
    'Resolve CORS issues',
    'Fix broken links in navigation',
  ],
};

const priorities = ['P1', 'P2', 'P3'];
const statuses = ['Backlog', 'Ready', 'In Progress', 'Done'];

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateWorkItemTitle(type) {
  const titles = workItemTitles[type];
  return randomChoice(titles);
}

async function main() {
  console.log('🌱 Starting large-scale database seed...');

  // Clear existing data (in reverse order of dependencies)
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
  await prisma.organizationalUnit.deleteMany();
  await prisma.user.deleteMany();

  // Create large organizational structure
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

  // Tier 2 - Departments (10 major departments)
  const tier2Units = [];
  const tier2Names = [
    'Operations C2',
    'Wing C2', 
    'Security',
    'Application Dev',
    'Infrastructure',
    'Data & Analytics',
    'Platform Engineering',
    'DevSecOps',
    'Cloud Services',
    'Enterprise Systems'
  ];

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

  // Tier 3 - Teams (4-6 teams per department = ~50 teams)
  const tier3Units = [];
  const tier3TeamNames = [
    'Alpha Team',
    'Bravo Team',
    'Charlie Team',
    'Delta Team',
    'Echo Team',
    'Foxtrot Team',
  ];

  for (const tier2Unit of tier2Units) {
    const teamCount = 4 + Math.floor(Math.random() * 3); // 4-6 teams
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

  console.log(`✅ Created organizational structure: ${tier2Units.length} departments, ${tier3Units.length} teams`);

  // Hash password for all demo users
  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Create users
  console.log('👥 Creating users...');
  
  // Tier 1 leader
  const tier1User = await prisma.user.create({
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
  const tier2Users = [];
  for (let i = 0; i < tier2Units.length; i++) {
    const user = await prisma.user.create({
      data: {
        id: `user-2-${i + 1}`,
        email: `dept${i + 1}.lead@pathways.dev`,
        password: hashedPassword,
        name: `${tier2Units[i].name} Director`,
        organizationalUnit: tier2Units[i].id,
        role: 'Department Lead',
      },
    });
    tier2Users.push(user);
  }

  // Tier 3 team leads (one per team)
  const tier3Users = [];
  for (let i = 0; i < tier3Units.length; i++) {
    const user = await prisma.user.create({
      data: {
        id: `user-3-${i + 1}`,
        email: `team${i + 1}.lead@pathways.dev`,
        password: hashedPassword,
        name: `${tier3Units[i].name} Lead`,
        organizationalUnit: tier3Units[i].id,
        role: 'Team Lead',
      },
    });
    tier3Users.push(user);
  }

  console.log(`✅ Created ${tier2Users.length + tier3Users.length + 1} users`);

  // Create projects
  console.log('📁 Creating projects...');
  
  const projects = [];
  const projectNames = [
    'Digital Modernization Initiative',
    'Cloud Migration Phase 2',
    'Security Compliance Upgrade',
    'Customer Portal Redesign',
    'Data Platform Consolidation',
    'API Gateway Implementation',
    'Zero Trust Architecture',
    'AI/ML Platform Development',
  ];

  for (let i = 0; i < projectNames.length; i++) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1); // Started last month
    
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 3 + i); // Stagger target dates
    
    const project = await prisma.project.create({
      data: {
        id: `proj-${i + 1}`,
        title: projectNames[i],
        description: `Strategic initiative to improve organizational capabilities through ${projectNames[i].toLowerCase()}`,
        status: i < 4 ? 'In Progress' : 'Planning',
        startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
        targetDate: targetDate.toISOString().split('T')[0],
        budget: 50000 + (i * 25000), // Varying budgets
        ownerUnit: kesselRun.id,
        createdBy: tier1User.id,
        ownerTier: 1,
      },
    });
    projects.push(project);
  }

  console.log(`✅ Created ${projects.length} projects`);

  // Create work items distributed across teams with historical throughput
  console.log('📋 Creating work items and throughput history...');
  
  let workItemCount = 0;
  let completedItemCount = 0;
  const currentWorkItemsPerTeam = 12; // Current backlog items per team
  const completedItemsPerWeek = 8; // Avg items completed per team per week
  const weeksOfHistory = 8; // 8 weeks of historical data
  
  const throughputByTeam = new Map(); // Track weekly throughput for each team

  for (const team of tier3Units) {
    const teamLead = tier3Users.find(u => u.organizationalUnit === team.id);
    
    // Create COMPLETED work items for last 8 weeks (for throughput calculation)
    for (let weekAgo = weeksOfHistory; weekAgo > 0; weekAgo--) {
      const itemsThisWeek = completedItemsPerWeek + Math.floor(Math.random() * 5) - 2; // 6-10 items
      
      for (let i = 0; i < itemsThisWeek; i++) {
        const type = randomChoice(['Story', 'Task', 'Bug']);
        const project = randomChoice(projects);
        
        // Completion date spread across the week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (weekAgo * 7));
        const daysIntoWeek = Math.floor(Math.random() * 7);
        const completedDate = new Date(weekStart);
        completedDate.setDate(completedDate.getDate() + daysIntoWeek);
        
        // Created 1-2 weeks before completion
        const createdDate = new Date(completedDate);
        createdDate.setDate(createdDate.getDate() - (7 + Math.floor(Math.random() * 7)));
        
        await prisma.workItem.create({
          data: {
            id: `work-${team.id}-completed-${weekAgo}-${i + 1}`,
            title: `${generateWorkItemTitle(type)} - ${team.name}`,
            description: `Completed work item for ${project.title}`,
            type: type,
            priority: randomChoice(priorities),
            stackRank: i,
            status: 'Done',
            assignedOrgUnit: team.id,
            createdBy: teamLead.id,
            createdAt: createdDate,
            completedAt: completedDate,
            refinementSessionId: null,
          },
        });
        
        completedItemCount++;
      }
      
      // Track throughput for this week
      const weekKey = `${team.id}-${weekAgo}`;
      throughputByTeam.set(weekKey, itemsThisWeek);
    }
    
    // Create CURRENT backlog items (not yet completed)
    let stackRankCounter = 0;
    for (const priority of priorities) {
      const itemsInPriority = Math.floor(currentWorkItemsPerTeam / 3) + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < itemsInPriority; i++) {
        const type = randomChoice(['Story', 'Task', 'Bug']);
        const project = randomChoice(projects);
        
        await prisma.workItem.create({
          data: {
            id: `work-${team.id}-backlog-${priority}-${i + 1}`,
            title: `${generateWorkItemTitle(type)} - ${team.name}`,
            description: `Current backlog item for ${project.title}`,
            type: type,
            priority: priority,
            stackRank: stackRankCounter++,
            status: randomChoice(['Backlog', 'Ready', 'In Progress']),
            assignedOrgUnit: team.id,
            createdBy: teamLead.id,
            refinementSessionId: null,
          },
        });
        
        workItemCount++;
      }
    }
  }

  console.log(`✅ Created ${completedItemCount} completed work items (historical)`);
  console.log(`✅ Created ${workItemCount} current backlog items`);
  
  // Create TeamThroughput records from the completed items
  console.log('📊 Calculating team throughput...');
  
  let throughputRecordCount = 0;
  for (const team of tier3Units) {
    for (let weekAgo = weeksOfHistory; weekAgo > 0; weekAgo--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (weekAgo * 7));
      // Set to Monday of that week
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekKey = `${team.id}-${weekAgo}`;
      const itemsCompleted = throughputByTeam.get(weekKey) || 0;
      
      await prisma.teamThroughput.create({
        data: {
          teamId: team.id,
          weekStartDate: weekStart,
          itemsCompleted: itemsCompleted,
        },
      });
      
      throughputRecordCount++;
    }
  }
  
  console.log(`✅ Created ${throughputRecordCount} throughput records`);

  // Create some objectives for active projects
  console.log('🎯 Creating objectives...');
  
  let objectiveCount = 0;
  for (const project of projects.slice(0, 4)) { // First 4 active projects
    // Create 2-3 objectives per project
    const numObjectives = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < numObjectives; i++) {
      const baseDate = new Date(project.targetDate);
      baseDate.setMonth(baseDate.getMonth() - (numObjectives - i)); // Earlier objectives first
      const targetDate = baseDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
      
      // Assign to 2-3 random tier 2 departments
      const assignedDepts = tier2Units
        .sort(() => 0.5 - Math.random())
        .slice(0, 2 + Math.floor(Math.random() * 2));
      
      const objective = await prisma.objective.create({
        data: {
          id: `obj-${project.id}-${i + 1}`,
          title: `${project.title} - Phase ${i + 1}`,
          description: `Deliver phase ${i + 1} capabilities`,
          targetDate: targetDate,
          projectId: project.id,
          fromTier: 1,
          createdBy: tier1User.id,
          assignedUnits: {
            create: assignedDepts.map(dept => ({
              unitId: dept.id,
            })),
          },
        },
      });
      
      // Create ONE collaborative refinement session for this objective
      // All assigned departments work in the same session
      await prisma.refinementSession.create({
        data: {
          id: `session-${objective.id}`,
          status: 'in-progress',
          objectiveId: objective.id,
          projectId: project.id,
          createdBy: tier1User.id,
        },
      });
      
      objectiveCount++;
    }
  }

  console.log(`✅ Created ${objectiveCount} objectives with refinement sessions`);
  
  // ===== STEP 5: Run comprehensive project seed =====
  console.log('');
  console.log('📦 Running comprehensive project seed...');
  
  // Run the comprehensive seed file
  const comprehensiveSeedPath = join(__dirname, 'seedComprehensive.js');
  
  await new Promise((resolve, reject) => {
    const child = spawn('node', [comprehensiveSeedPath], {
      stdio: 'inherit',
      cwd: dirname(__dirname),
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Comprehensive seed failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
  
  console.log('');
  console.log('📊 Final Summary:');
  console.log(`   - ${await prisma.organizationalUnit.count()} organizational units (1 root + ${tier2Units.length} depts + ${tier3Units.length} teams)`);
  console.log(`   - ${await prisma.user.count()} users`);
  console.log(`   - ${await prisma.project.count()} projects`);
  console.log(`   - ${await prisma.objective.count()} objectives`);
  console.log(`   - ${await prisma.workItem.count()} work items`);
  console.log(`   - ${await prisma.refinementSession.count()} refinement sessions`);
  console.log('');
  console.log('🎉 Large-scale database seeded successfully!');
  console.log('');
  console.log('👤 Sample Login Accounts (all passwords: demo123):');
  console.log('   - kessel.lead@pathways.dev (Tier 1 - Org Leader)');
  console.log('   - dept1.lead@pathways.dev (Tier 2 - Department Lead)');
  console.log('   - team1.lead@pathways.dev (Tier 3 - Team Lead)');
  console.log('   - team2.lead@pathways.dev (Tier 3 - Team Lead)');
  console.log('   ... and many more team leads');
  console.log('');
  console.log('💡 Data Overview:');
  console.log('   - 12 projects across 5 refinement phases');
  console.log('   - Tier 1 objectives with Tier 2 refined objectives');
  console.log('   - Work items created by Tier 3 leaf units');
  console.log('   - Active refinement sessions ready for testing');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
