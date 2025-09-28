import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Button,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Snackbar,
  Fade,
  Stack,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Language as LanguageIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Storage as StorageIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const redirectToLogin = () => {
  window.location.href = "/"; // change to "/login" if that's your login route
};


const handleError = (error) => {
  if (error.response && error.response.status === 401) {
    redirectToLogin();
  } else {
    console.error("API Error:", error);
    throw error;
  }
};

const fetchRecordsForDomain = async (domainId) => {
  try {
    const response = await axios.get(`${API_URL}/domains/${domainId}/records`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

const fetchDomainDetails = async (domainId) => {
  try {
    const response = await axios.get(`${API_URL}/domains/${domainId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

const addRecord = async (domainId, recordData) => {
  try {
    const payload = { domain_id: domainId, ...recordData };
    const response = await axios.post(`${API_URL}/records`, payload, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

const updateRecord = async (domainId, recordId, recordData) => {
  try {
    const response = await axios.put(
      `${API_URL}/records/${recordId}`,
      recordData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

const deleteRecord = async (domainId, recordId) => {
  try {
    await axios.delete(`${API_URL}/records/${recordId}`, {
      withCredentials: true,
    });
  } catch (error) {
    handleError(error);
  }
};

const fetchUser = async (user) => {
  if (user && user.id) {
    return user;
  }
  try {
    const response = await axios.get(`${API_URL}/me`, { withCredentials: true });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Clean, minimal styled components
const StatsCard = styled(Card)(({ theme }) => ({
  background: 'white',
  borderRadius: 16,
  border: 'none',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  }
}));

const CleanTable = styled(TableContainer)(({ theme }) => ({
  background: 'white',
  borderRadius: 16,
  border: 'none',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
  overflow: 'hidden',
  '& .MuiTable-root': {
    minWidth: 650,
  },
  '& .MuiTableHead-root': {
    background: '#f8fafc',
  },
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: '#374151',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '20px 24px',
    borderBottom: 'none',
  },
  '& .MuiTableCell-body': {
    padding: '16px 24px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.875rem',
  },
  '& .MuiTableRow-root:last-child .MuiTableCell-body': {
    borderBottom: 'none',
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: '#f8fafc',
  }
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: '#3b82f6',
  color: 'white',
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  fontSize: '0.875rem',
  boxShadow: 'none',
  '&:hover': {
    background: '#2563eb',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
}));

const UserMenu = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    console.log("User logged out");
    await axios.post(`${import.meta.env.VITE_API_URL}/logout`, {withCredentials: true})
    window.location.href = '/login'; 
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        <Avatar sx={{ width: 36, height: 36, bgcolor: '#3b82f6', fontSize: '0.875rem', fontWeight: 600 }}>
          {user?.name?.charAt(0)}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { borderRadius: 2, mt: 1, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

const RecordModal = ({ open, onClose, record, onSave, domainId }) => {
  const [formData, setFormData] = useState({
    type: 'A',
    name: '',
    value: '',
    ttl: 3600,
  });
  const [loading, setLoading] = useState(false);

  const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'PTR'];

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
    } else {
      setFormData({ type: 'A', name: '', value: '', ttl: 3600 });
    }
  }, [record, open]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (record?.id) {
        await updateRecord(domainId, record.id, formData);
      } else {
        await addRecord(domainId, formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }
      }}
    >
      <DialogTitle sx={{ pb: 1, fontSize: '1.25rem', fontWeight: 600 }}>
        {record ? 'Edit DNS Record' : 'Add New DNS Record'}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Record Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Record Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  sx={{ borderRadius: 2 }}
                >
                  {recordTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="TTL (seconds)"
                type="number"
                value={formData.ttl}
                onChange={(e) => setFormData({ ...formData, ttl: parseInt(e.target.value) })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="@ for root domain, www for subdomain"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            fullWidth
            label="Value"
            multiline
            rows={3}
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="Enter the record value (IP address, domain, etc.)"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <PrimaryButton
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
        >
          {loading ? 'Saving...' : 'Save Record'}
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

const DeleteDialog = ({ open, onClose, onConfirm, record }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 3, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }
      }}
    >
      <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
        Delete DNS Record
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Typography sx={{ mb: 2 }}>
          Are you sure you want to delete this DNS record?
        </Typography>
        {record && (
          <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Type:</strong> {record.type}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Name:</strong> {record.name || '@'}
            </Typography>
            <Typography variant="body2">
              <strong>Value:</strong> {record.value}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>Cancel</Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const RecordsPage = ({ gUser, setGUser }) => {
  const { domainId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(gUser);
  
  const [domain, setDomain] = useState(null);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [domainData, recordsData, userData] = await Promise.all([
          fetchDomainDetails(domainId),
          fetchRecordsForDomain(domainId),
          fetchUser(user)
        ]);
        setDomain(domainData);
        setRecords(recordsData);
        setFilteredRecords(recordsData);
        setUser(userData)
        setGUser(userData)
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
        console.log(err)
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [domainId]);

  useEffect(() => {
    const filtered = records.filter(record => 
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
  }, [searchTerm, records]);


  const handleSaveRecord = async () => {
    try {
      const fetchedRecords = await fetchRecordsForDomain(domainId);
      setRecords(fetchedRecords);
      setSnackbar({ 
        open: true, 
        message: editingRecord ? 'Record updated successfully' : 'Record added successfully', 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to refresh records', severity: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteRecord(domainId, recordToDelete.id);
      const updatedRecords = records.filter(r => r.id !== recordToDelete.id);
      setRecords(updatedRecords);
      setSnackbar({ open: true, message: 'Record deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete record', severity: 'error' });
    }
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const getTypeColor = (type) => {
    const colors = {
      'A': '#3b82f6', 'AAAA': '#8b5cf6', 'CNAME': '#10b981', 
      'MX': '#f59e0b', 'TXT': '#06b6d4', 'NS': '#ef4444'
    };
    return colors[type] || '#6b7280';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', minWidth: '100vw' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar sx={{ py: 1 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <LanguageIcon sx={{ mr: 2, color: '#3b82f6' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, color: '#1f2937' }}>
            DNS Records
          </Typography>
          {user && <UserMenu user={user} />}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Domain Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            {domain?.domain_name || domainId}
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Manage DNS records for your domain
          </Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatsCard>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <StorageIcon sx={{ fontSize: 40, color: '#3b82f6', mb: 2 }} />
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
                  {records.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Total Records
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StatsCard>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <Typography sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>✓</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
                  Active
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Status
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StatsCard>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <TimerIcon sx={{ fontSize: 40, color: '#f59e0b', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
                  {new Date().toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Last Updated
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <TextField
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              flexGrow: 1,
              '& .MuiOutlinedInput-root': { 
                borderRadius: 2, 
                bgcolor: 'white',
                '& fieldset': { border: '1px solid #e2e8f0' }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6b7280' }} />
                </InputAdornment>
              ),
            }}
          />
          <PrimaryButton
            startIcon={<AddIcon />}
            onClick={() => { setEditingRecord(null); setModalOpen(true); }}
          >
            Add Record
          </PrimaryButton>
        </Box>

        {/* Records Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={40} sx={{ color: '#3b82f6' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : filteredRecords.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <StorageIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
              {searchTerm ? 'No matching records' : 'No DNS records'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              {searchTerm ? 'Try adjusting your search' : 'Click "Add Record" to get started'}
            </Typography>
          </Paper>
        ) : (
          <CleanTable>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>TTL</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Chip 
                        label={record.type}
                        size="small"
                        sx={{ 
                          bgcolor: getTypeColor(record.type) + '20',
                          color: getTypeColor(record.type),
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontFamily: 'monospace', fontWeight: 500, color: '#374151' }}>
                        {record.name || '@'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ 
                        fontFamily: 'monospace', 
                        color: '#6b7280',
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {record.value}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontFamily: 'monospace', color: '#6b7280' }}>
                        {record.ttl}s
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton 
                          size="small" 
                          onClick={() => { setEditingRecord(record); setModalOpen(true); }}
                          sx={{ color: '#3b82f6' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => { setRecordToDelete(record); setDeleteDialogOpen(true); }}
                          sx={{ color: '#ef4444' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CleanTable>
        )}
      </Container>

      {/* Modals */}
      <RecordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        record={editingRecord}
        onSave={handleSaveRecord}
        domainId={domainId}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        record={recordToDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RecordsPage;

