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
  Grid,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { authAPI, parseApiError } from '../services/api';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClickShowCurrentPassword = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
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

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.currentPassword.trim() || !formData.newPassword.trim()) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      // Change password following ChangePasswordViewSet
      await authAPI.changePassword(formData.currentPassword, formData.newPassword);
      setSuccess(true);
    } catch (err) {
      console.error('Change password error:', err);
      
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
            if (['old_password', 'new_password', 'password'].includes(field)) {
              // This is a field-specific error - map to our form field names
              const fieldName = field === 'old_password' ? 'currentPassword' : 
                               field === 'new_password' ? 'newPassword' : 'newPassword';
              fieldSpecificErrors[fieldName] = Array.isArray(errors[field]) 
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
        setError('Failed to change password. Please try again.');
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
          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Password Changed Successfully
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your password has been successfully updated.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
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
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
        </Box>
        
        <Typography variant="h4" align="center" gutterBottom>
          Change Password
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Update your account password
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Current Password"
            name="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            value={formData.currentPassword}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
            error={!!fieldErrors.currentPassword}
            helperText={fieldErrors.currentPassword || ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowCurrentPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            value={formData.newPassword}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
            error={!!fieldErrors.newPassword}
            helperText={fieldErrors.newPassword || "Must meet Django's password validation requirements"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowNewPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            label="Confirm New Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
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
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </form>

        <Box textAlign="center">
          <Button
            variant="text"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChangePassword; 