// File to handle the app routing.
// All of the files inside of the folder pages are called by this file.
// NOTE: This was the first file that I worked on for .jsx. Originally I didn't have pages,
// But Gemini Pro and I worked through the process of creating pages, where I added the logic for ultimately
// calling the db_functions.py functions. This file wasn't written by Gemini Pro, but it definitely helped a lot
// with writing this file and helping me to learn and understand the process of writing a React application.

import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider.jsx'
import { useAuth } from './auth/useAuth.js'
import RequireAuth from './auth/RequireAuth.jsx'
import Layout from './Layout.jsx'
import AddDevicePage from './pages/AddDevicePage.jsx'
import DeleteDevicePage from './pages/DeleteDevicePage.jsx'
import DeleteUserPage from './pages/DeleteUserPage.jsx'
import GoodbyePage from './pages/GoodbyePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ReadDevicePage from './pages/ReadDevicePage.jsx'
import ReadUserPage from './pages/ReadUserPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import UpdateDevicePage from './pages/UpdateDevicePage.jsx'
import UpdateUserPage from './pages/UpdateUserPage.jsx'
import WelcomePage from './pages/WelcomePage.jsx'

function HomeRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/user/read' : '/welcome'} replace />
}

function CatchAllRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/user/read' : '/welcome'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/welcome/login" element={<LoginPage />} />
      <Route path="/welcome/register" element={<RegisterPage />} />
      <Route path="/goodbye" element={<GoodbyePage />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="user/read" element={<ReadUserPage />} />
          <Route path="user/update" element={<UpdateUserPage />} />
          <Route path="user/delete" element={<DeleteUserPage />} />
          <Route path="device/add" element={<AddDevicePage />} />
          <Route path="device/read" element={<ReadDevicePage />} />
          <Route path="device/update" element={<UpdateDevicePage />} />
          <Route path="device/delete" element={<DeleteDevicePage />} />
        </Route>
      </Route>
      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
