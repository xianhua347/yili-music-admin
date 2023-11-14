// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css';
// Import Quasar css
import 'quasar/src/css/index.sass';

import { Dark, Notify, Quasar } from 'quasar';
import { createApp } from 'vue';

import App from '@/App.vue';
import { AppColorMode } from '@/plugin';
import router from '@/router';
import { pinia } from '@/store';

const app = createApp(App);
app
  .use(router)
  .use(pinia)
  .use(AppColorMode)
  .use(Quasar, {
    plugins: {
      Notify,
      Dark
    }
  })
  .mount('#app');
