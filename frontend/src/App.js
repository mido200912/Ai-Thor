import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './context/I18nContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/landing/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CompanySetup from './pages/CompanySetup';
import CompanyDashboard from './pages/CompanyDashboard';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';




const DashboardWrapper = () => <Dashboard />;

const Layout = ({ children }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isCompanyChat = location.pathname.startsWith('/company-chat');

  return (
    <div>
      {!isLandingPage && !isCompanyChat && <Navbar />}
      <main>{children}</main>
      {!isLandingPage && !isCompanyChat && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <I18nProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />


                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardWrapper />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company-setup"
                  element={
                    <ProtectedRoute>
                      <CompanySetup />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/company-dashboard"
                  element={
                    <ProtectedRoute>
                      <CompanyDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Router>
        </I18nProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
