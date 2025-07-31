import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
  Grid,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { authAPI, parseApiError } from '../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    try {
      // Strictly follow AccountSignupSerializer fields
      const userData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      };
      
      const response = await authAPI.register(userData);

      // Check if user was automatically logged in and needs verification
      const responseData = response.data.data || response.data;
      if (responseData && responseData.access) {
        // User was automatically logged in and verified
        const { access, refresh, is_email_verified } = responseData;
        
        // Since we auto-verify users, they should always be verified
        if (is_email_verified === true) {
          // Update auth context and navigate to home
          login({ access, refresh });
          navigate('/', { 
            state: { 
              message: 'Account created successfully! You are now signed in.' 
            }
          });
        } else {
          // Fallback - should not happen with auto-verification
          navigate('/verify-email', { 
            state: { email: formData.email }
          });
        }
      } else {
        // Navigate to login with success message
        navigate('/login', { 
          state: { 
            message: 'Account created successfully! Please check your email for verification, then sign in.' 
          }
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      
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
            if (['email', 'password', 'first_name', 'last_name'].includes(field)) {
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
        setError('Registration failed. Please try again.');
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
      <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Account
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Sign up to start planning your trips
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                inputProps={{ maxLength: 150 }}
                error={!!fieldErrors.first_name}
                helperText={fieldErrors.first_name || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                inputProps={{ maxLength: 150 }}
                error={!!fieldErrors.last_name}
                helperText={fieldErrors.last_name || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                inputProps={{ maxLength: 254 }}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email || "Must be a valid email address"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                required
                error={!!fieldErrors.password}
                helperText={fieldErrors.password || "Must meet Django's password validation requirements"}
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
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
            </Grid>
          </Grid>
          
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
        </form>

        <Box textAlign="center">
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/login')}
          >
            Already have an account? Sign in
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default Signup; 