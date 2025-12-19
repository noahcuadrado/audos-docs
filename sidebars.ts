import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  apiSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Chat API',
      collapsed: false,
      items: [
        'api/chat/streaming',
        'api/chat/messages',
        'api/chat/instagram-session-init',
        'api/chat/instagram-contact-upsert',
        'api/chat/secure-session-link',
      ],
    },
    {
      type: 'category',
      label: 'Email API',
      collapsed: false,
      items: [
        'api/email/mailgun',
        'api/email/reminders',
        'api/email/reminder-templates',
      ],
    },
    {
      type: 'category',
      label: 'AI API',
      collapsed: false,
      items: [
        'api/ai/document-analysis',
      ],
    },
    {
      type: 'category',
      label: 'Tagging API',
      collapsed: false,
      items: [
        'api/tagging/entity-tags',
        'api/tagging/workspace-tags',
      ],
    },
  ],
  architectureSidebar: [
    {
      type: 'category',
      label: 'Core Concepts',
      collapsed: false,
      items: [
        'architecture/workspace-space-architecture',
        'architecture/claude-agent-architectures',
        'architecture/space-runtime-file-access',
      ],
    },
    {
      type: 'category',
      label: 'Database',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Relationships',
          items: [
            'architecture/database/relationships/contacts-sessions',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Editor Design',
      collapsed: false,
      items: [
        'architecture/editor/section-based-editing',
        'architecture/editor/enhanced-sectioning-design',
      ],
    },
    {
      type: 'category',
      label: 'UI/UX Systems',
      collapsed: false,
      items: [
        'architecture/ui/icon-fallback-system',
      ],
    },
  ],
  integrationsSidebar: [
    {
      type: 'category',
      label: 'Integrations',
      collapsed: false,
      items: [
        'integrations/inventory',
      ],
    },
  ],
  guidesSidebar: [
    {
      type: 'category',
      label: 'Feature Guides',
      collapsed: false,
      items: [
        'guides/deep-link-feature',
        'guides/subdomain-url-resolution',
        'guides/unified-editor-testing',
      ],
    },
  ],
};

export default sidebars;
