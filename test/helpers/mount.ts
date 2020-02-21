import { createApp, compile } from 'vue';

export function mount(component: any) {
  const compiled = { ...component };
  compiled.render = compile(component.template);
  delete compiled.template;
  const app = createApp(compiled);
  app.config.devtools = false;
  app.config.warnHandler = () => {};
  app.config.errorHandler = err => {
    if (err.message === 'data is not defined') {
      return;
    }

    // eslint-disable-next-line no-console
    console.error(err);
  };
  document.body.innerHTML = `<div id="app"></div>`;
  return app.mount('#app');
}
