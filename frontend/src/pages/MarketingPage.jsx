import { useNavigate } from 'react-router-dom';
import { Clock, Zap, Users, Target, Calendar, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui';
import styles from './MarketingPage.module.css';

export default function MarketingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap size={32} />,
      title: 'Automated Forecasting',
      description: 'Stop wasting hours on manual forecasting. Our engine automatically calculates delivery dates using Monte Carlo simulations based on your team\'s historical throughput.',
      timeSaved: '15+ hours per week'
    },
    {
      icon: <Users size={32} />,
      title: 'Async Planning Sessions',
      description: 'No more scheduling nightmares. Team members contribute to refinement sessions on their own time, with built-in consensus tracking and decision logging.',
      timeSaved: '10+ hours per week'
    },
    {
      icon: <Target size={32} />,
      title: 'Organizational Alignment',
      description: 'Connect work items to strategic objectives across all organizational units. Visualize how daily work ladders up to company goals.',
      timeSaved: '5+ hours per week'
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Real-time Analytics',
      description: 'Get instant visibility into throughput, cycle time, and capacity. Make data-driven decisions without manual spreadsheet work.',
      timeSaved: '8+ hours per week'
    },
    {
      icon: <Calendar size={32} />,
      title: 'Dynamic Roadmaps',
      description: 'Roadmaps that update automatically as work progresses. See realistic timelines based on actual team velocity, not wishful thinking.',
      timeSaved: '6+ hours per week'
    },
    {
      icon: <CheckCircle size={32} />,
      title: 'Smart Prioritization',
      description: 'Prioritize work based on strategic value, dependencies, and capacity constraints. Let the system recommend the optimal sequence.',
      timeSaved: '4+ hours per week'
    }
  ];

  const benefits = [
    'Eliminate manual forecast calculations',
    'Reduce meeting overhead by 70%',
    'Increase planning accuracy by 3x',
    'Free up 48+ hours per month per manager',
    'Enable truly distributed async collaboration',
    'Connect strategy to execution automatically'
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Stop Planning.
            <br />
            <span className={styles.heroGradient}>Start Delivering.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Pathways automates forecasting and enables async planning, saving your teams 
            <strong> 48+ hours every month</strong> while delivering more accurate roadmaps.
          </p>
          <div className={styles.heroActions}>
            <Button 
              onClick={() => navigate('/login')}
              className={styles.primaryButton}
            >
              Try Demo Now
              <ArrowRight size={20} />
            </Button>
            <a href="#features" className={styles.secondaryButton}>
              Learn More
            </a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>48+</div>
              <div className={styles.statLabel}>Hours Saved/Month</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>70%</div>
              <div className={styles.statLabel}>Fewer Meetings</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>3x</div>
              <div className={styles.statLabel}>More Accurate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className={styles.problem}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>The Planning Problem</h2>
          <p className={styles.problemText}>
            Engineering leaders waste <strong>25-40% of their time</strong> on planning activities:
            manual forecasting calculations, scheduling estimation meetings, updating spreadsheets,
            and creating status reports. Meanwhile, teams struggle to see how their daily work 
            connects to company strategy.
          </p>
          <div className={styles.problemGrid}>
            <div className={styles.problemCard}>
              <Clock size={24} className={styles.problemIcon} />
              <h3>Manual Forecasting</h3>
              <p>Hours spent on spreadsheets calculating dates that are wrong before you finish</p>
            </div>
            <div className={styles.problemCard}>
              <Users size={24} className={styles.problemIcon} />
              <h3>Meeting Overload</h3>
              <p>Endless planning meetings that drain productivity and still miss details</p>
            </div>
            <div className={styles.problemCard}>
              <Target size={24} className={styles.problemIcon} />
              <h3>Strategy Disconnect</h3>
              <p>Teams don't understand how their work connects to organizational objectives</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>
            Automate Planning. Enable Async Collaboration.
          </h2>
          <p className={styles.sectionSubtitle}>
            Pathways combines automated forecasting with async-first planning tools to give 
            you back your time while improving accuracy.
          </p>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
                <div className={styles.featureTimeSaved}>
                  <Clock size={16} />
                  {feature.timeSaved}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefits}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Why Teams Choose Pathways</h2>
          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <div key={index} className={styles.benefitItem}>
                <CheckCircle size={24} className={styles.benefitIcon} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Set Up Your Organization</h3>
              <p>Define your organizational structure, teams, and strategic objectives in minutes.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>Import Work Items</h3>
              <p>Connect your existing work tracking system or manually add projects and tasks.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>Automatic Forecasting</h3>
              <p>Our engine analyzes your throughput and generates probabilistic forecasts automatically.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <h3>Async Refinement</h3>
              <p>Team members refine estimates and priorities on their own schedule with full transparency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Save 48+ Hours Every Month?</h2>
          <p className={styles.ctaSubtitle}>
            Try our fully-featured demo and see how Pathways transforms planning from a 
            time-sink into a strategic advantage.
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className={styles.ctaButton}
          >
            Launch Demo
            <ArrowRight size={20} />
          </Button>
          <p className={styles.ctaNote}>
            Demo includes sample data • No credit card required • Full feature access
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h3>Pathways</h3>
            <p>Automated planning for modern engineering teams</p>
          </div>
          <div className={styles.footerLinks}>
            <a href="#features">Features</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Demo</a>
            <a href="https://synapsesolves.com" target="_blank" rel="noopener noreferrer">
              By Synapse Solves
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2026 Synapse Solves. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
