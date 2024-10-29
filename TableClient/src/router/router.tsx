import { createBrowserRouter } from "react-router-dom"
import LandingPage from "../view/LandingPage"
import RegisterPage from "../view/RegisterPage"
import ResetPassword from "../components/ResetPassword"
import ForgotPassword from "../components/ForgotPassword"
import OTPInput from "../components/OTPInput"
import UpdateUserDetails from "../components/UpdateUserDetails"

export const router = createBrowserRouter([
    {path: "/", element: <LandingPage/>},
    {path: "/register", element: <RegisterPage/>},
    {path: "/otpCode", element: <OTPInput/>},
    {path: "/forgotPassword", element: <ForgotPassword/>},
    {path: "/resetPassword", element: <ResetPassword/>},
    {path: "/updateUserDetails", element: <UpdateUserDetails/>},
])