import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  DirectionsCar,
  Route,
  Description,
  Download,
  Visibility,
  ArrowBack,
} from '@mui/icons-material';
import { getTrip, getTripLogs, generateLogs } from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trip-tabpanel-${index}`}
      aria-labelledby={`trip-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [generatingLogs, setGeneratingLogs] = useState(false);

  useEffect(() => {
    loadTripData();
  }, [id]);

  const loadTripData = async () => {
    try {
      setLoading(true);
      const [tripData, logsData] = await Promise.all([
        getTrip(id),
        getTripLogs(id),
      ]);
      console.log('Trip data:', tripData);
      console.log('Logs data:', logsData);
      setTrip(tripData);
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load trip data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLogs = async () => {
    try {
      setGeneratingLogs(true);
      const today = new Date().toISOString().split('T')[0];
      const newLogs = await generateLogs(id, today);
      console.log('Generated logs:', newLogs);
      setLogs(Array.isArray(newLogs) ? newLogs : []);
      setTabValue(1); // Switch to logs tab
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate logs');
    } finally {
      setGeneratingLogs(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewMap = () => {
    navigate(`/map/${id}`);
  };

  const handleViewLogs = () => {
    console.log('Navigating to logs with ID:', id);
    navigate(`/logs/${id}`);
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
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!trip) {
    return (
      <Alert severity="warning">
        Trip not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back to Planner
        </Button>
        <Typography variant="h4">
          Trip Details
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Logs" />
            <Tab label="Route" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <DirectionsCar sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Trip Information
                  </Typography>
                  <Typography><strong>Pickup:</strong> {trip.pickup_location}</Typography>
                  <Typography><strong>Dropoff:</strong> {trip.dropoff_location}</Typography>
                  <Typography><strong>Distance:</strong> {trip.estimated_distance} miles</Typography>
                  <Typography><strong>Duration:</strong> {trip.estimated_duration} hours</Typography>
                  <Typography><strong>Status:</strong> 
                    <Chip 
                      label={trip.status_display} 
                      color={trip.status === 'completed' ? 'success' : 'primary'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography><strong>Cycle Used:</strong> {trip.current_cycle_used} hours</Typography>
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
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Multiple logs required: {trip.requires_multiple_logs ? 'Yes' : 'No'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateLogs}
              disabled={generatingLogs}
              startIcon={generatingLogs ? <CircularProgress size={20} /> : <Description />}
              sx={{ mr: 2 }}
            >
              {generatingLogs ? 'Generating...' : 'Generate Logs'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleViewMap}
              startIcon={<Route />}
              sx={{ mr: 2 }}
            >
              View Route
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleViewLogs}
              startIcon={<Visibility />}
            >
              View Logs
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
            Generated Logs
          </Typography>
          
          {logs.length === 0 ? (
            <Alert severity="info">
              No logs generated yet. Click "Generate Logs" to create log entries.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {logs.map((log, index) => (
                <Grid item xs={12} md={6} key={log.uid || index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Day {index + 1} - {log.date || new Date().toISOString().split('T')[0]}
                      </Typography>
                      <Typography><strong>Total Miles:</strong> {log.total_miles || 'N/A'}</Typography>
                      <Typography><strong>Total Hours:</strong> {log.total_hours || 'N/A'}</Typography>
                      <Typography><strong>Driver:</strong> {log.driver_name || 'N/A'}</Typography>
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Download />}
                          sx={{ mr: 1 }}
                        >
                          Download PDF
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Download />}
                        >
                          Download Image
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            <Route sx={{ mr: 1, verticalAlign: 'middle' }} />
            Route Information
          </Typography>
          
          {trip.route ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Route Summary
                    </Typography>
                    <Typography><strong>Total Distance:</strong> {trip.route.total_distance} miles</Typography>
                    <Typography><strong>Total Duration:</strong> {trip.route.total_duration} hours</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Stops
                    </Typography>
                    <Typography><strong>Rest Stops:</strong> {trip.route.rest_stops?.length || 0}</Typography>
                    <Typography><strong>Fuel Stops:</strong> {trip.route.fuel_stops?.length || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">
              Route information not available. Click "View Route" to see the map.
            </Alert>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default TripDetails; 