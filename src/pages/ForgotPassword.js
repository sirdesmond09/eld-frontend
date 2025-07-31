import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email.trim()) {
      setError('Email address is required');
      setLoading(false);
      return;
    }

    try {
      // Request password reset token following PasswordResetRequestSerializer
      await authAPI.requestPasswordReset(email.trim().toLowerCase());
      setSuccess(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      
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
          setError(errors.error || 'Failed to send reset email');
        }
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
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
          <EmailIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Check Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We've sent password reset instructions to <strong>{email}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please check your email and follow the link to reset your password. 
            The link will expire in 24 hours.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Back to Login
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
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/login')}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
        </Box>
        
        <Typography variant="h4" align="center" gutterBottom>
          Forgot Password
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Enter your email address and we'll send you instructions to reset your password.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 3 }}
            inputProps={{ maxLength: 254 }}
            helperText="Enter the email address associated with your account"
          />
          
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Reset Instructions'}
          </Button>
        </form>

        <Box textAlign="center">
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/login')}
          >
            Remember your password? Sign in
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPassword; 