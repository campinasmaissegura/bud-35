import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './components/Dashboard';
import RegisterPerson from './components/RegisterPerson';
import ViewPerson from './components/ViewPerson';
import EditPerson from './components/EditPerson';
import Search from './components/Search';
import ManageUsers from './components/ManageUsers';
import Targets from './components/Targets';
import Reports from './components/Reports';
import Layout from './components/Layout';
import Login from './components/Login';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout currentPageName="Dashboard"><Dashboard /></Layout>} />
          <Route path="/register" element={<Layout currentPageName="RegisterPerson"><RegisterPerson /></Layout>} />
          <Route path="/search" element={<Layout currentPageName="Search"><Search /></Layout>} />
          <Route path="/manage-users" element={<Layout currentPageName="ManageUsers"><ManageUsers /></Layout>} />
          <Route path="/person" element={<Layout currentPageName="ViewPerson"><ViewPerson /></Layout>} />
          <Route path="/edit-person" element={<Layout currentPageName="EditPerson"><EditPerson /></Layout>} />
          <Route path="/targets" element={<Layout currentPageName="Targets"><Targets /></Layout>} />
          <Route path="/reports" element={<Layout currentPageName="Reports"><Reports /></Layout>} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}