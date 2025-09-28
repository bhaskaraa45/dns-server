import React, { useState, useEffect, use } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper
} from "@mui/material";
import {
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Language as LanguageIcon,
  Timeline as TimelineIcon,
  Storage as StorageIcon,
  DnsOutlined as DnsIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.primary.main}05)`,
  border: `1px solid ${theme.palette.primary.main}20`,
}));

const DashboardPage = ({gUser, setGUser}) => {
  const [domains, setDomains] = useState([]);
  const [user, setUser] = useState(gUser);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndDomains = async () => {
      setLoading(true);
      try {
        await fetchData();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndDomains();
  }, []);

  async function fetchDomains() {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/domains`, { withCredentials: true });
      if (response.status !== 200) {
        window.location.href = "/";
        return;
      }
      setDomains(response.data);
    } catch (error) {
      window.location.href = "/";
      console.error("Error fetching domains:", error);
    }
  }

  async function fetchUser() {
    if (user && user.id) {
      return;
    }
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/me`, { withCredentials: true });
      if (response.status !== 200) {
        window.location.href = "/";
        return;
      }
      setUser(response.data);
      setGUser(response.data);
    } catch (error) {
      window.location.href = "/";
      console.error("Error fetching user:", error);
    }
  }

  async function fetchData() {
    await Promise.all([fetchUser(), fetchDomains()]);
  }

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setUser(null);
    handleUserMenuClose();
  };

  const handleCreateDomain = () => {
    navigate('/new');
  };

  const handleViewRecords = (domainId) => {
    navigate(`/domains/${domainId}/records`);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          minWidth: '100vw',
          backgroundColor: '#f5f5f5'
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', minWidth: '100vw' }}>
      {/* Header */}
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <LanguageIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 600 }}>
            DNS Manager
          </Typography>
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 2, textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {getInitials(user.name)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleUserMenuClose}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your domains and DNS records
          </Typography>
        </Box>

        {domains.length > 0 ? (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <StatsCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LanguageIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Total Domains
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {domains.length}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StatsCard>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <StatsCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimelineIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Active Domains
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {domains.filter((d) => d.nsAccess).length}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StatsCard>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <StatsCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StorageIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Total Records
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {domains.reduce((total, domain) => total + domain.records, 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StatsCard>
              </Grid>
            </Grid>

            {/* Domains List */}
            <Paper elevation={1}>
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Your Domains
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateDomain}
                  sx={{ textTransform: 'none' }}
                >
                  Add Domain
                </Button>
              </Box>
              
              <Box>
                {domains.map((domain, index) => (
                  <Box key={domain.id}>
                    <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            mr: 2
                          }}
                        >
                          <LanguageIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {domain.domain_name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" color="text.secondary">
                              {domain.records} records
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Updated {domain.updated_at}
                            </Typography>
                            <Chip
                              label={domain.verified ? 'Active' : 'Inactive'}
                              size="small"
                              color={domain.verified ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<DnsIcon />}
                        onClick={() => handleViewRecords(domain.id)}
                        sx={{ textTransform: 'none' }}
                      >
                        Manage DNS
                      </Button>
                    </Box>
                    {index < domains.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>
            </Paper>
          </>
        ) : (
          /* Empty State */
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Paper elevation={1} sx={{ p: 8, maxWidth: 500, mx: 'auto' }}>
              <LanguageIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                No domains yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Get started by adding your first domain to manage DNS records.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleCreateDomain}
                sx={{ textTransform: 'none', py: 1.5, px: 3 }}
              >
                Add Your First Domain
              </Button>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DashboardPage;