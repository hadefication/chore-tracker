import { createRouter, createWebHistory } from 'vue-router'
import { hasParentSession } from '../lib/auth'
import ChildDashboardView from '../views/ChildDashboardView.vue'
import HistoryView from '../views/HistoryView.vue'
import LibraryView from '../views/LibraryView.vue'
import MonthView from '../views/MonthView.vue'
import ParentApprovalsView from '../views/ParentApprovalsView.vue'
import ParentDashboardView from '../views/ParentDashboardView.vue'
import ParentPinView from '../views/ParentPinView.vue'
import SettingsView from '../views/SettingsView.vue'

export const parentNavigationItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/parent/dashboard' },
  { title: 'Approvals', icon: 'mdi-check-decagram-outline', to: '/parent/approvals' },
  { title: 'Month', icon: 'mdi-calendar-month-outline', to: '/parent/month' },
  { title: 'Library', icon: 'mdi-shape-outline', to: '/parent/library' },
  { title: 'History', icon: 'mdi-history', to: '/parent/history' },
  { title: 'Settings', icon: 'mdi-cog-outline', to: '/parent/settings' },
] as const

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: ChildDashboardView,
      meta: { title: 'Chores' },
    },
    {
      path: '/parent',
      component: ParentPinView,
      meta: { title: 'Parent' },
    },
    {
      path: '/parent/dashboard',
      component: ParentDashboardView,
      meta: { title: 'Dashboard', parentArea: true },
    },
    {
      path: '/parent/approvals',
      component: ParentApprovalsView,
      meta: { title: 'Approvals', parentArea: true },
    },
    {
      path: '/parent/month',
      component: MonthView,
      meta: { title: 'Month', parentArea: true },
    },
    {
      path: '/parent/library',
      component: LibraryView,
      meta: { title: 'Library', parentArea: true },
    },
    {
      path: '/parent/history',
      component: HistoryView,
      meta: { title: 'History', parentArea: true },
    },
    {
      path: '/parent/settings',
      component: SettingsView,
      meta: { title: 'Settings', parentArea: true },
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.parentArea && !hasParentSession()) {
    return {
      path: '/parent',
      query: { next: to.fullPath },
    }
  }

  return true
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : 'Chore Tracker'
  document.title = `${title} | Chore Tracker`
})

export default router
