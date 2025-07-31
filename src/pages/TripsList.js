import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  DirectionsCar,
  Route as RouteIcon,
  Description as LogsIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { getTrips } from '../services/api';

const TripsList = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const tripsData = await getTrips();
      console.log('Trips data:', tripsData);
      
      // Ensure we have an array
      if (Array.isArray(tripsData)) {
        setTrips(tripsData);
      } else {
        console.error('Trips data is not an array:', tripsData);
        setTrips([]);
      }
    } catch (err) {
      setError('Failed to load trips');
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          My Trips
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/')}
          size="large"
        >
          Plan New Trip
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {trips.length === 0 ? (
        <Box textAlign="center" py={6}>
          <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No trips found
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Start by planning your first trip
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/')}
            size="large"
          >
            Plan Your First Trip
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {trips.map((trip) => (
            <Grid item xs={12} sm={6} md={4} key={trip.uid}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {trip.pickup_location} → {trip.dropoff_location}
                    </Typography>
                    <Chip
                      label={trip.status_display || trip.status}
                      color={getStatusColor(trip.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Current Location:</strong> {trip.current_location}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Distance:</strong> {trip.estimated_distance} miles
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Duration:</strong> {trip.estimated_duration} hours
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Cycle Used:</strong> {trip.current_cycle_used} hours
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>Created:</strong> {formatDate(trip.created_at)}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<RouteIcon />}
                    onClick={() => navigate(`/trip/${trip.uid}`)}
                  >
                    View Details
                  </Button>
                  
                  {trip.log_entries && trip.log_entries.length > 0 && (
                    <Button
                      size="small"
                      startIcon={<LogsIcon />}
                      onClick={() => navigate(`/logs/${trip.uid}`)}
                    >
                      View Logs
                    </Button>
                  )}
                  
                  {trip.route && (
                    <Button
                      size="small"
                      startIcon={<MapIcon />}
                      onClick={() => navigate(`/map/${trip.uid}`)}
                    >
                      Map
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add trip"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' }
        }}
        onClick={() => navigate('/')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default TripsList; 