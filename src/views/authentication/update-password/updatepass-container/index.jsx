import { Grid, useTheme } from "@mui/material"
import UpdateFormPass from "../updatepass-form";
import { Helmet } from "react-helmet-async";
const ForgetContainer = () => {
  const theme = useTheme();
  return (
        <>
        <Helmet>
            <title>Change Password</title>
        </Helmet>
        <Grid container component="main" sx={{ display: 'flex' , flexDirection: 'column', justifyContent:'center', alignItems:'center', mt:20 }}>
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
                  marginBottom: '86px', 
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
                  <UpdateFormPass />
                </Grid>
            </Grid>
        </>
  )
}

export default ForgetContainer