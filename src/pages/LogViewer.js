import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { getTripLogs, logAPI } from '../services/api';

const LogViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('LogViewer - trip id from params:', id);

  useEffect(() => {
    fetchLogs();
  }, [id]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const tripLogs = await getTripLogs(id);
      console.log('Trip logs:', tripLogs);
      
      // Ensure we have an array
      if (Array.isArray(tripLogs)) {
        setLogs(tripLogs);
      } else {
        console.error('Trip logs is not an array:', tripLogs);
        setLogs([]);
      }
    } catch (err) {
      setError('Failed to load logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (logId) => {
    try {
      const response = await logAPI.downloadPDF(logId);
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `log-${logId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  };

  const handleDownloadImage = async (logId) => {
    try {
      const response = await logAPI.downloadImage(logId);
      // Create blob and download
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `log-${logId}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading image:', err);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
          Trip Logs
        </Typography>
      </Box>

      {logs.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No logs found for this trip
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Generate logs from the trip details page to view them here.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {logs.map((log) => (
            <Grid item xs={12} md={6} key={log.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                      <CalendarIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        {formatDate(log.date)}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${log.total_miles} miles`}
                      color="primary"
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Start Time
                      </Typography>
                      <Typography variant="body1">
                        {formatTime(log.start_time)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        End Time
                      </Typography>
                      <Typography variant="body1">
                        {formatTime(log.end_time)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Hours
                      </Typography>
                      <Typography variant="body1">
                        {log.total_hours} hrs
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Driver
                      </Typography>
                      <Typography variant="body1">
                        {log.driver_name || 'Not specified'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {log.remarks && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Remarks
                      </Typography>
                      <Typography variant="body2">
                        {log.remarks}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadPDF(log.id)}
                    >
                      PDF
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadImage(log.id)}
                    >
                      Image
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default LogViewer; 