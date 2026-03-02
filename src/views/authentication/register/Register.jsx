import { useState } from "react";
import {
  Box, Grid, TextField, Button, Typography, MenuItem,
  InputAdornment, IconButton, CircularProgress, Alert,
  useTheme, useMediaQuery
} from "@mui/material";
import { Visibility, VisibilityOff, PersonAddAlt1 } from "@mui/icons-material";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import OverlayImage from '../../../assets/company-logo/1.png';
import { http } from '../../../api/http';

const USER_LEVELS = ["Admin", "Supervisor", "Staff", "Viewer"];
const ROLES = ["admin", "manager", "employee", "guest"];

export default function Register() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery('(max-width:900px)');
  const isDark = theme.palette.appSettings?.paletteMode === 'dark';

  const primaryRed = '#C0392B';
  const darkRed = '#922B21';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    FullName: '',
    Username: '',
    Password: '',
    confirmPassword: '',
    designation: '',
    Position: '',
    Designation_Location: '',
    roles: 'employee',
    UserLevel: 'Staff',
    mainSuperVisorID: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.Password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.Password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.Username.length > 15) {
      setError("Username must be 15 characters or less.");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const response = await http.post('/register', payload);
      if (response.data.success) {
        setSuccess("User registered successfully! Redirecting to login...");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.data.message || "Registration failed.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      fontSize: 14,
      '&:hover fieldset': { borderColor: primaryRed },
      '&.Mui-focused fieldset': { borderColor: primaryRed },
    },
    '& label.Mui-focused': { color: primaryRed },
  };

  return (
    <>
      <Helmet><title>Register — CDJ Accounting Service</title></Helmet>

      <Grid
        container
        component="main"
        sx={{ height: '100vh', overflow: 'hidden' }}
      >
        {/* ─── LEFT PANEL ─── */}
        <Grid
          item xs={false} sm={false} md={6} lg={7.5} xl={9}
          sx={{
            display: { xs: 'none', sm: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: isDark
              ? 'linear-gradient(135deg, #1a0a0a 0%, #2d1515 45%, #1a1a2e 100%)'
              : 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 45%, #f0f4ff 100%)',
          }}
        >
          {/* Glow orbs */}
          <Box sx={{ position: 'absolute', top: '-10%', right: '-5%', width: '45%', height: '45%', borderRadius: '50%', background: `radial-gradient(circle, ${primaryRed}28 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', bottom: '-8%', left: '-5%', width: '40%', height: '40%', borderRadius: '50%', background: `radial-gradient(circle, ${primaryRed}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', top: '40%', left: '10%', width: '20%', height: '20%', borderRadius: '50%', background: 'radial-gradient(circle, #4A90E244 0%, transparent 70%)', pointerEvents: 'none' }} />

          <Box component="img" src={OverlayImage} alt="CDJ Illustration"
            sx={{ width: isSmallScreen ? '80%' : '78%', maxWidth: 620, height: 'auto', zIndex: 1, filter: isDark ? 'drop-shadow(0 24px 48px rgba(192,57,43,0.35))' : 'drop-shadow(0 24px 48px rgba(0,0,0,0.18))' }}
          />

          <Box sx={{ mt: 3, px: 8, textAlign: 'center', zIndex: 1 }}>
            <Typography sx={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)', fontStyle: 'italic', letterSpacing: '0.06em' }}>
              Trusted bookkeeping solutions for your business
            </Typography>
          </Box>

          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent 0%, ${primaryRed} 40%, ${darkRed} 60%, transparent 100%)` }} />
        </Grid>

        {/* ─── RIGHT PANEL ─── */}
        <Grid
          item xs={12} sm={12} md={6} lg={4.5} xl={3}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: 3,
            background: {
              xs: isDark
                ? `linear-gradient(rgba(22,28,36,0.88),rgba(22,28,36,0.88)) center/cover no-repeat, url(${OverlayImage})`
                : `linear-gradient(rgba(255,255,255,0.88),rgba(255,255,255,0.88)) center/cover no-repeat, url(${OverlayImage})`,
              md: 'inherit',
            },
          }}
        >
          <Box sx={{
            width: '100%',
            maxWidth: 480,
            py: 4,
            px: { xs: 2, sm: 4 },
            borderRadius: '20px',
            background: isDark ? 'rgb(33,43,54)' : '#fff',
            boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.1)',
          }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{
                width: 42, height: 42, borderRadius: '12px',
                background: `linear-gradient(135deg, ${primaryRed}, ${darkRed})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 14px ${primaryRed}55`,
              }}>
                <PersonAddAlt1 sx={{ color: '#fff', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 18, fontFamily: '"Georgia", serif', color: isDark ? '#fff' : '#1A1A2E' }}>
                  Create Account
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  CDJ Accounting Service
                </Typography>
              </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: 13 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', fontSize: 13 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Full Name */}
              <TextField fullWidth label="Full Name" name="FullName" value={form.FullName}
                onChange={handleChange} placeholder="Juan Dela Cruz" sx={inputSx} size="small" />

              {/* Username */}
              <TextField fullWidth label="Username *" name="Username" value={form.Username}
                onChange={handleChange} placeholder="max 15 chars" required
                inputProps={{ maxLength: 15 }} sx={inputSx} size="small" />

              {/* Password */}
              <TextField fullWidth label="Password *" name="Password" value={form.Password}
                onChange={handleChange} type={showPassword ? 'text' : 'password'}
                required sx={inputSx} size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(p => !p)}>
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Confirm Password */}
              <TextField fullWidth label="Confirm Password *" name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange} type={showConfirm ? 'text' : 'password'}
                required sx={inputSx} size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirm(p => !p)}>
                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Designation */}
              <TextField fullWidth label="Designation *" name="designation" value={form.designation}
                onChange={handleChange} placeholder="e.g. System Administrator" required sx={inputSx} size="small" />

              {/* Position */}
              <TextField fullWidth label="Position" name="Position" value={form.Position}
                onChange={handleChange} placeholder="e.g. IT Officer" sx={inputSx} size="small" />

              {/* Location */}
              <TextField fullWidth label="Location / Department" name="Designation_Location" value={form.Designation_Location}
                onChange={handleChange} placeholder="e.g. Head Office" sx={inputSx} size="small" />

              {/* Role & User Level */}
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <TextField select fullWidth label="Role *" name="roles" value={form.roles}
                    onChange={handleChange} required sx={inputSx} size="small">
                    {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField select fullWidth label="User Level *" name="UserLevel" value={form.UserLevel}
                    onChange={handleChange} required sx={inputSx} size="small">
                    {USER_LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>

              {/* Supervisor ID */}
              <TextField fullWidth label="Supervisor ID *" name="mainSuperVisorID" value={form.mainSuperVisorID}
                onChange={handleChange} type="number" required sx={inputSx} size="small" />

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.3,
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${primaryRed}, ${darkRed})`,
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.04em',
                  textTransform: 'none',
                  boxShadow: `0 4px 16px ${primaryRed}44`,
                  '&:hover': { background: `linear-gradient(135deg, ${darkRed}, #7B241C)` },
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Register User'}
              </Button>

              <Typography sx={{ mt: 2, textAlign: 'center', fontSize: 13, color: 'text.secondary' }}>
                Already have an account?{' '}
                <Box component="span"
                  onClick={() => navigate('/login')}
                  sx={{ color: primaryRed, fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                  Sign In
                </Box>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}