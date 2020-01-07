import { createApp, compile } from 'vue';

export function mount(component: Record<string, any>) {
  const app = createApp();
  app.config.devtools = false;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  app.config.warnHandler = () => {};
  app.config.errorHandler = err => {
    if (err.message === 'data is not defined') {
      return;
    }

    // eslint-disable-next-line no-console
    console.error(err);
  };

  document.body.innerHTML = `<div id="app"></div>`;
  component.render = compile(component.template);
  component.template = undefined;

  return app.mount(component, '#app');
}
