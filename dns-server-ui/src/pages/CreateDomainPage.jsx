import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Grid,
  InputAdornment,
  AlertTitle
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Language as LanguageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Cloud as CloudIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  border: `2px solid transparent`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiStepLabel-root .Mui-completed': {
    color: theme.palette.primary.main,
  },
  '& .MuiStepLabel-root .Mui-active': {
    color: theme.palette.primary.main,
  },
}));

const CreateDomainPage = ({user}) => {
  if (user === null || !user.id) {
    window.location.href = "/dashboard";
    return null;
  }

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [domainData, setDomainData] = useState({
    domain: '',
    registrar: '',
    autoSSL: true,
    cdnEnabled: false,
    description: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [domainValidation, setDomainValidation] = useState({
    isValid: false,
    isChecking: false,
    message: ''
  });

  const steps = ['Domain Details', 'Configuration', 'Review & Create'];
  
  const registrars = [
    'GoDaddy',
    'Namecheap',
    'CloudFlare',
    'Google Domains',
    'Amazon Route 53',
    'Other'
  ];

  const validateDomain = (domain) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const checkDomainAvailability = async (domain) => {
    if (!validateDomain(domain)) {
      setDomainValidation({
        isValid: false,
        isChecking: false,
        message: 'Invalid domain format'
      });
      return;
    }

    setDomainValidation(prev => ({ ...prev, isChecking: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const isAvailable = Math.random() > 0.3;
      
      setDomainValidation({
        isValid: isAvailable,
        isChecking: false,
        message: isAvailable ? 'Domain is available for DNS management' : 'Domain not found or not accessible'
      });
    } catch (error) {
      setDomainValidation({
        isValid: false,
        isChecking: false,
        message: 'Error checking domain availability'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setDomainData(prev => ({
      ...prev,
      [field]: value
    }));

    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    if (field === 'domain' && value.length > 3) {
      setTimeout(() => {
        checkDomainAvailability(value);
      }, 1000);
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!domainData.domain) {
        errors.domain = 'Domain name is required';
      } else if (!validateDomain(domainData.domain)) {
        errors.domain = 'Please enter a valid domain name';
      } else if (!domainValidation.isValid && !domainValidation.isChecking) {
        errors.domain = 'Domain validation failed';
      }
    }
    
    if (step === 1) {
      if (!domainData.registrar) {
        errors.registrar = 'Please select a registrar';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/domains`,
        {"domain_name": domainData.domain},
        { withCredentials: true }
      );

      if (response.status === 201) {
        setSuccess('Domain created successfully!');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        throw new Error('Failed to create domain');
      }
    } catch (error) {
      setError('Failed to create domain. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ space: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Enter Domain Information
            </Typography>
            
            <TextField
              fullWidth
              label="Domain Name"
              placeholder="example.com"
              value={domainData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              error={!!validationErrors.domain}
              helperText={validationErrors.domain}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {domainValidation.isChecking ? (
                      <CircularProgress size={20} />
                    ) : domainValidation.message ? (
                      domainValidation.isValid ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )
                    ) : null}
                  </InputAdornment>
                )
              }}
            />

            {domainValidation.message && (
              <Alert 
                severity={domainValidation.isValid ? 'success' : 'error'}
                sx={{ mb: 3 }}
                icon={domainValidation.isValid ? <CheckCircleIcon /> : <ErrorIcon />}
              >
                {domainValidation.message}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Description (Optional)"
              multiline
              rows={3}
              placeholder="Brief description of this domain's purpose..."
              value={domainData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              sx={{ mb: 3 }}
            />

            <Alert severity="info" icon={<InfoIcon />}>
              <AlertTitle>Important Note</AlertTitle>
              You'll need to update your domain's nameservers to point to our DNS servers after creation.
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ space: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Configuration Options
            </Typography>

            <FormControl fullWidth sx={{ mb: 4 }} error={!!validationErrors.registrar}>
              <InputLabel>Domain Registrar</InputLabel>
              <Select
                value={domainData.registrar}
                onChange={(e) => handleInputChange('registrar', e.target.value)}
                label="Domain Registrar"
              >
                {registrars.map((registrar) => (
                  <MenuItem key={registrar} value={registrar}>
                    {registrar}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.registrar && (
                <FormHelperText>{validationErrors.registrar}</FormHelperText>
              )}
            </FormControl>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Additional Features
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={domainData.autoSSL}
                      onChange={(e) => handleInputChange('autoSSL', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Auto SSL Certificate
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Automatically provision SSL certificates for this domain
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start' }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={domainData.cdnEnabled}
                      onChange={(e) => handleInputChange('cdnEnabled', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        CDN Integration
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Enable content delivery network for better performance
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start' }}
                />
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FeatureCard>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <LanguageIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Advanced DNS
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Full DNS record management with real-time updates
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <FeatureCard>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <SecurityIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Security First
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Built-in DDoS protection and security monitoring
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ space: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Review Your Configuration
            </Typography>

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Domain Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <LanguageIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Domain Name"
                    secondary={domainData.domain}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CloudIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Registrar"
                    secondary={domainData.registrar}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  />
                </ListItem>
                {domainData.description && (
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Description"
                      secondary={domainData.description}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Enabled Features
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {domainData.autoSSL && (
                  <Chip
                    icon={<SecurityIcon />}
                    label="Auto SSL"
                    color="success"
                    variant="outlined"
                  />
                )}
                {domainData.cdnEnabled && (
                  <Chip
                    icon={<SpeedIcon />}
                    label="CDN Enabled"
                    color="primary"
                    variant="outlined"
                  />
                )}
                <Chip
                  icon={<LanguageIcon />}
                  label="DNS Management"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Paper>

            <Alert severity="info" icon={<InfoIcon />}>
              <AlertTitle>Action Required: Update Nameservers</AlertTitle>
              To complete the setup, please log in to your registrar ({domainData.registrar || 'your registrar'}) and update your nameservers to:
              <List dense sx={{ pt: 1, '& .MuiListItem-root': { py: 0.2 } }}>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CloudIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="ns1.aa45.de" 
                    primaryTypographyProps={{ style: { fontWeight: 500 } }} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CloudIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="ns2.aa45.de" 
                    primaryTypographyProps={{ style: { fontWeight: 500 } }} 
                  />
                </ListItem>
              </List>
              This step is crucial for our service to manage your domain's DNS records.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', minWidth: '100vw' }}>
      {/* Header */}
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={goBack}
            sx={{ mr: 2 }}
            color="inherit"
          >
            <ArrowBackIcon />
          </IconButton>
          <LanguageIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 600 }}>
            Create New Domain
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        {success ? (
          <StyledPaper sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
              Domain Created Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Redirecting you to the dashboard...
            </Typography>
            <CircularProgress size={40} />
          </StyledPaper>
        ) : (
          <StyledPaper>
            {/* Stepper */}
            <StyledStepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </StyledStepper>

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }} 
                onClose={() => setError('')}
                action={
                  <Button color="inherit" size="small" onClick={() => setError('')}>
                    Dismiss
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {/* Step Content */}
            <Box sx={{ mb: 4 }}>
              {renderStepContent(activeStep)}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                Back
              </Button>
              
              <Button
                variant="contained"
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                disabled={loading || (domainValidation.isChecking && activeStep === 0)}
                sx={{ textTransform: 'none', minWidth: 140 }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? '' : activeStep === steps.length - 1 ? 'Create Domain' : 'Next'}
              </Button>
            </Box>
          </StyledPaper>
        )}
      </Container>
    </Box>
  );
};

export default CreateDomainPage;

