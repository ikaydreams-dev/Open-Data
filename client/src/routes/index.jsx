import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { RootLayout } from '../components/layout/RootLayout'
import { AuthLayout } from '../components/layout/AuthLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { RoleGuard } from '../components/auth/RoleGuard'
import { PageSpinner } from '../components/shared/Spinner'
import { ROLES } from '../lib/constants'

const wrap = (Component) => (
  <Suspense fallback={<PageSpinner />}>
    <Component />
  </Suspense>
)

// Auth pages
const SignInPage = lazy(() => import('../pages/auth/SignInPage'))
const SignUpPage = lazy(() => import('../pages/auth/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmailPage'))

// Main pages
const HomePage = lazy(() => import('../pages/home/HomePage'))
const DatasetBrowsePage = lazy(() => import('../pages/datasets/DatasetBrowsePage'))
const DatasetDetailPage = lazy(() => import('../pages/datasets/DatasetDetailPage'))
const DatasetUploadPage = lazy(() => import('../pages/datasets/DatasetUploadPage'))
const SearchResultsPage = lazy(() => import('../pages/search/SearchResultsPage'))
const DiscussionsPage = lazy(() => import('../pages/community/DiscussionsPage'))
const UserProfilePage = lazy(() => import('../pages/profile/UserProfilePage'))
const EditProfilePage = lazy(() => import('../pages/profile/EditProfilePage'))
const OrgProfilePage = lazy(() => import('../pages/organization/OrgProfilePage'))
const ApiKeysPage = lazy(() => import('../pages/api-keys/ApiKeysPage'))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const NotFoundPage = lazy(() => import('../pages/errors/NotFoundPage'))
const ForbiddenPage = lazy(() => import('../pages/errors/ForbiddenPage'))

export const router = createBrowserRouter([
  // Auth routes (no navbar/footer)
  {
    element: <AuthLayout />,
    children: [
      { path: '/sign-in', element: wrap(SignInPage) },
      { path: '/sign-up', element: wrap(SignUpPage) },
      { path: '/forgot-password', element: wrap(ForgotPasswordPage) },
      { path: '/reset-password/:token', element: wrap(ResetPasswordPage) },
      { path: '/verify-email/:token', element: wrap(VerifyEmailPage) },
    ],
  },

  // Main app routes
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: wrap(HomePage) },
      { path: '/datasets', element: wrap(DatasetBrowsePage) },
      { path: '/datasets/:slug', element: wrap(DatasetDetailPage) },
      { path: '/search', element: wrap(SearchResultsPage) },
      { path: '/community', element: wrap(DiscussionsPage) },
      { path: '/users/:username', element: wrap(UserProfilePage) },
      { path: '/organizations/:slug', element: wrap(OrgProfilePage) },
      { path: '/403', element: wrap(ForbiddenPage) },

      // Protected routes
      {
        element: <ProtectedRoute><></></ProtectedRoute>,
        children: [
          { path: '/datasets/upload', element: wrap(DatasetUploadPage) },
          { path: '/account/profile', element: wrap(EditProfilePage) },
          { path: '/account/api-keys', element: wrap(ApiKeysPage) },
        ],
      },

      // Admin routes
      {
        path: '/admin',
        element: (
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.ADMIN]}>
              {wrap(AdminDashboardPage)}
            </RoleGuard>
          </ProtectedRoute>
        ),
      },

      { path: '*', element: wrap(NotFoundPage) },
    ],
  },
])
