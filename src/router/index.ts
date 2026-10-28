import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/api/token'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    {
      path: '/',
      name: 'admin',
      component: () => import('@/layout/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'applications' } },
        { path: 'applications', name: 'applications', component: () => import('@/views/ApplicationListView.vue'), meta: { title: '商户申请' } },]
    },
  ],
})



router.beforeEach((to) => {
  if (to.meta.requiresAuth === true && !getToken()) {
    return { name: 'login' }
  }
  if (to.name === 'login' && getToken()) {
    return { name: 'applications' }
  }
  return true
})

export default router
