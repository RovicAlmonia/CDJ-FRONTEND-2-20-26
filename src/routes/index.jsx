import { createBrowserRouter } from "react-router-dom";
import AuthenticationRoutes from "./AuthenticationRoutes.jsx";
import DashboardRoutes from "./DashboardRoutes.jsx";
const routes = createBrowserRouter([AuthenticationRoutes, DashboardRoutes])
export default routes;