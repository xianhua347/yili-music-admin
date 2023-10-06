import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export { pinia };
export * from '@/store/modules/AppStore';
export * from '@/store/modules/TokenStore';
export * from '@/store/modules/UserStore';
