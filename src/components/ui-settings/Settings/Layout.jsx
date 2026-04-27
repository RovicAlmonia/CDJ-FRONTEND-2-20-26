import { Box, Button, Stack, Typography, useTheme } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { AppSettingsContext } from "../../../themes";
import { BoxShadowBtnSettings, SvgIconColors, tokens } from "../../../themes/palette";

const Layout = () => {
  const theme = useTheme();
  const setLayout = useContext(AppSettingsContext);
  const btnColor = tokens(theme.palette.appSettings);
  const iconColor = SvgIconColors(theme.palette.appSettings)
  const btnShadow = BoxShadowBtnSettings(theme.palette.appSettings);
  const [sideNav, setSideNav] = useState(false);
  const [topNav, setTopNav] = useState(false);
  const [collapse, setCollapse] = useState(false);

  const toggleSidenavMode = () => {
    setLayout.toggleVertical();
    setSideNav(true);
    setTopNav(false);
    setCollapse(false);
  }

  const toggleTopnavMode = () => {
    setLayout.toggleHorizontal();
    setSideNav(false);
    setTopNav(true);
    setCollapse(false);
  }

  const toggleCollapseMode = () => {
    setLayout.toggleCollapsed();
    setSideNav(false);
    setTopNav(false);
    setCollapse(true);
  }

  useEffect(() => {
    if(theme.palette.appSettings.layout === 'vertical'){
        setSideNav(true);
        setTopNav(false);
        setCollapse(false);
    } else if(theme.palette.appSettings.layout === 'horizontal'){
        setSideNav(false);
        setTopNav(true);
        setCollapse(false);
    } else {
        setSideNav(false);
        setTopNav(false);
        setCollapse(true);
    }
  }, [theme.palette.appSettings.layout])
  return (
    <Box>
        <Typography sx={{
            margin: '0px 0px 12px',
            lineHeight: 1.5,
            fontSize: '0.75rem',
            fontWeight: 600
        }}>
            Layout</Typography>
        <Stack sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px'
        }}>
            <Button 
            onClick={toggleSidenavMode}
            sx={{
                width: '100%',
                height: '56px',
                padding: 0,
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: sideNav ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: sideNav ? `${btnShadow.btnShadow[100]}` : '',
                '&:hover': {
                    backgroundColor: sideNav ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                <Stack sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    flexShrink: 0,
                    padding: '4px',
                    width: '28px',
                    height: '100%',
                    borderRight: '1px solid rgba(145, 158, 171, 0.08)'
                }}>
                    <Box sx={{
                        flexShrink: 0,
                        borderRadius: '4px',
                        width: '8px',
                        height: '8px',
                        background: sideNav ? `${iconColor.svgcolor[100]}` : '#637381'
                    }}></Box>
                    <Box sx={{
                        flexShrink: 0,
                        borderRadius: '4px',
                        width: '100%',
                        height: '3px',
                        opacity: 0.48,
                        background: sideNav ? `${iconColor.svgcolor[100]}` : '#637381'
                    }}></Box>
                    <Box sx={{
                        flexShrink: 0,
                        borderRadius: '4px',
                        width: '100%',
                        height: '3px',
                        maxWidth: '12px',
                        opacity: 0.24,
                        background: sideNav ? `${iconColor.svgcolor[100]}` : '#637381'
                    }}></Box>
                </Stack>
                <Box sx={{
                    padding: '4px',
                    WebkitBoxFlex: 1,
                    flexGrow: 1,
                    height: '100%',
                    width: '100%'
                }}>
                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        opacity: 0.24,
                        borderRadius: '4px',
                        background: sideNav ? `${iconColor.svgcolor[100]}` : '#637381'
                    }}></Box>
                </Box>
            </Button>
            <Button 
            onClick={toggleTopnavMode}
            sx={{
                display: 'inline-flex',
                width: '100%',
                height: '56px',
                padding: 0,
                flexDirection: 'column',
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: topNav ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: topNav ? `${btnShadow.btnShadow[100]}` : '',
                '&:hover': {
                    backgroundColor: topNav ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                <Stack sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '4px',
                    flexShrink: 0,
                    padding: '4px',
                    width: '100%',
                    height: '16px',
                    borderRight: 'unset',
                    WebkitBoxAlign: 'center',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(145, 158, 171, 0.08)'
                }}>
                    <Box sx={{
                        flexShrink: 0,
                        borderRadius: '4px',
                        background: topNav ? `${iconColor.svgcolor[100]}` : '#637381',
                        width: '8px',
                        height: '8px'
                    }}></Box>
                    <Box sx={{
                        flexShrink: 0,
                        borderRadius: '4px',
                        background: topNav ? `${iconColor.svgcolor[100]}` : '#637381',
                        width:'12px',
                        height: '3px',
                        opacity: 0.48
                    }}></Box>
                    <Box sx={{
                        flexShrink: 0,
                        borderRadius: '4px',
                        background: topNav ? `${iconColor.svgcolor[100]}` : '#637381',
                        width:'8px',
                        height: '3px',
                        maxWidth: '12px',
                        opacity: 0.48
                    }}></Box>
                </Stack>
                <Box sx={{
                    padding: '4px',
                    WebkitBoxFlex: 1,
                    flexGrow: 1,
                    height: '100%',
                    width: '100%'
                }}>
                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        opacity: 0.08,
                        borderRadius: '4px',
                        background: topNav ? `${iconColor.svgcolor[100]}` : '#637381',
                    }}></Box>
                </Box>
            </Button>
            <Button 
            onClick={toggleCollapseMode}
            sx={{
                width: '100%',
                height: '56px',
                padding: 0,
                border: '1px solid rgba(145, 158, 171, 0.08)',
                background: collapse ? `${btnColor.buttonColor[100]}` : 'none',
                boxShadow: collapse ? `${btnShadow.btnShadow[100]}` : '',
                '&:hover': {
                    backgroundColor: collapse ? `${btnColor.buttonColor[100]}` : 'transparent',
                    color: 'inherit',
                }
            }}>
                <Stack sx={{
                    display: 'flex',
                    flexDirection: 'column', 
                    gap: '4px',
                    flexShrink: 0,
                    padding: '4px',
                    width: '16px',
                    height: '100%',
                    borderRight: '1px solid rgba(145, 158, 171, 0.08)'
                }}>
                    <Box sx={{
                        flexShrink: 0,
                        borderRadius: '4px',
                        backgroundColor: collapse ? `${iconColor.svgcolor[100]}` : '#637381',
                        width: '8px',
                        height: '8px'
                    }}></Box>
                    <Box sx={{
                        flexShrink: 0,
                        borderRadius: '4px',
                        backgroundColor: collapse ? `${iconColor.svgcolor[100]}` : '#637381',
                        width: '100%',
                        height: '3px',
                        opacity: 0.48
                    }}></Box>
                    <Box sx={{
                        flexShrink: 0,
                        borderRadius: '4px',
                        backgroundColor: collapse ? `${iconColor.svgcolor[100]}` : '#637381',
                        width: '100%',
                        height: '3px',
                        maxWidth: '12px',
                        opacity: 0.24
                    }}></Box>
                </Stack>
                <Box sx={{
                    padding: '4px',
                    WebkitBoxFlex: 1,
                    flexGrow: 1,
                    height: '100%',
                    width: '100%'
                }}>
                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        opacity: 0.08,
                        borderRadius: '4px',
                        backgroundColor: collapse ? `${iconColor.svgcolor[100]}` : '#637381',
                    }}></Box>
                </Box>
            </Button>
        </Stack>
    </Box>
  )
}

export default Layout