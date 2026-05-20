import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import { ProtectedRoute } from './components/UI';

import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import GroupsList from './pages/GroupsList';
import CreateGroup from './pages/CreateGroup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChatRoom from './pages/ChatRoom';
import Chatbot from './pages/Chatbot';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import Teams from './pages/Teams';
import TeamDetails from './pages/TeamDetails';
import PrivateChat from './pages/PrivateChat';
import SearchProfiles from './pages/SearchProfiles';
import UserProfile from './pages/UserProfile';
import Tickets from './pages/Tickets';
import Predictions from './pages/Predictions';
import Carpool from './pages/Carpool';
import Friends from './pages/Friends';
import DriverConnect from './pages/DriverConnect';
import FanStore from './pages/FanStore';
import Support from './pages/Support';
import AdminDashboard from './pages/AdminDashboard';

// Placeholder for future Dashboard
// Removed inline component

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/groups" element={<GroupsList />} />
          <Route path="/groups/create" element={<CreateGroup />} />
          <Route path="/groups/:groupId/chat" element={<ChatRoom />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:teamId" element={<TeamDetails />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
          {/* Private Chat Route */}
          <Route path="/chat" element={<PrivateChat />} />
          <Route path="/chat/:userId" element={<PrivateChat />} />

          {/* Social Routes */}
          <Route path="/search" element={<SearchProfiles />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/carpool" element={<Carpool />} />
          <Route path="/driver-connect" element={<DriverConnect />} />
          <Route path="/store" element={<FanStore />} />
          <Route path="/support" element={<Support />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
