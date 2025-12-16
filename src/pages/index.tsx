import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {
  MessageSquare,
  Mail,
  Tag,
  Database,
  Send,
  Clock,
  Tags,
  FolderOpen,
  BookOpen,
  Code,
  Layers
} from 'lucide-react';

import styles from './index.module.css';

type DocCardItem = {
  title: string;
  description: string;
  link: string;
  icon: ReactNode;
};

const apiDocs: DocCardItem[] = [
  {
    title: 'Chat Streaming API',
    description: 'Real-time WebSocket streaming for Genesis Space chat with live AI responses.',
    link: '/docs/api/chat/streaming',
    icon: <MessageSquare size={24} />,
  },
  {
    title: 'Message Endpoints',
    description: 'REST API endpoints for sending and managing messages in conversations.',
    link: '/docs/api/chat/messages',
    icon: <Send size={24} />,
  },
  {
    title: 'Mailgun Email API',
    description: 'Email infrastructure with domain management, webhooks, and sending capabilities.',
    link: '/docs/api/email/mailgun',
    icon: <Mail size={24} />,
  },
  {
    title: 'Reminder Templates',
    description: 'Automated reminder system with customizable templates and scheduling.',
    link: '/docs/api/email/reminders',
    icon: <Clock size={24} />,
  },
  {
    title: 'Entity Tagging',
    description: 'Backend tagging system for organizing and categorizing entities.',
    link: '/docs/api/tagging/entity-tags',
    icon: <Tag size={24} />,
  },
  {
    title: 'Workspace Tags',
    description: 'Workspace-level tagging with Postman collection examples.',
    link: '/docs/api/tagging/workspace-tags',
    icon: <FolderOpen size={24} />,
  },
];

const architectureDocs: DocCardItem[] = [
  {
    title: 'Database Relationships',
    description: 'Documentation of funnel_contacts and workspace_sessions relationships.',
    link: '/docs/architecture/database/relationships/contacts-sessions',
    icon: <Database size={24} />,
  },
];

function DocCard({title, description, link, icon}: DocCardItem) {
  return (
    <Link to={link} className={styles.docCard}>
      <div className={styles.docCardIcon}>{icon}</div>
      <div className={styles.docCardContent}>
        <Heading as="h3" className={styles.docCardTitle}>{title}</Heading>
        <p className={styles.docCardDescription}>{description}</p>
      </div>
      <div className={styles.docCardArrow}>→</div>
    </Link>
  );
}

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroBackground}></div>
      <div className="container">
        <div className={styles.heroContent}>
          <Heading as="h1" className={styles.heroTitle}>
            Audos Documentation
          </Heading>
          <p className={styles.heroSubtitle}>
            Complete API reference and architecture documentation for the Audos platform
          </p>
          <div className={styles.heroButtons}>
            <Link
              className={clsx('button button--lg', styles.heroButtonPrimary)}
              to="/docs/intro">
              <BookOpen size={18} />
              Get Started
            </Link>
            <Link
              className={clsx('button button--lg', styles.heroButtonSecondary)}
              to="/docs/api/chat/streaming">
              <Code size={18} />
              API Reference
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function QuickStats() {
  return (
    <section className={styles.statsSection}>
      <div className="container">
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>6</span>
            <span className={styles.statLabel}>API Endpoints</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>3</span>
            <span className={styles.statLabel}>Categories</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>1</span>
            <span className={styles.statLabel}>Architecture Docs</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickNavigation() {
  return (
    <section className={styles.quickNavSection}>
      <div className="container">
        <div className={styles.quickNavGrid}>
          <Link to="/docs/api/chat/streaming" className={styles.quickNavCard}>
            <MessageSquare size={28} className={styles.quickNavIcon} />
            <span className={styles.quickNavLabel}>Chat APIs</span>
          </Link>
          <Link to="/docs/api/email/mailgun" className={styles.quickNavCard}>
            <Mail size={28} className={styles.quickNavIcon} />
            <span className={styles.quickNavLabel}>Email APIs</span>
          </Link>
          <Link to="/docs/api/tagging/entity-tags" className={styles.quickNavCard}>
            <Tags size={28} className={styles.quickNavIcon} />
            <span className={styles.quickNavLabel}>Tagging APIs</span>
          </Link>
          <Link to="/docs/architecture/database/relationships/contacts-sessions" className={styles.quickNavCard}>
            <Layers size={28} className={styles.quickNavIcon} />
            <span className={styles.quickNavLabel}>Architecture</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ApiDocsSection() {
  return (
    <section className={styles.docsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>API Reference</Heading>
          <p className={styles.sectionDescription}>
            Explore our comprehensive API documentation organized by functionality
          </p>
        </div>
        <div className={styles.docsGrid}>
          {apiDocs.map((doc, idx) => (
            <DocCard key={idx} {...doc} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section className={clsx(styles.docsSection, styles.architectureSection)}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>Architecture</Heading>
          <p className={styles.sectionDescription}>
            Deep dive into system design and database relationships
          </p>
        </div>
        <div className={styles.docsGrid}>
          {architectureDocs.map((doc, idx) => (
            <DocCard key={idx} {...doc} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Documentation"
      description="Complete API reference and architecture documentation for the Audos platform">
      <HomepageHeader />
      <main>
        <QuickStats />
        <QuickNavigation />
        <ApiDocsSection />
        <ArchitectureSection />
      </main>
    </Layout>
  );
}
