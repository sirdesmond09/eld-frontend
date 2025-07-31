import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { DirectionsCar, Route, Description } from '@mui/icons-material';
import { planTrip } from '../services/api';

const steps = ['Enter Trip Details', 'Review Route', 'Generate Logs'];

const TripPlanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tripData, setTripData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: '',
    driver_name: '',
    carrier_name: '',
    vehicle_numbers: '',
  });
  const [plannedTrip, setPlannedTrip] = useState(null);

  // Check for success message from navigation
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTripData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlanTrip = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await planTrip(tripData);
      setPlannedTrip(response);
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to plan trip');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLogs = async () => {
    if (!plannedTrip) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Navigate to trip details page
      navigate(`/trip/${plannedTrip.uid}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate logs');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return tripData.current_location && 
           tripData.pickup_location && 
           tripData.dropoff_location && 
           tripData.current_cycle_used;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Plan Your Trip
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {activeStep === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            <DirectionsCar sx={{ mr: 1, verticalAlign: 'middle' }} />
            Trip Details
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Current Location"
                name="current_location"
                value={tripData.current_location}
                onChange={handleInputChange}
                placeholder="e.g., New York, NY"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pickup Location"
                name="pickup_location"
                value={tripData.pickup_location}
                onChange={handleInputChange}
                placeholder="e.g., Los Angeles, CA"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dropoff Location"
                name="dropoff_location"
                value={tripData.dropoff_location}
                onChange={handleInputChange}
                placeholder="e.g., Chicago, IL"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Current Cycle Used (Hours)"
                name="current_cycle_used"
                type="number"
                value={tripData.current_cycle_used}
                onChange={handleInputChange}
                inputProps={{ min: 0, max: 70, step: 0.5 }}
                required
                helperText="Hours used in current 8-day cycle (0-70)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Driver Name"
                name="driver_name"
                value={tripData.driver_name}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Carrier Name"
                name="carrier_name"
                value={tripData.carrier_name}
                onChange={handleInputChange}
                placeholder="ABC Trucking"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Vehicle Numbers"
                name="vehicle_numbers"
                value={tripData.vehicle_numbers}
                onChange={handleInputChange}
                placeholder="Truck 123, Trailer 456"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handlePlanTrip}
              disabled={!isFormValid() || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Route />}
            >
              {loading ? 'Planning Trip...' : 'Plan Trip'}
            </Button>
          </Box>
        </Paper>
      )}

      {activeStep === 1 && plannedTrip && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            <Route sx={{ mr: 1, verticalAlign: 'middle' }} />
            Route Summary
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Trip Information
                  </Typography>
                  <Typography><strong>Distance:</strong> {plannedTrip.estimated_distance} miles</Typography>
                  <Typography><strong>Duration:</strong> {plannedTrip.estimated_duration} hours</Typography>
                  <Typography><strong>Status:</strong> {plannedTrip.status_display}</Typography>
                  <Typography><strong>Multiple Logs Required:</strong> {plannedTrip.requires_multiple_logs ? 'Yes' : 'No'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    HOS Compliance
                  </Typography>
                  <Typography>✓ 11-hour driving limit</Typography>
                  <Typography>✓ 14-hour duty limit</Typography>
                  <Typography>✓ 10-hour rest requirement</Typography>
                  <Typography>✓ 70-hour cycle limit</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateLogs}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Description />}
              sx={{ mr: 2 }}
            >
              {loading ? 'Generating...' : 'Generate Logs'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setActiveStep(0)}
            >
              Back to Edit
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default TripPlanner; 