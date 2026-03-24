import { Grid, Typography, useTheme } from "@mui/material"
import ForgetpassForm from "../forgetpass-form";
import Forgotpassowrdicon from "../../../../components/svg-icons/Forgotpassowrdicon";
import { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import OverLayImage from '../../../../assets/images/overlay_2.jpg'

const ForgetContainer = () => {
  const theme = useTheme();
  return (
      <Fragment>
        <Helmet>
          <title>CU Admin: Forgot Password</title>
        </Helmet>
        <Grid container component="main" sx={{ display: 'flex' , flexDirection: 'column', height: '100vh' }}>
            <Grid 
            item 
            xs={12} 
            sm={12} 
            md={12} 
            lg={12} 
            xl={12}
            sx={{
                display: 'flex', 
                flexDirection: 'column', 
                WebkitBoxFlex: 1, 
                flexGrow: 1, 
                WebkitBoxAlign: 1, 
                alignItems: 'center',
                WebkitBoxPack: 'center',
                justifyContent: 'center',
                background: theme.palette.appSettings.paletteMode === 'dark' ? `linear-gradient(rgba(22, 28, 36, 0.94), rgba(22, 28, 36, 0.94)) center center / cover no-repeat, url(${OverLayImage})` : `linear-gradient(rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88)) center center / cover no-repeat, url(${OverLayImage})`,
                backgroundPosition: 'center',
            }}
            >
                <Grid item xs={12} md={6} lg={6} xl={6} sx={{ 
                 marginLeft: '24px',
                 marginRight: '24px', 
                 width: {
                  xs: '390px',
                  sm: '390px',
                  md: '440px',
                  lg: '440px'
                 },  
                 textAlign: 'center', 
                 marginTop: '70px', 
                 marginBottom: '96px', 
                 display: 'flex', 
                 flexDirection: 'column', 
                 alignItems: 'center', 
                 justifyContent: 'center', 
                 gap: '20px',
                 background: theme.palette.appSettings.paletteMode === 'dark' ? 'rgb(33, 43, 54)' : 'rgb(255, 255, 255)',
                 padding: 2,
                 borderRadius: '16px',
                 }}
                 >
                  <Forgotpassowrdicon />
                  <Typography variant="h4">Forgot your password?</Typography>
                  <Typography fontSize="14px">Please enter the ID Number associated with your account and We will email you a link to reset your password.</Typography>
                  <ForgetpassForm />
                </Grid>
            </Grid>
        </Grid>
      </Fragment>
  )
}

export default ForgetContainer