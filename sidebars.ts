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
      ],
    },
    {
      type: 'category',
      label: 'Email API',
      collapsed: false,
      items: [
        'api/email/mailgun',
        'api/email/reminders',
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
  ],
};

export default sidebars;
