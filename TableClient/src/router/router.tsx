import { createBrowserRouter } from "react-router-dom"
import LandingPage from "../view/LandingPage"
import RegisterPage from "../view/RegisterPage"
import ResetPassword from "../components/ResetPassword"
import ForgotPassword from "../components/ForgotPassword"
import OTPInput from "../components/OTPInput"
import UpdateUserDetails from "../components/UpdateUserDetails"
import MainTablesPage from "../view/MainTablesPage"
import { TableData } from "../components/TableData"
import { TableDataCopyTest } from "../components/TableDataCopyTest"

export const router = createBrowserRouter([
    {path: "/", element: <LandingPage/>},
    {path: "/register", element: <RegisterPage/>},
    {path: "/otpCode", element: <OTPInput/>},
    {path: "/forgotPassword", element: <ForgotPassword/>},
    {path: "/resetPassword", element: <ResetPassword/>},
    {path: "/updateUserDetails", element: <UpdateUserDetails/>},
    {path: "/mainTablesPage", element: <MainTablesPage/>},
    // {path: "/table/:tableId/:fieldsOrder", element: <TableData/>},
    {path: "/table/:tableId/:fieldsOrder", element: <TableDataCopyTest/>},

])