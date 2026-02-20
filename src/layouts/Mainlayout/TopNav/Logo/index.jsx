import { Box, Stack, useTheme } from "@mui/material"
import sanfern from '../../../../assets/company-logo/sdj.png'

const TopNavLogo = () => {
  const theme = useTheme();
  return (
    <Stack sx={{ 
        display:
        theme.palette.appSettings.layout === 'vertical' ? 'none'
        :
        theme.palette.appSettings.layout === 'horizontal' ? 'flex' 
        : 
        'none', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        mr: 3
        }}>
            <Box component="div"
                sx={{
                    width: 40,
                    height: 40,
                    display: 'inline-flex',
                }}
            >
                <img src={sanfern} />
            </Box>
    </Stack>
  )
}

export default TopNavLogo