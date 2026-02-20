import { Box, Button, Stack, Typography } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { AppSettingsContext } from "../../../themes"
import SunIcon from "../../svg-icons/SunIcon";
import MoonIcon from "../../svg-icons/MoonIcon";
import { useTheme } from "@emotion/react";
import { tokens } from "../../../themes/palette";

const Mode = () => {
  const theme = useTheme();
  const btnColor = tokens(theme.palette.appSettings)
  const setMode = useContext(AppSettingsContext);
  const [lightModeActive, setLightModeActive] = useState(false);
  const [darkModeActive, setDarkModeActive] = useState(false);

  const handleLightModeClick = () => {
    setMode.toggleLightMode();
    setLightModeActive(true);
    setDarkModeActive(false);
  };

  const handleDarkModeClick = () => {
    setMode.toggleDarkMode();
    setLightModeActive(false);
    setDarkModeActive(true);
  };

  useEffect(() => {
    if(theme.palette.appSettings.paletteMode === 'dark') {
        setLightModeActive(false);
        setDarkModeActive(true);
    } else {
        setLightModeActive(true);
        setDarkModeActive(false);
    }
  }, [theme.palette.appSettings.paletteMode])

  return (
    <Box>
        <Typography sx={{
            margin: '0px 0px 12px',
            lineHeight: 1.5,
            fontSize: '0.75rem',
            fontWeight: 600
        }}>
            Mode</Typography>
        <Stack sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px'
        }}>
            <Button 
            onClick={handleLightModeClick}
            sx={{
                width: '100%',
                height: '80px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                color: 'inherit',
                background: lightModeActive ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: lightModeActive ? 'rgba(145, 158, 171, 0.08) -24px 8px 24px -4px' : '',
                '&:hover': {
                    backgroundColor: lightModeActive ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                <SunIcon lightModeActive={lightModeActive} />
            </Button>
            <Button 
            onClick={handleDarkModeClick}
            sx={{
                width: '100%',
                height: '80px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                color: 'inherit',
                background: darkModeActive ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: darkModeActive ? 'rgba(0, 0, 0, 0.08) -24px 8px 24px -4px' : '',
                '&:hover': {
                    backgroundColor: darkModeActive ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                <MoonIcon darkModeActive={darkModeActive} />
            </Button>
        </Stack>
    </Box>
  )
}

export default Mode;
