export default {
  appURL: process.env.NODE_ENV === 'production' ? 'https://villus.dev' : 'http://localhost:3000',
  algolia: {
    apiKey: '434db5d5d2794ec2818d4665d631a15b',
    appId: '1SMG3JU76L',
    indexName: 'villus',
  },
} as const;
