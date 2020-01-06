// @ts-ignore
import * as stuff from 'vue/dist/vue.global.js';

export function mount(component: Record<string, any>) {
  const app = stuff.createApp();
  app.config.devtools = false;
  document.body.innerHTML = `<div id="app"></div>`;

  return app.mount(component, '#app');
}
