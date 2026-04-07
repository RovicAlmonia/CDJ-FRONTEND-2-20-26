import { Box, Button, Paper, Typography, useTheme } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { AppSettingsContext } from "../../../themes";
import { BoxShadowBtnSettings, tokens } from "../../../themes/palette";

const NavColor = () => {
  const theme = useTheme();
  const btnColor = tokens(theme.palette.appSettings);
  const btnShadow = BoxShadowBtnSettings(theme.palette.appSettings);
  const setNavColor = useContext(AppSettingsContext);
  const isDark = theme.palette.appSettings.paletteMode === 'dark';

  const [navBlendIn, setNavBlendIn] = useState(false);
  const [navDiscrete, setDiscrete]  = useState(false);
  const [navEvident, setNavEvident] = useState(false);

  const toggleNavBlendin = () => {
    setNavColor.toggleBlendin();
    setNavBlendIn(true);
    setDiscrete(false);
    setNavEvident(false);
  };

  const toggleNavDiscrete = () => {
    setNavColor.toggleDiscrete();
    setNavBlendIn(false);
    setDiscrete(true);
    setNavEvident(false);
  };

  const toggleNavEvident = () => {
    setNavColor.toggleEvident();
    setNavBlendIn(false);
    setDiscrete(false);
    setNavEvident(true);
  };

  useEffect(() => {
    if (theme.palette.appSettings.navColor === 'blend-in') {
      setNavBlendIn(true); setDiscrete(false); setNavEvident(false);
    } else if (theme.palette.appSettings.navColor === 'discrete') {
      setNavBlendIn(false); setDiscrete(true); setNavEvident(false);
    } else {
      setNavBlendIn(false); setDiscrete(false); setNavEvident(true);
    }
  }, [theme.palette.appSettings.navColor]);

  const btnSx = (active) => ({
    height: '56px',
    border: '1px solid rgba(145, 158, 171, 0.08)',
    background: active ? `${btnColor.buttonColor[100]}` : 'none',
    boxShadow: active ? `${btnShadow.btnShadow[100]}` : '',
    '&:hover': {
      backgroundColor: active ? `${btnColor.buttonColor[100]}` : 'transparent',
      color: 'inherit',
    },
  });

  const dotSx = (active, bg) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: bg,
    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    transform: active ? 'scale(2)' : '',
  });

  return (
    <Box>
      <Typography sx={{ margin: '0px 0px 12px', lineHeight: 1.5, fontSize: '0.75rem', fontWeight: 600 }}>
        Nav Color
      </Typography>

      <Box sx={{ gap: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>

        {/* Blend-in — matches page bg */}
        <Button onClick={toggleNavBlendin} sx={btnSx(navBlendIn)}>
          <Paper elevation={navBlendIn ? 8 : 0} sx={dotSx(navBlendIn,
            isDark ? '#161C24' : '#EAECEE' // ash grey dot in light mode
          )} />
        </Button>

        {/* Discrete — slightly off from page bg */}
        <Button onClick={toggleNavDiscrete} sx={btnSx(navDiscrete)}>
          <Paper elevation={navDiscrete ? 8 : 0} sx={dotSx(navDiscrete,
            isDark ? '#111927' : '#E2E4E7' // sidebar-level ash grey
          )} />
        </Button>

        {/* Evident — always dark navy, same in both modes */}
        <Button onClick={toggleNavEvident} sx={btnSx(navEvident)}>
          <Paper elevation={navEvident ? 8 : 0} sx={dotSx(navEvident, '#1C2536')} />
        </Button>

      </Box>
    </Box>
  );
};

export default NavColor;