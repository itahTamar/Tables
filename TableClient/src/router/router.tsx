import { createBrowserRouter } from "react-router-dom"
import ForgotPassword from "../components/users/password/ForgotPassword"
import OTPInput from "../components/users/password/OTPInput"
import ResetPassword from "../components/users/password/ResetPassword"
import UpdateUserDetails from "../components/users/UpdateUserDetails"
import LandingPage from "../view/LandingPage"
import MainTablesPage from "../view/MainTablesPage"
import RegisterPage from "../view/RegisterPage"
import TablePage from "../view/TablePage"

export const router = createBrowserRouter([
    {path: "/", element: <LandingPage/>},
    {path: "/register", element: <RegisterPage/>},
    {path: "/otpCode", element: <OTPInput/>},
    {path: "/forgotPassword", element: <ForgotPassword/>},
    {path: "/resetPassword", element: <ResetPassword/>},
    {path: "/updateUserDetails", element: <UpdateUserDetails/>},
    {path: "/mainTablesPage", element: <MainTablesPage/>},
    {path: "/table/:tableId", element: <TablePage/>},

])