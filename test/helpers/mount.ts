import Vue from 'vue';
import VueCompositionAPI from '@vue/composition-api';

Vue.config.productionTip = false;
Vue.config.devtools = false;

Vue.use(VueCompositionAPI);

export function mount(component: Record<string, any>) {
  return new Vue(component).$mount();
}
