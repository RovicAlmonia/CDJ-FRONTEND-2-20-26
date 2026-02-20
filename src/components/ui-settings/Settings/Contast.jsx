import { Box, Button, Stack, Typography, useTheme } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { AppSettingsContext } from "../../../themes"
import NormalContrast from "../../svg-icons/NormalContrast";
import BoldContrast from "../../svg-icons/BoldContrast";
import { BoxShadowBtnSettings, tokens } from "../../../themes/palette";

const Contrast = () => {
  const theme = useTheme();
  const btnColor = tokens(theme.palette.appSettings);
  const btnShadow = BoxShadowBtnSettings(theme.palette.appSettings);
  const setMode = useContext(AppSettingsContext);
  const [contrastDefault, setContrastDefault] = useState(false);
  const [contrastBold, setContrastBold] = useState(false);

  const ToggleDefualtContrast = () => {
    setMode.toggleDefault();
    setContrastDefault(true);
    setContrastBold(false);
  }

  const ToggleBoldContrast = () => {
    setMode.toggleBold();
    setContrastDefault(false);
    setContrastBold(true);
  }

  useEffect(() => {
    if(theme.palette.appSettings.contrast === 'default') {
        setContrastDefault(true);
        setContrastBold(false);
    } else {
        setContrastDefault(false);
        setContrastBold(true);
    }
  }, [theme.palette.appSettings.contrast]);

  return (
    <Box>
        <Typography sx={{
            margin: '0px 0px 12px',
            lineHeight: 1.5,
            fontSize: '0.75rem',
            fontWeight: 600
        }}>
            Contrast</Typography>
        <Stack sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px'
        }}>
            <Button 
            onClick={ToggleDefualtContrast}
            sx={{
                width: '100%',
                height: '80px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: contrastDefault ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: contrastDefault ? `${btnShadow.btnShadow[100]}` : '',
                '&:hover': {
                    backgroundColor: contrastDefault ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                <NormalContrast contrastDefault={contrastDefault} />
            </Button>
            <Button 
            onClick={ToggleBoldContrast}
            sx={{
                width: '100%',
                height: '80px',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: contrastBold ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: contrastBold ? `${btnShadow.btnShadow[100]}` : '',
                '&:hover': {
                    backgroundColor: contrastBold ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                <BoldContrast contrastBold={contrastBold} />
            </Button>
        </Stack>
    </Box>
  )
}

export default Contrast