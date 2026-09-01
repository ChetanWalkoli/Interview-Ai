import { createBrowserRouter, Navigate } from "react-router";
import Login from "./features/auth/pages/login";
import Register from "./features/auth/pages/register";
import Protected from "./features/auth/components/protected";


export const router = createBrowserRouter([
    {
        path : "/",
        element : <Navigate to="/login" replace />
    },
    {
        path : "/login",
        element : <Login />
    },
    {
        path : "/register",
        element : <Register />
    },
    {
        path : "/",
        element : <Protected><h1>Home Page</h1></Protected>
    }
])