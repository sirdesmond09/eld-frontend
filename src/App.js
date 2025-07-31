import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import { AuthContext, AuthProvider } from './contexts/AuthContext';

// Components
import Header from './components/Header';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import EmailVerification from './pages/EmailVerification';
import TripPlanner from './pages/TripPlanner';
import TripsList from './pages/TripsList';
import TripDetails from './pages/TripDetails';
import LogViewer from './pages/LogViewer';
import MapView from './pages/MapView';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});



// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = React.useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                      <TripPlanner />
                    </Container>
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/trips" element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                      <TripsList />
                    </Container>
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/trip/:id" element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                      <TripDetails />
                    </Container>
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/logs/:id" element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                      <LogViewer />
                    </Container>
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/map/:id" element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                      <MapView />
                    </Container>
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/change-password" element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 