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
const TransactionList = Loadable(
  lazy(() => import("../pages/transactions/index"))
);
const BillingList = Loadable(
  lazy(() => import("../pages/billing/index"))
);
const ServicesAvailed = Loadable(
  lazy(() => import("../pages/servicesAvailed/index"))
);
const PaymentLedger = Loadable(
  lazy(() => import("../pages/paymentLedger/index"))
);
const RecentlyDeleted = Loadable(
  lazy(() => import("../pages/deletedlog/index"))
);
const RevenueReport = Loadable(
  lazy(() => import("../pages/Pages/index"))
);
const FilingTracker = Loadable(
  lazy(() => import("../pages/filingTracker/filingTracker"))
);
const PendingFiling = Loadable(                                          // ← add
  lazy(() => import("../pages/pendingforFiling/PendingFiling"))             // ← add
);                                                                        // ← add

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
    {
      path: "/dashboard/transactions",
      element: <TransactionList />,
    },
    {
      path: "/dashboard/billing",
      element: <BillingList />,
    },
    {
      path: "/dashboard/services-availed",
      element: <ServicesAvailed />,
    },
    {
      path: "/dashboard/payment-ledger",
      element: <PaymentLedger />,
    },
    {
      path: "/dashboard/recently-deleted",
      element: <RecentlyDeleted />,
    },
    {
      path: "/dashboard/revenue-report",
      element: <RevenueReport />,
    },
    {
      path: "/dashboard/filing-tracker",
      element: <FilingTracker />,
    },
    {                                         // ← add
      path: "/dashboard/pending-filing",      // ← add
      element: <PendingFiling />,             // ← add
    },                                        // ← add

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