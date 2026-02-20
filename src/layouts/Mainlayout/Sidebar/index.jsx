import { Sidebar, sidebarClasses } from 'react-pro-sidebar';
import PerfectScrollBar from 'react-perfect-scrollbar';
import { Box, IconButton, useTheme } from '@mui/material';
import { navColors, tokens } from '../../../themes/palette';
import SidebarBack from '../../../components/svg-icons/SidebarBack';
import SidebarFront from '../../../components/svg-icons/SidebarFront';
import { useContext, useEffect, useState } from 'react';
import { AppSettingsContext } from '../../../themes';
import {motion} from 'framer-motion';

const SidebarContainer = () => {
  const theme = useTheme();
  const color = tokens(theme.palette.appSettings);
  const toggleBtn = useContext(AppSettingsContext);
  const setNavColor = navColors(theme.palette.appSettings);
  const [collapsed, setCollapsed] = useState(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    return savedCollapsed ? JSON.parse(savedCollapsed) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const handleToggle = () => {
    if (!collapsed) {
      toggleBtn.toggleCollapsed();
    } else {
      toggleBtn.toggleVertical();
    }
    setCollapsed(!collapsed);
  };

  return ( 
    <motion.div layout>
      <Box sx={{
        flexShrink: 0,
        width: 280
      }}>
      <Sidebar
        collapsed={theme.palette.appSettings.layout === 'collapsed' ? true : collapsed}
        transitionDuration={350}
        breakPoint='lg'
        backgroundColor={setNavColor.navcolor[100]}
        width='280px'
        style={{ height: '100vh', borderRight: "none", fontSize: "12px",
        display: theme.palette.appSettings.layout === 'vertical' ? 'block' : theme.palette.appSettings.layout === 'horizontal' ? 'none' : 'block',
        
      }}
        rootStyles={{
          [`.${sidebarClasses.container}`]: {
            borderRight: '1px dashed',
            borderColor: `${color.sidebarColor[200]} !important`,
          },
        }}
      >
        <IconButton
          sx={{
            display: {
              xl: 'flex',
              lg: 'none',
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
            left: theme.palette.appSettings.layout === 'collapsed' ? '68px' : '268px',
            zIndex: 1101,
            border: `1px dashed ${color.sidebarColor[200]}`,
            backdropFilter: 'blur(6px)',
            transition: 'left 0.350s ease',
          }}
          onClick={handleToggle}
        >
          {theme.palette.appSettings.layout === 'collapsed' ? <SidebarFront /> : <SidebarBack />}
        </IconButton>
        <PerfectScrollBar>
          <Box sx={{ padding: 4.5, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          </Box>
          <Box sx={{ paddingLeft: '16px', paddingRight: '16px', overflow: 'hidden' }}>

          </Box>
        </PerfectScrollBar>
      </Sidebar>
      </Box>
    </motion.div>
        
  )
}

export default SidebarContainer;
