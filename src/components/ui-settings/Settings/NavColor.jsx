import { Box, Button, Paper, Typography, useTheme } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { AppSettingsContext } from "../../../themes";
import { BoxShadowBtnSettings, tokens } from "../../../themes/palette";

const NavColor = () => {
  const theme = useTheme();
  const btnColor = tokens(theme.palette.appSettings);
  const btnShadow = BoxShadowBtnSettings(theme.palette.appSettings);
  const setNavColor = useContext(AppSettingsContext);
  const [navBlendIn, setNavBlendIn] = useState(false);
  const [navDiscrete, setDiscrete] = useState(false);
  const [navEvident, setNavEvident] = useState(false);

  const toggleNavBlendin = () => {
    setNavColor.toggleBlendin();
    setNavBlendIn(true);
    setDiscrete(false);
    setNavEvident(false);
  }

  const toggleNavDiscrete = () => {
    setNavColor.toggleDiscrete();
    setNavBlendIn(false);
    setDiscrete(true);
    setNavEvident(false);
  }

  const toggleNavEvident = () => {
    setNavColor.toggleEvident();
    setNavBlendIn(false);
    setDiscrete(false);
    setNavEvident(true);
  }

  useEffect(() => {
    if(theme.palette.appSettings.navColor === 'blend-in') {
        setNavBlendIn(true);
        setDiscrete(false);
        setNavEvident(false);
    } else if (theme.palette.appSettings.navColor === 'discrete') {
        setNavBlendIn(false);
        setDiscrete(true);
        setNavEvident(false);
    } else {
        setNavBlendIn(false);
        setDiscrete(false);
        setNavEvident(true);
    }
  }, [theme.palette.appSettings.navColor])


  return (
    <Box>
        <Typography sx={{
            margin: '0px 0px 12px',
            lineHeight: 1.5,
            fontSize: '0.75rem',
            fontWeight: 600
        }}>
            Nav Color</Typography>
        <Box sx={{       
            gap: '12px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)'
        }}>
            <Button 
            onClick={toggleNavBlendin}
            sx={{
                height: '56px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: navBlendIn ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: navBlendIn ? `${btnShadow.btnShadow[100]}` : '',
                '&:hover': {
                    backgroundColor: navBlendIn ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                <Paper elevation={navBlendIn ? 8 : 0} sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.appSettings.paletteMode === 'dark' ? '#161C24' : '#FFFFFF',
                    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                    transform: navBlendIn ? 'scale(2)' : ''
                }}></Paper>
            </Button>
            <Button 
            onClick={toggleNavDiscrete}
            sx={{
                height: '56px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: navDiscrete ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: navDiscrete ? `${btnShadow.btnShadow[100]}` : '',
                '&:hover': {
                    backgroundColor: navDiscrete ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                 <Paper elevation={navDiscrete ? 8 : 0} sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.appSettings.paletteMode === 'dark' ? '#111927' : '#F8F9FA',
                    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                    transform: navDiscrete ? 'scale(2)' : ''
                }}></Paper>
            </Button>
            <Button 
            onClick={toggleNavEvident}
            sx={{
                height: '56px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: navEvident ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: navEvident ? `${btnShadow.btnShadow[100]}` : '',
                '&:hover': {
                    backgroundColor: navEvident ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                <Paper elevation={navEvident ? 8 : 0} sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#1C2536',
                    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                    transform: navEvident ? 'scale(2)' : ''
                }}></Paper>
            </Button>
        </Box>
    </Box>
  )
}

export default NavColor