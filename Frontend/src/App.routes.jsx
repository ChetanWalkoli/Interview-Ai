import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/login";
import Register from "./features/auth/pages/register";
import Protected from "./features/auth/components/protected";
import Home from "./features/interview/pages/home";
import Interview from "./features/interview/pages/interview";
import Reports from "./features/interview/pages/reports";
import ReportDetails from "./features/interview/pages/reportDetails";
import Resume from "./features/interview/pages/resume";

export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <Protected>
                <Home />
            </Protected>
        )
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/interview",
        element: (
            <Protected>
                <Interview />
            </Protected>
        )
    },
    {
        path: "/reports",
        element: (
            <Protected>
                <Reports />
            </Protected>
        )
    },
    {
        path: "/reports/:id",
        element: (
            <Protected>
                <ReportDetails />
            </Protected>
        )
    },
    {
        path: "/resume",
        element: (
            <Protected>
                <Resume />
            </Protected>
        )
    }
]);
