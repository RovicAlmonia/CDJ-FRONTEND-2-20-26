/* @refresh reset */
import { lazy } from "react";
import Loadable from "../components/Loadable/Loadable";
import AccessRightsRoutes from "./AccessRightsRoutes";

const MainLayout = Loadable(
  lazy(() => import("../layouts/Mainlayout/MainLayout"))
);
const Dashboard = Loadable(lazy(() => import("../views/Dashboard/index")));
const AccessDenied = Loadable(
  lazy(() => import("../components/Page403/accessDenied"))
);
const PageNotFound = Loadable(
  lazy(() => import("../components/Page404/pageNotFound"))
);
const UpdateFormPass = Loadable(
  lazy(() =>
    import("../views/authentication/update-password/updatepass-container")
  )
);
const TestInt = Loadable(
  lazy(() => import("../views/test/index"))
);
const Clients = Loadable(
  lazy(() => import("../pages/clients/index"))
);
const ServicesList = Loadable(
  lazy(() => import("../pages/servicesList/index"))
);

const DashboardRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/dashboard/test",
      element: <TestInt />,
    },
    {
      path: "/dashboard/clients",
      element: <Clients />,
    },
    {
      path: "/dashboard/services-list",
      element: <ServicesList />,
    },

    // others
    {
      path: "/access-denied",
      element: <AccessDenied />,
    },
    {
      path: "/dashboard/change-password",
      element: <UpdateFormPass />,
    },
    {
      path: "*",
      element: <PageNotFound />,
    },
  ],
};

export default DashboardRoutes;