import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Directions as DirectionsIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getTrip, getTripRoute } from '../services/api';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTripData();
  }, [id]);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const [tripData, routeData] = await Promise.all([
        getTrip(id),
        getTripRoute(id),
      ]);
      console.log('Map - Trip data:', tripData);
      console.log('Map - Route data:', routeData);
      setTrip(tripData);
      setRoute(routeData);
    } catch (err) {
      setError('Failed to load trip data');
      console.error('Error fetching trip data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (hours) => {
    if (hours == null) return 'N/A';
    const numericHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    const wholeHours = Math.floor(numericHours);
    const minutes = Math.round((numericHours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const formatDistance = (miles) => {
    if (miles == null) return 'N/A miles';
    const numericMiles = typeof miles === 'string' ? parseFloat(miles) : miles;
    return `${numericMiles.toFixed(1)} miles`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!trip) {
    return (
      <Box>
        <Alert severity="warning">Trip not found</Alert>
      </Box>
    );
  }

  // Nigeria coordinates - Center of Nigeria and major cities
  const defaultCenter = [9.0765, 7.3986]; // Center of Nigeria
  const currentLocation = [6.5244, 3.3792]; // Lagos (default current location)
  const pickupLocation = [9.0579, 7.4951]; // Abuja (default pickup)
  const dropoffLocation = [11.5804, 8.9402]; // Kano (default dropoff)

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/trip/${id}`)}
          sx={{ mr: 2 }}
        >
          Back to Trip
        </Button>
        <Typography variant="h4" component="h1">
          Trip Route
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Trip Summary Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trip Summary
              </Typography>
              
              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Current Location
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {trip.current_location}
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <DirectionsIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Pickup Location
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {trip.pickup_location}
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <DirectionsIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Dropoff Location
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {trip.dropoff_location}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Distance
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {trip.estimated_distance ? formatDistance(trip.estimated_distance) : 'Calculating...'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {trip.estimated_duration ? formatDuration(trip.estimated_duration) : 'Calculating...'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Cycle Used
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {trip.current_cycle_used} hrs
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={trip.status_display || trip.status}
                    color={trip.status === 'completed' ? 'success' : 'primary'}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Route Details */}
          {route && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Route Details
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Total Distance
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatDistance(route.total_distance)}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Total Duration
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatDuration(route.total_duration)}
                  </Typography>
                </Box>

                {route.rest_stops && route.rest_stops.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Rest Stops
                    </Typography>
                    <Typography variant="body1">
                      {route.rest_stops.length} stops planned
                    </Typography>
                  </Box>
                )}

                {route.fuel_stops && route.fuel_stops.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Fuel Stops
                    </Typography>
                    <Typography variant="body1">
                      {route.fuel_stops.length} stops planned
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Map */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '600px', overflow: 'hidden' }}>
            <MapContainer
              center={defaultCenter}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Current Location Marker */}
              <Marker position={currentLocation}>
                <Popup>
                  <Typography variant="subtitle2">Current Location</Typography>
                  <Typography variant="body2">{trip.current_location}</Typography>
                </Popup>
              </Marker>

              {/* Pickup Location Marker */}
              <Marker position={pickupLocation}>
                <Popup>
                  <Typography variant="subtitle2">Pickup Location</Typography>
                  <Typography variant="body2">{trip.pickup_location}</Typography>
                </Popup>
              </Marker>

              {/* Dropoff Location Marker */}
              <Marker position={dropoffLocation}>
                <Popup>
                  <Typography variant="subtitle2">Dropoff Location</Typography>
                  <Typography variant="body2">{trip.dropoff_location}</Typography>
                </Popup>
              </Marker>

              {/* Route Line (placeholder - would be actual route coordinates) */}
              <Polyline
                positions={[currentLocation, pickupLocation, dropoffLocation]}
                color="blue"
                weight={3}
                opacity={0.7}
              />
            </MapContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MapView; 