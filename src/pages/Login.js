import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { authAPI, parseApiError } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Get success message from signup redirect
  const successMessage = location.state?.message;

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

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Strictly follow AccountLoginSerializer fields
      const loginData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const response = await authAPI.login(loginData);
      
      // Store tokens following AuthSerializer response format
      const { access, refresh, is_email_verified } = response.data.data || response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Since we auto-verify users on login, they should always be verified
      // But keep this check as fallback
      if (!is_email_verified) {
        navigate('/verify-email', { 
          state: { email: formData.email }
        });
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      
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
            if (['email', 'password'].includes(field)) {
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
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          ELD Trip Planner
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to plan your trips
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email || ''}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            required
            sx={{ mb: 3 }}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password || ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
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
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </form>

        <Box textAlign="center">
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/forgot-password')}
            sx={{ display: 'block', mb: 1 }}
          >
            Forgot your password?
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/signup')}
          >
            Don't have an account? Sign up
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login; 