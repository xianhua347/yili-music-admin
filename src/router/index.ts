import {
  createRouter,
  createWebHashHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
  Router,
  RouteRecordRaw
} from 'vue-router';

import { useAppStore } from '@/store';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/Layouts/Layout.vue'),
    redirect: 'index',
    children: [
      {
        path: 'index',
        name: 'Index',
        component: () => import('@/pages/index/Index.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue')
  },
  {
    path: '/:pathMatch(.*)',
    component: () => import('@/pages/404.vue')
  }
];

const router: Router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
});

const whiteList = ['/login'];
router.beforeEach(
  (to: RouteLocationNormalized, _, next: NavigationGuardNext) => {
    const { appState } = useAppStore();
    // 如果没有token
    if (!appState.token) {
      // 判断当前页面是否在白名单中
      // 如果在就放行
      if (whiteList.indexOf(to.path) !== -1) {
        return next();
      }
      // 如果不在直接重定向到登陆页面
      return next(`/login?redirect=${to.path}`);
    }
    // 如果已经是登录状态
    if (appState.token && to.path === '/login') {
      return next({ name: 'Index' });
    }
    // 其他情况放行
    return next();
  }
);
export default router;
