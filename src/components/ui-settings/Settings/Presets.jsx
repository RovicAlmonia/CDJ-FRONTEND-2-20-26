import { Box, Button, Typography, useTheme } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { AppSettingsContext } from "../../../themes";

const Presets = () => {
  const theme = useTheme();
  const presetMode = useContext(AppSettingsContext);
  const [darkGreen, setDarkGreen] = useState(false);
  const [lightBlue, setLightBlue] = useState(false);
  const [darkPurple, setDarkPurple] = useState(false);
  const [darkBlue, setDarkBlue] = useState(false);
  const [lightOrange, setLightOrange] = useState(false);
  const [darkRed, setDarkRed] = useState(false);

  const toggleDarkGreenS = () => {
    presetMode.toggleDarkGreen();
    setDarkGreen(true);
    setLightBlue(false);
    setDarkPurple(false);
    setDarkBlue(false);
    setLightOrange(false);
    setDarkRed(false);
  }
  
  const toggleLightBlueS = () => {
    presetMode.toggleLightBlue();
    setDarkGreen(false);
    setLightBlue(true);
    setDarkPurple(false);
    setDarkBlue(false);
    setLightOrange(false);
    setDarkRed(false);
  }

  const toggleDarkPurleS = () => {
    presetMode.toggleDarkPurple();
    setDarkGreen(false);
    setLightBlue(false);
    setDarkPurple(true);
    setDarkBlue(false);
    setLightOrange(false);
    setDarkRed(false);
  }

  const toggleDarkBlueS = () => {
    presetMode.toggleDarkBlue();
    setDarkGreen(false);
    setLightBlue(false);
    setDarkPurple(false);
    setDarkBlue(true);
    setLightOrange(false);
    setDarkRed(false);
  }

  const toggleLightOrangeS = () => {
    presetMode.toggleLightOrange();
    setDarkGreen(false);
    setLightBlue(false);
    setDarkPurple(false);
    setDarkBlue(false);
    setLightOrange(true);
    setDarkRed(false);
  }

  const toggleDarkRedS = () => {
    presetMode.toggleDarkRed();
    setDarkGreen(false);
    setLightBlue(false);
    setDarkPurple(false);
    setDarkBlue(false);
    setLightOrange(false);
    setDarkRed(true);
  }

  useEffect(() => {
    if (theme.palette.appSettings.colorPreset === 'dark-green') {
        setDarkGreen(true);
        setLightBlue(false);
        setDarkPurple(false);
        setDarkBlue(false);
        setLightOrange(false);
        setDarkRed(false);
    } else if(theme.palette.appSettings.colorPreset === 'light-blue') {
        setDarkGreen(false);
        setLightBlue(true);
        setDarkPurple(false);
        setDarkBlue(false);
        setLightOrange(false);
        setDarkRed(false);
    } else if (theme.palette.appSettings.colorPreset === 'dark-purple') {
        setDarkGreen(false);
        setLightBlue(false);
        setDarkPurple(true);
        setDarkBlue(false);
        setLightOrange(false);
        setDarkRed(false);
    } else if (theme.palette.appSettings.colorPreset === 'dark-blue') {
        setDarkGreen(false);
        setLightBlue(false);
        setDarkPurple(false);
        setDarkBlue(true);
        setLightOrange(false);
        setDarkRed(false);
    } else if (theme.palette.appSettings.colorPreset === 'light-orange') {
        setDarkGreen(false);
        setLightBlue(false);
        setDarkPurple(false);
        setDarkBlue(false);
        setLightOrange(true);
        setDarkRed(false);
    } else {
        setDarkGreen(false);
        setLightBlue(false);
        setDarkPurple(false);
        setDarkBlue(false);
        setLightOrange(false);
        setDarkRed(true);
    }
  }, [theme.palette.appSettings.colorPreset])

  return (
    <Box>
        <Typography sx={{
            margin: '0px 0px 12px',
            lineHeight: 1.5,
            fontSize: '0.75rem',
            fontWeight: 600
        }}>
            Presets</Typography>
        <Box sx={{       
            gap: '12px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)'
        }}>
            <Button 
            onClick={toggleDarkGreenS}
            sx={{
                height: '56px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: darkGreen ? 'rgba(0, 167, 111, 0.08)' : 'inherit',
                '&:hover': {
                    backgroundColor: darkGreen ? 'rgba(0, 167, 111, 0.08)' : 'inherit',
                    color: 'inherit',
                }
            }}>
                <Box sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'rgb(0, 167, 111)',
                    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                    transform: darkGreen ? 'scale(2)' : ''
                }}></Box>
            </Button>
            <Button 
            onClick={toggleLightBlueS}
            sx={{
                height: '56px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: lightBlue ? 'rgba(7, 141, 238, 0.08)' : 'inherit',
                '&:hover': {
                    backgroundColor: lightBlue ? 'rgba(7, 141, 238, 0.08)' : 'inherit',
                    color: 'inherit',
                }
            }}>
                 <Box sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'rgb(7, 141, 238)',
                    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                    transform: lightBlue ? 'scale(2)' : ''
                }}></Box>
            </Button>
            <Button 
            onClick={toggleDarkPurleS}
            sx={{
                height: '56px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: darkPurple ? 'rgba(118, 53, 220, 0.08)' : 'inherit',
                '&:hover': {
                    backgroundColor: darkPurple ? 'rgba(118, 53, 220, 0.08)' : 'inherit',
                    color: 'inherit',
                }
            }}>
                <Box sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'rgb(118, 53, 220)',
                    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                    transform: darkPurple ? 'scale(2)' : ''
                }}></Box>
            </Button>
            <Button 
            onClick={toggleDarkBlueS}
            sx={{
                height: '56px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: darkBlue ? 'rgba(32, 101, 209, 0.08)' : 'inherit',
                '&:hover': {
                    backgroundColor: darkBlue ? 'rgba(32, 101, 209, 0.08)' : 'inherit',
                    color: 'inherit',
                }
            }}>
                <Box sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'rgb(32, 101, 209)',
                    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                    transform: darkBlue ? 'scale(2)' : ''
                }}></Box>
            </Button>
            <Button 
            onClick={toggleLightOrangeS}
            sx={{
                height: '56px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: lightOrange ? 'rgba(253, 169, 45, 0.08)' : 'inherit',
                '&:hover': {
                    backgroundColor: lightOrange ? 'rgba(253, 169, 45, 0.08)' : 'inherit',
                    color: 'inherit',
                }
            }}>
                <Box sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'rgb(253, 169, 45)',
                    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                    transform: lightOrange ? 'scale(2)' : ''
                }}></Box>
            </Button>
            <Button 
            onClick={toggleDarkRedS}
            sx={{
                height: '56px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: darkRed ? 'rgba(255, 48, 48, 0.08)' : 'inherit',
                '&:hover': {
                    backgroundColor: darkRed ? 'rgba(255, 48, 48, 0.08)' : 'inherit',
                    color: 'inherit',
                }
            }}>
                <Box sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'rgb(255, 48, 48)',
                    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                    transform: darkRed ? 'scale(2)' : ''
                }}></Box>
            </Button>
        </Box>
    </Box>
  )
}

export default Presets