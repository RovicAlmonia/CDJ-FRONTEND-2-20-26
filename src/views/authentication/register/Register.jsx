import { useState } from "react";
import {
  Box, Grid, TextField, Button, Typography, MenuItem,
  InputAdornment, IconButton, CircularProgress, Alert,
  useTheme, useMediaQuery
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import LightImage from '../../../assets/company-logo/lightmode.png';
import DarkImage  from '../../../assets/company-logo/darkmode.png';
import { http } from '../../../api/http';

const USER_LEVELS = ["Admin", "Supervisor", "Staff", "Viewer"];
const ROLES = ["admin", "manager", "employee", "guest"];

export default function Register() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.appSettings?.paletteMode === 'dark';

  const OverlayImage = isDark ? DarkImage : LightImage;

  // ── Palette (matches Login) ──
  const primaryRed = '#C0392B';
  const darkRed    = '#922B21';
  const accentGold = '#C9A84C';

  const borderColor  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const subtextColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const labelColor   = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');

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
    setError(''); setSuccess('');
    if (form.Password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.Password.length < 6)               { setError("Password must be at least 6 characters."); return; }
    if (form.Username.length > 15)              { setError("Username must be 15 characters or less."); return; }
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

  const fieldSx = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      fontSize: 14,
      '& fieldset': { borderColor: dividerColor },
      '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' },
      '&.Mui-focused fieldset': { borderColor: primaryRed, borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': { fontSize: 13.5, color: labelColor },
    '& .MuiInputLabel-root.Mui-focused': { color: primaryRed },
    '& .MuiFormHelperText-root': { fontSize: 11.5 },
    '& .MuiSelect-icon': { color: labelColor },
  };

  return (
    <>
      <Helmet><title>Register — CDJ Accounting Service</title></Helmet>

      <Grid
        container
        component="main"
        sx={{ height: '100vh', overflow: 'hidden' }}
      >
        {/* ══════════════════════════════════
            LEFT PANEL  (identical to Login)
        ══════════════════════════════════ */}
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
            borderRight: `1px solid ${borderColor}`,
          }}
        >
          {/* Glow orbs */}
          <Box sx={{ position: 'absolute', top: '-10%', right: '-5%', width: '45%', height: '45%', borderRadius: '50%', background: `radial-gradient(circle, ${primaryRed}28 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 1 }} />
          <Box sx={{ position: 'absolute', bottom: '-8%', left: '-5%', width: '40%', height: '40%', borderRadius: '50%', background: `radial-gradient(circle, ${primaryRed}20 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 1 }} />
          <Box sx={{ position: 'absolute', top: '40%', left: '10%', width: '20%', height: '20%', borderRadius: '50%', background: `radial-gradient(circle, #4A90E244 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 1 }} />

          {/* Fullscreen illustration */}
          <Box
            component="img"
            src={OverlayImage}
            alt="CDJ Illustration"
            sx={{
              width: '100%',
              maxWidth: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0, left: 0,
              zIndex: 0,
            }}
          />

          {/* Bottom accent bar */}
          <Box sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
            background: `linear-gradient(90deg, transparent 0%, ${primaryRed} 40%, ${darkRed} 60%, transparent 100%)`,
            zIndex: 2,
          }} />
        </Grid>

        {/* ══════════════════════════════════
            RIGHT PANEL
        ══════════════════════════════════ */}
        <Grid
          item xs={12} sm={12} md={6} lg={4.5} xl={3}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: 2,
            background: {
              xs: isDark
                ? `linear-gradient(rgba(22,28,36,0.74),rgba(22,28,36,0.74)) center/cover no-repeat, url(${OverlayImage})`
                : `linear-gradient(rgba(255,255,255,0.74),rgba(255,255,255,0.74)) center/cover no-repeat, url(${OverlayImage})`,
              sm: isDark
                ? `linear-gradient(rgba(22,28,36,0.74),rgba(22,28,36,0.74)) center/cover no-repeat, url(${OverlayImage})`
                : `linear-gradient(rgba(255,255,255,0.74),rgba(255,255,255,0.74)) center/cover no-repeat, url(${OverlayImage})`,
              md: 'inherit',
              lg: 'inherit',
            },
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 440,
              py: { xs: 3, md: 4 },
              px: { xs: 2, sm: 3, md: 4 },
              borderRadius: { xs: '16px', md: 0 },
              background: {
                xs: isDark ? 'rgb(33,43,54)' : 'rgb(255,255,255)',
                sm: isDark ? 'rgb(33,43,54)' : 'rgb(255,255,255)',
                md: 'inherit',
                lg: 'inherit',
              },
              boxShadow: {
                xs: isDark ? '0 8px 32px rgba(0,0,0,0.50)' : '0 8px 32px rgba(0,0,0,0.10)',
                md: 'none',
              },
            }}
          >

            {/* ── Header ── */}
            <Box sx={{ mb: 3, textAlign: 'left' }}>
              <Typography
                sx={{
                  fontSize: { xs: 22, md: 26 },
                  fontWeight: 700,
                  color: isDark ? '#fff' : '#1C1C1E',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                Create Account
              </Typography>
              <Typography sx={{ fontSize: 13, color: subtextColor }}>
                Fill in the details below to register a new user.
              </Typography>
              {/* Red underline accent — matches Login's bottom bar style */}
              <Box sx={{
                mt: 1.5,
                width: 40,
                height: 3,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${primaryRed}, ${accentGold})`,
              }} />
            </Box>

            {/* ── Alerts ── */}
            {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: '8px', fontSize: 12.5 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px', fontSize: 12.5 }}>{success}</Alert>}

            {/* ── Form ── */}
            <Box component="form" onSubmit={handleSubmit}>

              <TextField fullWidth label="Full Name" name="FullName" value={form.FullName}
                onChange={handleChange} placeholder="Juan Dela Cruz"
                sx={fieldSx} size="small" />

              <TextField fullWidth label="Username *" name="Username" value={form.Username}
                onChange={handleChange} placeholder="max 15 characters"
                required inputProps={{ maxLength: 15 }} sx={fieldSx} size="small" />

              <TextField fullWidth label="Password *" name="Password" value={form.Password}
                onChange={handleChange} type={showPassword ? 'text' : 'password'}
                required sx={fieldSx} size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(p => !p)} sx={{ color: subtextColor }}>
                        {showPassword ? <VisibilityOff sx={{ fontSize: 17 }} /> : <Visibility sx={{ fontSize: 17 }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <TextField fullWidth label="Confirm Password *" name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange} type={showConfirm ? 'text' : 'password'}
                required sx={fieldSx} size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirm(p => !p)} sx={{ color: subtextColor }}>
                        {showConfirm ? <VisibilityOff sx={{ fontSize: 17 }} /> : <Visibility sx={{ fontSize: 17 }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <TextField fullWidth label="Designation *" name="designation" value={form.designation}
                onChange={handleChange} placeholder="e.g. System Administrator"
                required sx={fieldSx} size="small" />

              <TextField fullWidth label="Position" name="Position" value={form.Position}
                onChange={handleChange} placeholder="e.g. IT Officer"
                sx={fieldSx} size="small" />

              <TextField fullWidth label="Location / Department" name="Designation_Location" value={form.Designation_Location}
                onChange={handleChange} placeholder="e.g. Head Office"
                sx={fieldSx} size="small" />

              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <TextField select fullWidth label="Role *" name="roles" value={form.roles}
                    onChange={handleChange} required sx={fieldSx} size="small">
                    {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField select fullWidth label="User Level *" name="UserLevel" value={form.UserLevel}
                    onChange={handleChange} required sx={fieldSx} size="small">
                    {USER_LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>

              <TextField fullWidth label="Supervisor ID *" name="mainSuperVisorID" value={form.mainSuperVisorID}
                onChange={handleChange} type="number"
                required sx={fieldSx} size="small" />

              {/* Submit — identical style to Login's Sign In button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 0.5,
                  height: 46,
                  borderRadius: '8px',
                  background: `linear-gradient(135deg, ${primaryRed} 0%, ${darkRed} 100%)`,
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  boxShadow: `0 4px 16px ${primaryRed}40`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${darkRed} 0%, #5B1A14 100%)`,
                    boxShadow: `0 6px 20px ${primaryRed}55`,
                  },
                  '&.Mui-disabled': { opacity: 0.6 },
                }}
              >
                {loading
                  ? <CircularProgress size={20} sx={{ color: '#fff' }} />
                  : 'Register User'
                }
              </Button>

              {/* Footer */}
              <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${dividerColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: 12.5, color: subtextColor }}>
                  Already have an account?{' '}
                  <Box
                    component="span"
                    onClick={() => navigate('/login')}
                    sx={{
                      color: primaryRed,
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': { color: accentGold, textDecoration: 'underline' },
                      transition: 'color 0.2s',
                    }}
                  >
                    Sign In
                  </Box>
                </Typography>
                <Typography sx={{ fontSize: 10.5, letterSpacing: '0.06em', color: subtextColor }}>
                  © {new Date().getFullYear()} CDJ Accounting Service. All rights reserved.
                </Typography>
              </Box>

            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}