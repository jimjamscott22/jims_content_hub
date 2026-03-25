import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/add',
    name: 'add-bookmark',
    component: () => import('@/views/AddBookmarkView.vue'),
  },
  {
    path: '/edit/:id',
    name: 'edit-bookmark',
    component: () => import('@/views/EditBookmarkView.vue'),
    props: true,
  },
  {
    path: '/category/:id',
    name: 'category',
    component: () => import('@/views/CategoryView.vue'),
    props: true,
  },
  {
    path: '/board',
    name: 'board',
    meta: { layoutWide: true },
    component: () => import('@/views/BoardView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
