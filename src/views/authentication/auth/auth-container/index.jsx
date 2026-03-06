import { Box, Grid, useMediaQuery, useTheme, Typography } from "@mui/material";
import AuthForm from "../auth-form";
import { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import LightImage from '../../../../assets/company-logo/lightmode.png';
import DarkImage from '../../../../assets/company-logo/darkmode.png';

export default function SignInSide() {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const isSmallScreen = useMediaQuery('(max-width:900px)');
  const isDark = theme.palette.appSettings.paletteMode === 'dark';

  // ── Switch image based on theme ──
  const OverlayImage = isDark ? DarkImage : LightImage;

  const primaryRed = '#C0392B';
  const darkRed = '#922B21';

  return (
    <Fragment>
      <Helmet>
        <title>CDJ Accounting Service</title>
      </Helmet>

      <Grid
        container
        component="main"
        sx={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'hidden' }}
      >
        {/* ─── LEFT PANEL ─── */}
        <Grid
          item
          xs={false}
          sm={false}
          md={6}
          lg={7.5}
          xl={9}
          sx={{
            display: { xs: 'none', sm: 'none', md: 'flex' },
            flexDirection: 'column',
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: isDark
              ? 'linear-gradient(135deg, #1a0a0a 0%, #2d1515 45%, #1a1a2e 100%)'
              : 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 45%, #f0f4ff 100%)',
          }}
        >
          {/* Soft glow orbs */}
          <Box sx={{
            position: 'absolute', top: '-10%', right: '-5%',
            width: '45%', height: '45%', borderRadius: '50%',
            background: `radial-gradient(circle, ${primaryRed}28 0%, transparent 70%)`,
            pointerEvents: 'none', zIndex: 1,
          }} />
          <Box sx={{
            position: 'absolute', bottom: '-8%', left: '-5%',
            width: '40%', height: '40%', borderRadius: '50%',
            background: `radial-gradient(circle, ${primaryRed}20 0%, transparent 70%)`,
            pointerEvents: 'none', zIndex: 1,
          }} />
          <Box sx={{
            position: 'absolute', top: '40%', left: '10%',
            width: '20%', height: '20%', borderRadius: '50%',
            background: `radial-gradient(circle, #4A90E244 0%, transparent 70%)`,
            pointerEvents: 'none', zIndex: 1,
          }} />

          {/* ── Main illustration — switches between light/dark ── */}
          <Box
            component="img"
            src={OverlayImage}
            alt="CDJ Bookkeeping Illustration"
            sx={{
              width: '100%',
              maxWidth: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
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

        {/* ─── RIGHT PANEL — AuthForm ─── */}
        <Grid
          item
          xs={12}
          sm={12}
          md={6}
          lg={4.5}
          xl={3}
          sx={{
            padding: 2,
            background: {
              xs: isDark
                ? `linear-gradient(rgba(22, 28, 36, 0.74), rgba(22, 28, 36, 0.74)) center center / cover no-repeat, url(${OverlayImage})`
                : `linear-gradient(rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.74)) center center / cover no-repeat, url(${OverlayImage})`,
              sm: isDark
                ? `linear-gradient(rgba(22, 28, 36, 0.74), rgba(22, 28, 36, 0.74)) center center / cover no-repeat, url(${OverlayImage})`
                : `linear-gradient(rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.74)) center center / cover no-repeat, url(${OverlayImage})`,
              md: 'inherit',
              lg: 'inherit',
            },
          }}
        >
          <Box
            sx={{
              padding: { xs: 2, sm: 2, lg: 2 },
              my: 25,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: {
                xs: isDark ? 'rgb(33, 43, 54)' : 'rgb(255, 255, 255)',
                sm: isDark ? 'rgb(33, 43, 54)' : 'rgb(255, 255, 255)',
                md: 'inherit',
                lg: 'inherit',
              },
              borderRadius: '16px',
              width: {
                xs: '100%',
                sm: '480px',
                md: '100%',
                lg: '100%',
              },
              marginLeft:  { xs: '0px', sm: 'auto' },
              marginRight: { xs: '0px', sm: 'auto' },
            }}
          >
            <AuthForm />
          </Box>
        </Grid>
      </Grid>
    </Fragment>
  );
}