import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Audos Documentation',
  tagline: 'API Reference & Architecture Documentation',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.audoapps.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config
  organizationName: 'audoapps',
  projectName: 'documentation',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs', // Docs under /docs path
          editUrl: 'https://github.com/audoapps/documentation/tree/main/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Social card image
    image: 'img/docusaurus-social-card.jpg',
    // Color mode configuration
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'Audos',
        src: 'img/audos-logo.svg',
        srcDark: 'img/audos-logo.svg',
      },
      items: [
        {
          to: '/docs/intro',
          label: 'Docs',
          position: 'left',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API Reference',
        },
        {
          type: 'docSidebar',
          sidebarId: 'architectureSidebar',
          position: 'left',
          label: 'Architecture',
        },
        {
          href: 'https://github.com/audoapps/documentation',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Getting Started', to: '/docs/intro' },
            { label: 'API Reference', to: '/docs/api/chat/streaming' },
          ],
        },
        {
          title: 'API Reference',
          items: [
            { label: 'Chat API', to: '/docs/api/chat/streaming' },
            { label: 'Email API', to: '/docs/api/email/mailgun' },
            { label: 'Tagging API', to: '/docs/api/tagging/entity-tags' },
          ],
        },
        {
          title: 'Architecture',
          items: [
            { label: 'Database Relationships', to: '/docs/architecture/database/relationships/contacts-sessions' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: 'https://github.com/audoapps' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Audos. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'sql'],
    },
    // Algolia search (optional - can configure later)
    algolia: undefined,
  } satisfies Preset.ThemeConfig,
};

export default config;
