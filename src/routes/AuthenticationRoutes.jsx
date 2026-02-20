
import GuestLayout from '../layouts/Guestlayout/GuestLayout'
import { lazy } from "react"
import Loadable from '../components/Loadable/Loadable'
const Login = Loadable(lazy(() => import('../views/authentication/auth/auth-container/index')));
const ForgetPassword = Loadable(lazy(() => import('../views/authentication/forgot-password/forgetpass-container/index')));
const UpdatePassword = Loadable(lazy(() => import('../views/authentication/update-password/updatepass-container/index')));

const AuthenticationRoutes = {
  path: '/',
  element: <GuestLayout />,
  children: [
    {
        path: '/',
        element: <Login />
    },
    {
      path: '/forgot-password',
      element: <ForgetPassword />
    },
    {
      path: '/new-password/initiate',
      element: <UpdatePassword />
    },
  ]
}

export default AuthenticationRoutes