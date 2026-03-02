import { Box, Grid, useMediaQuery, useTheme, Typography } from "@mui/material";
import AuthForm from "../auth-form";
import { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import OverlayImage from '../../../../assets/company-logo/1.png';
import OverlayImageTwo from '../../../../assets/company-logo/1.png';

export default function SignInSide() {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const isSmallScreen = useMediaQuery('(max-width:900px)');
  const isDark = theme.palette.appSettings.paletteMode === 'dark';

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
            pointerEvents: 'none',
          }} />
          <Box sx={{
            position: 'absolute', bottom: '-8%', left: '-5%',
            width: '40%', height: '40%', borderRadius: '50%',
            background: `radial-gradient(circle, ${primaryRed}20 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <Box sx={{
            position: 'absolute', top: '40%', left: '10%',
            width: '20%', height: '20%', borderRadius: '50%',
            background: `radial-gradient(circle, #4A90E244 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Main illustration */}
          <Box
            component="img"
            src={OverlayImage}
            alt="CDJ Bookkeeping Illustration"
            sx={{
              width: isSmallScreen ? '80%' : '78%',
              maxWidth: 620,
              height: 'auto',
              position: 'relative',
              zIndex: 1,
              filter: isDark
                ? 'drop-shadow(0 24px 48px rgba(192,57,43,0.35))'
                : 'drop-shadow(0 24px 48px rgba(0,0,0,0.18))',
            }}
          />

          {/* Tagline */}
          <Box sx={{ mt: 3, px: 8, textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography sx={{
              fontSize: 13,
              color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
              fontStyle: 'italic',
              letterSpacing: '0.06em',
            }}>
              Trusted bookkeeping solutions for your business
            </Typography>
          </Box>

          {/* Bottom accent bar */}
          <Box sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
            background: `linear-gradient(90deg, transparent 0%, ${primaryRed} 40%, ${darkRed} 60%, transparent 100%)`,
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
                ? `linear-gradient(rgba(22, 28, 36, 0.74), rgba(22, 28, 36, 0.74)) center center / cover no-repeat, url(${OverlayImageTwo})`
                : `linear-gradient(rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.74)) center center / cover no-repeat, url(${OverlayImageTwo})`,
              sm: isDark
                ? `linear-gradient(rgba(22, 28, 36, 0.74), rgba(22, 28, 36, 0.74)) center center / cover no-repeat, url(${OverlayImageTwo})`
                : `linear-gradient(rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.74)) center center / cover no-repeat, url(${OverlayImageTwo})`,
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