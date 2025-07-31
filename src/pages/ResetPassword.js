import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { authAPI, parseApiError } from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setError('Invalid reset link');
      setValidating(false);
      return;
    }

    try {
      // Validate token following PasswordTokenValidationSerializer
      await authAPI.validateResetToken(token);
      setTokenValid(true);
    } catch (err) {
      console.error('Token validation error:', err);
      if (err.response?.status === 404) {
        setError('This reset link is invalid or has expired');
      } else {
        setError('Unable to validate reset link');
      }
    } finally {
      setValidating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      // Reset password following PasswordResetConfirmSerializer
      await authAPI.confirmPasswordReset(token, formData.password);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      
      setError('');
      setFieldErrors({});
      
      if (err.response?.data) {
        const responseData = err.response.data;
        const errors = responseData.error || responseData;
        
        if (typeof errors === 'object' && !Array.isArray(errors)) {
          // Separate field-specific errors from general errors
          const fieldSpecificErrors = {};
          const generalErrors = [];
          
          Object.keys(errors).forEach(field => {
            if (['password'].includes(field)) {
              // This is a field-specific error
              fieldSpecificErrors[field] = Array.isArray(errors[field]) 
                ? errors[field].join(', ') 
                : errors[field];
            } else {
              // This is a general error
              if (Array.isArray(errors[field])) {
                generalErrors.push(`${field}: ${errors[field].join(', ')}`);
              } else {
                generalErrors.push(`${field}: ${errors[field]}`);
            }
            }
          });
          
          setFieldErrors(fieldSpecificErrors);
          if (generalErrors.length > 0) {
            setError(generalErrors.join('. '));
          }
        } else {
          setError(parseApiError(err));
        }
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: 'background.default' }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">
            Validating reset link...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!tokenValid) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: 'background.default' }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Invalid Reset Link
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {error || 'This password reset link is invalid or has expired.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please request a new password reset link.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/forgot-password')}
            sx={{ mr: 1 }}
          >
            Request New Link
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </Paper>
      </Box>
    );
  }

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
            Password Reset Successful
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your password has been successfully reset. You can now sign in with your new password.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Sign In
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
        <Typography variant="h4" align="center" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Enter your new password below
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password || "Must meet Django's password validation requirements"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            label="Confirm New Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            sx={{ mb: 3 }}
            error={!!fieldErrors.confirmPassword}
            helperText={fieldErrors.confirmPassword || ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
        </form>

        <Box textAlign="center">
          <Button
            variant="text"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPassword; 