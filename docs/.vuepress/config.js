const sidebars = {
  guide: ['', 'client', 'queries']
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
  base: '/vue-gql/',
  title: 'Vue-gql',
  description: 'A small and fast GraphQL client for Vue.js',
  themeConfig: {
    docsDir: 'docs',
    repo: 'baianat/vue-gql',
    nav: [{ text: 'Home', link: '/' }, { text: 'Guide', link: '/guide/' }],
    sidebarDepth: 2,
    sidebar: {
      '/guide/': genSidebarConfig('Guide')
    },
    displayAllHeaders: true // Default: false
  }
};
