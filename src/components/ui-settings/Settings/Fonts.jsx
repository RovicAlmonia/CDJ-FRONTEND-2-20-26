import { useTheme } from "@emotion/react"
import { Box, Button, Stack, Typography } from "@mui/material"
import { useContext, useEffect, useState } from "react";
import { AppSettingsContext } from "../../../themes";
import { BoxShadowBtnSettings, tokens } from "../../../themes/palette";

const Fonts = () => {
  const theme = useTheme();
  const setFont = useContext(AppSettingsContext);
  const btnColor = tokens(theme.palette.appSettings);
  const btnShadow = BoxShadowBtnSettings(theme.palette.appSettings);
  const [RobotoFont, setRobotoFont] = useState(false);
  const [PoetsenFont, setPoetsenFont] = useState(false);
  const [PublicFont, setPublicFont] = useState(false);
  const [PlusFont, setPlusFont] = useState(false);
  const [DmFont, setDmFont] = useState(false);

  const clickRobot = () => {
    setFont.toggleRobotSlab();
    setRobotoFont(true);
    setPoetsenFont(false);
    setPublicFont(false);
    setPlusFont(false);
    setDmFont(false);
  }

  const clickPoetsen = () => {
    setFont.togglePoetsenOne();
    setRobotoFont(false);
    setPoetsenFont(true);
    setPublicFont(false);
    setPlusFont(false);
    setDmFont(false);
  }

  const clickPublic = () => {
    setFont.togglePublicSans();
    setRobotoFont(false);
    setPoetsenFont(false);
    setPublicFont(true);
    setPlusFont(false);
    setDmFont(false);
  }
  
  const clickPlus = () => {
    setFont.togglePlusJakarta();
    setRobotoFont(false);
    setPoetsenFont(false);
    setPublicFont(false);
    setPlusFont(true);
    setDmFont(false);
  }

  const clickDm = () => {
    setFont.toggleDMSans()
    setRobotoFont(false);
    setPoetsenFont(false);
    setPublicFont(false);
    setPlusFont(false);
    setDmFont(true);
  }

  useEffect(() => {
    if (theme.palette.appSettings.UiFont === "'Roboto Slab', serif") {
        setRobotoFont(true);
        setPoetsenFont(false);
        setPublicFont(false);
        setPlusFont(false);
        setDmFont(false);
    } else if(theme.palette.appSettings.UiFont === "'Poetsen One', sans-serif") {
        setRobotoFont(false);
        setPoetsenFont(true);
        setPublicFont(false);
        setPlusFont(false);
        setDmFont(false);
    } else if (theme.palette.appSettings.UiFont === "'Public Sans', sans-serif") {
        setRobotoFont(false);
        setPoetsenFont(false);
        setPublicFont(true);
        setPlusFont(false);
        setDmFont(false);
    } else if (theme.palette.appSettings.UiFont === "'Plus Jakarta Sans', sans-serif"){
        setRobotoFont(false);
        setPoetsenFont(false);
        setPublicFont(false);
        setPlusFont(true);
        setDmFont(false);
    } else {
        setRobotoFont(false);
        setPoetsenFont(false);
        setPublicFont(false);
        setPlusFont(false);
        setDmFont(true);
    }
  }, [theme.palette.appSettings.UiFont]);
  return (
    <Box>
        <Typography sx={{
            margin: '0px 0px 12px',
            lineHeight: 1.5,
            fontSize: '0.75rem',
            fontWeight: 600
        }}>
            UI Fonts</Typography>
            <Stack sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <Button
            onClick={clickRobot}
            sx={{
                width: '100%',
                height: '50px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: RobotoFont ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: RobotoFont ? `${btnShadow.btnShadow[100]}` : '',
                '&:hover': {
                    backgroundColor: RobotoFont ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                Roboto Slab
            </Button>
            <Button 
            onClick={clickPoetsen}
            sx={{
                width: '100%',
                height: '50px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: PoetsenFont ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: PoetsenFont ? `${btnShadow.btnShadow[100]}` : '',
                '&:hover': {
                    backgroundColor: PoetsenFont ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                Poetsen One
            </Button>
            <Button 
            onClick={clickPublic}
            sx={{
                width: '100%',
                height: '50px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: PublicFont ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: PublicFont ? `${btnShadow.btnShadow[100]}` : '',
                '&:hover': {
                    backgroundColor: PublicFont ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                Public Sans
            </Button>
            <Button 
            onClick={clickPlus}
            sx={{
                width: '100%',
                height: '50px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: PlusFont ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: PlusFont ? `${btnShadow.btnShadow[100]}` : '',
                '&:hover': {
                    backgroundColor: PlusFont ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                Plus Jakarta Sans
            </Button>
            <Button 
            onClick={clickDm}
            sx={{
                width: '100%',
                height: '50px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: DmFont ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: DmFont ? `${btnShadow.btnShadow[100]}` : '',
                '&:hover': {
                    backgroundColor: DmFont ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                DM Sans
            </Button>
        </Stack>
    </Box>
  )
}

export default Fonts