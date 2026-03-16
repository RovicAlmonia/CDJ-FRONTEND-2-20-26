import { IconButton, useTheme } from "@mui/material"
import { tokens } from "../../../../themes/palette";
import { useContext } from "react";
import { AppSettingsContext } from "../../../../themes";
import SidebarFront from "../../../../components/svg-icons/SidebarFront";
import SidebarBack from "../../../../components/svg-icons/SidebarBack";

const ToggleNavButton = () => {
  const theme = useTheme();
  const color = tokens(theme.palette.appSettings);
  const toggleBtn = useContext(AppSettingsContext);
  return (
    <>
    {theme.palette.appSettings.layout === 'collapsed' ? (
        <IconButton
        sx={{
          display: {
            xl: theme.palette.appSettings.layout === 'vertical' ? 'flex' : theme.palette.appSettings.layout === 'horizontal' ? 'none' : 'flex',
            lg: theme.palette.appSettings.layout === 'vertical' ? 'flex' : theme.palette.appSettings.layout === 'horizontal' ? 'none' : 'flex',
            md: 'none',
            sm: 'none',
            xs: 'none'
          },
          WebkitBoxAlign: 'center',
          alignItems: 'center',
          WebkitBoxPack: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          WebkitTapHighlightColor: 'transparent',
          outline: 0,
          margin: 0,
          verticalAlign: 'center',
          appearance: 'none',
          textDecoration: 'none',
          textAlign: 'center',
          fontSize: '1.125rem',
          padding: '4px',
          top: '27.5px',
          position: 'fixed',
          left: theme.palette.appSettings.layout === 'collapsed' ? '74px' : '268px',
          zIndex: 1101,
          border: `1px dashed ${color.sidebarColor[200]}`,
          backdropFilter: 'blur(6px)',
          transition: theme.transitions.create('left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
        onClick={toggleBtn.toggleVertical}
      >
          <SidebarFront />
      </IconButton>
    ) : (
        <IconButton
        sx={{
          display: {
            xl: theme.palette.appSettings.layout === 'vertical' ? 'flex' : theme.palette.appSettings.layout === 'horizontal' ? 'none' : 'flex',
            lg: theme.palette.appSettings.layout === 'vertical' ? 'flex' : theme.palette.appSettings.layout === 'horizontal' ? 'none' : 'flex',
            md: 'none',
            sm: 'none',
            xs: 'none'
          },
          WebkitBoxAlign: 'center',
          alignItems: 'center',
          WebkitBoxPack: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          WebkitTapHighlightColor: 'transparent',
          outline: 0,
          margin: 0,
          verticalAlign: 'center',
          appearance: 'none',
          textDecoration: 'none',
          textAlign: 'center',
          fontSize: '1.125rem',
          padding: '4px',
          top: '27.5px',
          position: 'fixed',
          left: theme.palette.appSettings.layout === 'collapsed' ? '74px' : '268px',
          zIndex: 1101,
          border: `1px dashed ${color.sidebarColor[200]}`,
          backdropFilter: 'blur(6px)',
          transition: theme.transitions.create('left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
        onClick={toggleBtn.toggleCollapsed}
      >
          <SidebarBack />
      </IconButton>
    )}
    </>
  )
}

export default ToggleNavButton