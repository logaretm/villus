import { createApp, compile, defineComponent, ComponentOptionsWithoutProps } from 'vue';

export function mount(component: ComponentOptionsWithoutProps) {
  const comp = defineComponent(component);
  const app = createApp(comp);
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

  return app.mount('#app');
}
