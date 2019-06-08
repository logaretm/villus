import { mount, createLocalVue } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { withProvider, Query, createClient } from '../src/index';
import App from './App.vue';

const Vue = createLocalVue();
Vue.component('Query', Query);

test('executes queries on mounted', async () => {
  let client = createClient({
    url: 'https://test.baianat.com/graphql'
  });

  const AppWithGQL = withProvider(App, client);

  const wrapper = mount(AppWithGQL, { sync: false, localVue: Vue });
  await flushPromises();
  expect(wrapper.findAll('li').length).toBe(5);
});
