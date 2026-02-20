import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import AuthForm from "../auth-form";
import { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import OverlayImage from '../../../../assets/images/overlay_2.jpg'
import OverlayImageTwo from '../../../../assets/images/overlay_4.jpg'


export default function SignInSide() {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const isSmallScreen = useMediaQuery('(max-width:900px)');
  return (
    <Fragment>
        <Helmet>
          <title>San Fernando Water Level Monitoring: Login</title>
        </Helmet>
        <Grid container component="main" sx={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
        <Grid 
          item
          xs={false}
          sm={false}
          md={6}
          lg={7.5}
          xl={9}
          sx={{
              display: 'flex', 
              flexDirection: 'column', 
              WebkitBoxFlex: 1, 
              flexGrow: 1, 
              gap: '80px',
              WebkitBoxAlign: 1, 
              alignItems: 'center',
              WebkitBoxPack: 'center',
              justifyContent: 'center',
              background: theme.palette.appSettings.paletteMode === 'dark' ? `linear-gradient(rgba(22, 28, 36, 0.94), rgba(22, 28, 36, 0.94)) center center / cover no-repeat, url(${OverlayImage})` : `linear-gradient(rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88)) center center / cover no-repeat, url(${OverlayImage})`,
              backgroundPosition: 'center'
          }}
        >
           {!isMobile && (
              <>
                <Box component="img" src={''} alt="Login" sx={{ maxWidth: isSmallScreen ? '80%' : '100%', height: { xs: '100%' , xl: '100%'},}}></Box>
              </>
           )}
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4.5} xl={3} sx={{ padding:2, 
          background: {
            xs: theme.palette.appSettings.paletteMode === 'dark' ? `linear-gradient(rgba(22, 28, 36, 0.74), rgba(22, 28, 36, 0.74)) center center / cover no-repeat, url(${OverlayImageTwo})` : `linear-gradient(rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.74)) center center / cover no-repeat, url(${OverlayImageTwo})`,
            sm: theme.palette.appSettings.paletteMode === 'dark' ? `linear-gradient(rgba(22, 28, 36, 0.74), rgba(22, 28, 36, 0.74)) center center / cover no-repeat, url(${OverlayImageTwo})` : `linear-gradient(rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.74)) center center / cover no-repeat, url(${OverlayImageTwo})`,
            md: 'inherit',
            lg: 'inherit'
          },
          }}>
          <Box
            sx={{
              padding: {
                xs: 2,
                sm: 2,
                lg: 2
              },
              my: 25,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: {
                xs: theme.palette.appSettings.paletteMode === 'dark' ? 'rgb(33, 43, 54)' : 'rgb(255, 255, 255)',
                sm: theme.palette.appSettings.paletteMode === 'dark' ? 'rgb(33, 43, 54)' : 'rgb(255, 255, 255)',
                md: 'inherit',
                lg: 'inherit'
              },
              borderRadius: '16px',
              width: {
                xs: '100%',
                sm: '480px',
                md: '100%',
                lg: '100%'
              },
              marginLeft: {
                xs: '0px',
                sm: 'auto'
              },
              marginRight: {
                xs: '0px',
                sm: 'auto'
              },
            }}
          >
              <AuthForm />
          </Box>
        </Grid>
      </Grid>
    </Fragment>
  );
}