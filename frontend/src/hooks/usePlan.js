import useAuthStore from '../store/authStore'

/**
 * Feature gates by plan.
 * free  → trial only (3 uploads, basic quiz/exam, basic score)
 * pro   → everything except school-only features
 * school → all features
 */
const PLAN_FEATURES = {
  free: {
    unlimitedUploads: false,
    violationsDetection: false,
    fullAnalytics: false,
    performanceBySubject: false,
    testHistoryReview: false,
    priorityAI: false,
    teacherDashboard: false,
    sharedLibrary: false,
  },
  pro: {
    unlimitedUploads: true,
    violationsDetection: true,
    fullAnalytics: true,
    performanceBySubject: true,
    testHistoryReview: true,
    priorityAI: true,
    teacherDashboard: false,
    sharedLibrary: false,
  },
  school: {
    unlimitedUploads: true,
    violationsDetection: true,
    fullAnalytics: true,
    performanceBySubject: true,
    testHistoryReview: true,
    priorityAI: true,
    teacherDashboard: true,
    sharedLibrary: true,
  },
}

export default function usePlan() {
  const { user } = useAuthStore()
  const plan = user?.plan || 'free'
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.free

  /**
   * Returns true if the user can access the given feature key.
   * Usage: can('fullAnalytics')
   */
  const can = (featureKey) => !!features[featureKey]

  return { plan, can, features }
}
