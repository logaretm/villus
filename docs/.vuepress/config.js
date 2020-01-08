const sidebars = {
  guide: ['', 'client', 'queries', 'mutations', 'headers', 'subscriptions', 'using-the-client-manually']
};

function genSidebarConfig(...names) {
  return names.map(t => {
    return {
      title: t,
      collapsable: false,
      children: sidebars[t.toLowerCase()]
    };
  });
}

module.exports = {
  base: '/villus/',
  title: 'Villus',
  description: 'A small and fast GraphQL client for Vue.js',
  themeConfig: {
    docsDir: 'docs',
    repo: 'logaretm/villus',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' }
    ],
    sidebarDepth: 1,
    sidebar: {
      '/guide/': genSidebarConfig('Guide')
    },
    displayAllHeaders: true // Default: false
  }
};
