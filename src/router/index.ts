import {
  createRouter,
  createWebHashHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
  Router,
  RouteRecordRaw
} from 'vue-router';

// Store imports will be done inside beforeEach to ensure Pinia is initialized
// import { useAppStore } from '@/store'; // App store for token
// import { useUserStore } from '@/store/modules/UserStore'; // User store for user details and roles

// Page Components
const Layout = () => import('@/Layouts/Layout.vue');
const IndexPage = () => import('@/pages/index/Index.vue');
const LoginPage = () => import('@/pages/Login.vue');
const NotFoundPage = () => import('@/pages/404.vue');
const RegisterPage = () => import('@/pages/RegisterPage.vue');
const UserListPage = () => import('@/pages/user/UserListPage.vue');
const ProfilePage = () => import('@/pages/user/ProfilePage.vue');
const UserCreatePage = () => import('@/pages/user/UserCreatePage.vue');
const UserEditPage = () => import('@/pages/user/UserEditPage.vue');


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: Layout,
    redirect: '/index', // Changed to absolute path for clarity
    children: [
      {
        path: 'index', // Relative to parent
        name: 'Index',
        component: IndexPage,
      },
      {
        path: '/users', // Absolute path
        name: 'UserList',
        component: UserListPage,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/users/profile', // Absolute path
        name: 'UserProfile',
        component: ProfilePage,
        meta: { requiresAuth: true },
      },
      {
        path: '/users/new', // Absolute path
        name: 'UserCreate',
        component: UserCreatePage,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/users/:id/edit', // Absolute path
        name: 'UserEdit',
        component: UserEditPage,
        props: true,
        meta: { requiresAuth: true, requiresAdminOrSelf: true },
      },
    ],
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: RegisterPage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/:pathMatch(.*)*', // Adjusted for Vue Router 4 syntax if needed, or keep as is
    name: 'NotFound',
    component: NotFoundPage,
  },
];

const router: Router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

const whiteList = ['/login', '/auth/register']; // Added register to whitelist

router.beforeEach(
  async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    // Dynamically import stores here
    const { useAppStore } = await import('@/store');
    const { useUserStore } = await import('@/store/modules/UserStore');

    const appStore = useAppStore();
    const userStore = useUserStore();

    const token = appStore.appState.token; // Assuming token is in appState
    
    // Fetch current user if token exists but user details are not loaded
    // This is crucial for role-based guards to have up-to-date user info
    if (token && !userStore.currentUser && to.meta.requiresAuth) {
        try {
            await userStore.fetchCurrentUser();
        } catch (error) {
            console.error('Failed to fetch current user during navigation guard:', error);
            appStore.clearToken(); // Clear invalid token
            userStore.reset(); // Reset user state
            return next({ name: 'Login', query: { redirect: to.fullPath } });
        }
    }


    // Handle routes that don't require authentication (whitelist)
    if (whiteList.includes(to.path)) {
      if (token && to.path === '/login') { // If logged in and trying to access login, redirect to index
        return next({ name: 'Index' });
      }
      return next(); // Allow access to whitelist paths
    }

    // Authentication Check for all other routes
    if (!token) {
      return next({ name: 'Login', query: { redirect: to.fullPath } });
    }
    
    // At this point, user is authenticated (has token)
    // For requiresAuth routes, if currentUser somehow is still null (e.g. token valid, fetch failed earlier and not caught), re-check
    if (to.meta.requiresAuth && !userStore.currentUser) {
        console.warn('Token exists but currentUser is null. This might indicate an issue.');
        // Attempt one more fetch or redirect to login
        try {
            await userStore.fetchCurrentUser();
            if (!userStore.currentUser) throw new Error("User not found despite token.");
        } catch (error) {
            appStore.clearToken();
            userStore.reset();
            return next({ name: 'Login', query: { redirect: to.fullPath } });
        }
    }


    // Authorization Checks
    if (to.meta.requiresAdmin && !userStore.isAdmin()) {
      // console.warn(`Admin access required for ${to.path}. User is not admin.`);
      // Redirect to a 'Not Authorized' page or home. For now, redirecting to Index.
      return next({ name: 'Index', query: { unauthorized: 'true' } }); // Or a dedicated NotAuthorized page
    }

    if (to.meta.requiresAdminOrSelf) {
      const userIdFromRoute = to.params.id as string;
      const currentUserId = userStore.currentUser?.id?.toString();
      if (!(userStore.isAdmin() || (currentUserId && currentUserId === userIdFromRoute))) {
        // console.warn(`Admin or self access required for ${to.path}. Condition not met.`);
        return next({ name: 'Index', query: { unauthorized_self: 'true' } }); // Or a dedicated NotAuthorized page
      }
    }

    // If already logged in and trying to access login or register, redirect to index
    // This check is implicitly handled by whitelist logic earlier for /login, but good to be explicit if needed
    // if (token && (to.path === '/login' || to.path === '/auth/register')) {
    //   return next({ name: 'Index' });
    // }

    return next(); // All checks passed
  }
);
export default router;
