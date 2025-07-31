import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { authAPI } from '../services/api';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  // Get user email from location state (passed from login/signup)
  const userEmail = location.state?.email || 'your email';

  useEffect(() => {
    // Check if user is already verified
    const checkVerificationStatus = () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/login');
        return;
      }
      
      // You could decode the JWT to check verification status
      // For now, we'll rely on the backend responses
    };
    
    checkVerificationStatus();
  }, [navigate]);

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!token.trim()) {
      setError('Verification token is required');
      setLoading(false);
      return;
    }

    try {
      // Verify email following EmailVerificationSerializer
      await authAPI.verifyEmail(token.trim());
      setSuccess(true);
    } catch (err) {
      console.error('Email verification error:', err);
      
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          const errorMessages = [];
          Object.keys(errors).forEach(field => {
            if (Array.isArray(errors[field])) {
              errorMessages.push(`${field}: ${errors[field].join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${errors[field]}`);
            }
          });
          setError(errorMessages.join('. '));
        } else {
          setError(errors.error || errors.detail || 'Invalid verification token');
        }
      } else {
        setError('Email verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendToken = async () => {
    setResendLoading(true);
    setError('');
    setResendSuccess(false);

    try {
      // Resend verification email following ResendEmailVerificationSerializer
      await authAPI.resendEmailVerification();
      setResendSuccess(true);
    } catch (err) {
      console.error('Resend verification error:', err);
      
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          const errorMessages = [];
          Object.keys(errors).forEach(field => {
            if (Array.isArray(errors[field])) {
              errorMessages.push(`${field}: ${errors[field].join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${errors[field]}`);
            }
          });
          setError(errorMessages.join('. '));
        } else {
          setError(errors.error || errors.detail || 'Failed to resend verification email');
        }
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait before requesting another verification email.');
      } else {
        setError('Failed to resend verification email. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: 'background.default' }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Email Verified Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your email has been verified. You can now access all features of your account.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Continue to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ bgcolor: 'background.default' }}
    >
      <Paper sx={{ p: 4, maxWidth: 450, width: '100%' }}>
        <Box textAlign="center" mb={3}>
          <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Verify Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We've sent a verification token to <strong>{userEmail}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please check your email and enter the verification token below.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {resendSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Verification email sent successfully! Please check your inbox.
          </Alert>
        )}

        <form onSubmit={handleVerifyEmail}>
          <TextField
            fullWidth
            label="Verification Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            sx={{ mb: 3 }}
            placeholder="Enter the token from your email"
            helperText="Enter the verification token you received in your email"
          />
          
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify Email'}
          </Button>
        </form>

        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Didn't receive the email?
          </Typography>
          <Button
            variant="text"
            onClick={handleResendToken}
            disabled={resendLoading}
            sx={{ mb: 2 }}
          >
            {resendLoading ? <CircularProgress size={20} /> : 'Resend Verification Email'}
          </Button>
          
          <Box>
            <Button
              variant="text"
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigate('/login');
              }}
            >
              Sign Out and Try Different Account
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmailVerification; 