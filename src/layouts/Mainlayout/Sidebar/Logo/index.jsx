import { Box, Stack, Typography, useTheme } from "@mui/material"
import sanfern from '../../../../assets/company-logo/sdj.png'
import { tokens } from "../../../../themes/palette";

const SidebarLogo = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.appSettings);
  return (
    <Stack sx={{ padding: 
    theme.palette.appSettings.layout === 'collapsed' ? 1.5 : 4.5, 
    display: 'flex', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    transition: theme.palette.layout === 'collapsed' ? 
    theme.transitions.create('padding', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }) :
    theme.transitions.create('padding', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }) 
    }}>
        <Box component="div"
            sx={{
                width: 70,
                height: 60,
                display: 'inline-flex',
            }}
        >
            <img style={{borderRadius:230}} src={sanfern} />
        </Box>
        <Box 
        sx={{ 
            display: theme.palette.appSettings.layout === 'collapsed' ? 'none' : 'flex', 
            flexDirection: 'row', 
            WebkitBoxAlign: 'center', 
            alignItems: 'center', 
            WebkitBoxFlex: 1, 
            flexGrow: 1, 
            color: `${colors.cards[300]}`  
            }}> 
            <Box sx={{ margin: '0px 0px 0px 16px' }}>
                <Box sx={{ WebkitBoxFlex: 1, flexGrow: 1 }}>
                    <Typography fontSize={12}>CDJ</Typography>
                    <Typography fontSize={12}>Accounting Services</Typography>
                </Box>
            </Box>        
        </Box>
    </Stack>
  )
}

export default SidebarLogo