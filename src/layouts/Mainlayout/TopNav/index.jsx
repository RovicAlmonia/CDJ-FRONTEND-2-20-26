import { AppBar, Box, IconButton, Stack, Toolbar, useTheme, Typography } from '@mui/material';
import SettingsIcon from '../../../components/svg-icons/SettingsIcon'
import { useDispatch, useSelector } from 'react-redux';
import { SET_MENU, OPEN_SIDEBAR_MOBILE, OPEN_NOTIF } from '../../../store/actions'
import DrawerIndex from '../../../components/ui-settings/Drawer';
import AnimateButton from '../../../components/AnimatedButton';
import AccountPopover from './AccountPopOver';
import { TopNavColor, navColors, tokens } from '../../../themes/palette';
import { useResponsive } from '../../../hooks/use-responsive';
import Iconify from '../../../components/iconify/Iconify';
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react';
import SidebarMobileMode from '../Sidebar/SidebarMobileMode';
import TopNavLogo from './Logo';
import PerfectScrollBar from 'react-perfect-scrollbar';
import TopNavContainer from './TopNavContainer';
import { useAuth } from '../../../modules/context/AuthContext';
import NotificationDrawer from '../../../components/Notification/Drawer';
import NotificationIcon from '../../../components/svg-icons/NotificationIcon'
import { WebSocket } from '../../../main';
import StyledBadges from '../../../components/StyledBadge';
import {http} from '../../../api/http';


const TopNav = () => {
  const theme = useTheme();
  const color = TopNavColor(theme.palette.appSettings);
  const navColor = navColors(theme.palette.appSettings);
  const btmColor = tokens(theme.palette.appSettings);
  const OpenDrawer = useSelector((state) => state.customization.opened);
  const OpenSidebar = useSelector((state) => state.customization.openSidebarMobile);
  const OpenNotif = useSelector((state) => state.customization.openNotif);
  const dispatch = useDispatch();
  const lgUp = useResponsive('up', 'lg');
  const [navBar, setNavbar] = useState(false);
  const [notifData, setNotifData] = useState(0);
  const AppSocket = WebSocket();
  const { accessToken } = useAuth();


  useEffect(() => {
    
    AppSocket.on('openNewNotification', () => {
        if(accessToken.UserLevel === 'Schema Admin') {
          
        }     
    });
    return () => {
      AppSocket.off('openNewNotification');
    };
    
  }, [AppSocket, accessToken]);

  useEffect(() => {
    const triggerHeight = () => {
      if (window.scrollY >= 80) {
        setNavbar(true);
      } else {
        setNavbar(false);
      }
    }
    window.addEventListener('scroll', triggerHeight);
    return () => {
    window.removeEventListener('scroll', triggerHeight);
    };   
  }, []);

  const handleRightDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !OpenDrawer });
  };

  const handleSidebarOpen = () => {
    dispatch({ type: OPEN_SIDEBAR_MOBILE, openSidebarMobile: !OpenSidebar });
  };

  const handleRightNotifDrawer = async () => {
    dispatch({ type: OPEN_NOTIF, openNotif: !OpenNotif });
    const updateNotif = await http.post('/read-unread-notification',{ LoginID: accessToken.userID });
    if (updateNotif.data.success) {
      notificationData();
    }
  };


  const renderContent = (
    <>
      {!lgUp && (
        <IconButton onClick={handleSidebarOpen} sx={{ mr: 1 }}>
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>
      )}
      {lgUp && (
        <TopNavLogo />
      )}
      <Typography variant="h5" sx={{ color: 'text.primary' }} noWrap>Good Day! {accessToken.Fname} &#128526;</Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton size="small" onClick={handleRightNotifDrawer}>
           <StyledBadges badgeContent={notifData} >
           <NotificationIcon color="action" /> 
           </StyledBadges>
        </IconButton> 
        <AnimateButton type="rotate">
          <IconButton size="small" onClick={handleRightDrawerToggle}>
            <SettingsIcon />
          </IconButton>
        </AnimateButton>
        <AccountPopover />
      </Stack>
    </>
  );
  return (
    <>
      <motion.div layout animate={{ opacity: 1 }} initial={{ opacity: 0 }} exit={{ opacity: 0 }}></motion.div>
      <AppBar sx={{
        borderBottom:
          theme.palette.appSettings.layout === 'vertical' ? '0px' :
            theme.palette.appSettings.layout === 'horizontal' ? '1px dashed' :
              '0px',
        borderColor: `${btmColor.sidebarColor[200]} !important`,
        width:
        {
          xl: theme.palette.appSettings.layout === 'vertical' ? `calc(100% - ${280 + 1}px)` : theme.palette.appSettings.layout === 'horizontal' ? 'calc(100%)px' : `calc(100% - ${88 + 1}px)`,
          lg: theme.palette.appSettings.layout === 'vertical' ? `calc(100% - ${280 + 1}px)` : theme.palette.appSettings.layout === 'horizontal' ? 'calc(100%)px' : `calc(100% - ${88 + 1}px)`,
          md: theme.palette.appSettings.layout === 'vertical' ? 'calc(100%)px' : theme.palette.appSettings.layout === 'horizontal' ? 'calc(100%)px' : 'calc(100%)px',
          sm: theme.palette.appSettings.layout === 'vertical' ? 'calc(100%)px' : theme.palette.appSettings.layout === 'horizontal' ? 'calc(100%)px' : 'calc(100%)px',
          xs: theme.palette.appSettings.layout === 'vertical' ? 'calc(100%)px' : theme.palette.appSettings.layout === 'horizontal' ? 'calc(100%)px' : 'calc(100%)px'
        },
        display: theme.palette.appSettings.layout === 'vertical' ? 'block' : theme.palette.appSettings.layout === 'horizontal' ? 'block' : 'block',
        backdropFilter: theme.palette.appSettings.layout === 'vertical' ? 'blur(20px)' : theme.palette.appSettings.layout === 'horizontal' ? 'blur(0px)' : 'blur(20px)',
        boxShadow: 0,
        zIndex: theme.zIndex.appBar + 1,
        height:
        {
          xl: navBar ? '64px' : theme.palette.appSettings.layout === 'vertical' ? '80px' : theme.palette.appSettings.layout === 'horizontal' ? '64px' : '80px',
          lg: theme.palette.appSettings.layout === 'vertical' ? '64px' : theme.palette.appSettings.layout === 'horizontal' ? '64px' : '64px',
          md: theme.palette.appSettings.layout === 'vertical' ? '64px' : theme.palette.appSettings.layout === 'horizontal' ? '64px' : '64px',
          sm: theme.palette.appSettings.layout === 'vertical' ? '64px' : theme.palette.appSettings.layout === 'horizontal' ? '64px' : '64px',
          xs: theme.palette.appSettings.layout === 'vertical' ? '64px' : theme.palette.appSettings.layout === 'horizontal' ? '64px' : '64px',
        },
        backgroundColor:
          theme.palette.appSettings.layout === 'vertical' ? `${color.TopNavColors[100]}` :
            theme.palette.appSettings.layout === 'horizontal' ? `${navColor.navcolor[100]} !important` :
              `${color.TopNavColors[100]}`,
        transition:
          theme.palette.appSettings.layout === 'vertical' ?
            theme.transitions.create(['width', 'margin', 'height'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            })
            :
            theme.palette.appSettings.layout === 'horizontal' ? ''
              :
              theme.transitions.create(['width', 'margin', 'height'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              })
      }}>
        <Toolbar
          sx={{
            height: 1,
            px: { lg: 5 },
          }}
        >
          {renderContent}
          <DrawerIndex drawerOpen={OpenDrawer} drawerToggle={handleRightDrawerToggle} />
          <NotificationDrawer notifDrawerOpen={OpenNotif} notifdrawerToggle={handleRightNotifDrawer} />
          <SidebarMobileMode sideBarMobileOpen={OpenSidebar} sideBarMobileToggle={handleSidebarOpen} />
        </Toolbar>
      </AppBar>
      <AppBar sx={{
        display: {
          xl: theme.palette.appSettings.layout === 'vertical' ? 'none' : theme.palette.appSettings.layout === 'horizontal' ? 'block' : 'none',
          lg: theme.palette.appSettings.layout === 'vertical' ? 'none' : theme.palette.appSettings.layout === 'horizontal' ? 'block' : 'none',
          md: theme.palette.appSettings.layout === 'vertical' ? 'none' : theme.palette.appSettings.layout === 'horizontal' ? 'none' : 'none',
          sm: theme.palette.appSettings.layout === 'vertical' ? 'none' : theme.palette.appSettings.layout === 'horizontal' ? 'none' : 'none',
          xs: theme.palette.appSettings.layout === 'vertical' ? 'none' : theme.palette.appSettings.layout === 'horizontal' ? 'none' : 'none'
        },
        backdropFilter: theme.palette.appSettings.layout === 'vertical' ? 'blur(0px)' : theme.palette.appSettings.layout === 'horizontal' ? 'blur(20px)' : 'blur(0px)',
        position: 'sticky',
        boxShadow: 0,
        top: theme.palette.appSettings.layout === 'vertical' ? '0px' : theme.palette.appSettings.layout === 'horizontal' ? '64px' : '0px',
        zIndex: theme.zIndex.appBar + 1,
        height: theme.palette.appSettings.layout === 'vertical' ? '80px' : theme.palette.appSettings.layout === 'horizontal' ? '64px' : '80px',
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        backgroundColor: `${navColor.navcolor[100]} !important`
      }}>
        <Toolbar
          sx={{
            px: { lg: 5 },
            paddingLeft: '24px',
            paddingRight: '24px'
          }}
        >
          <Box>
            <TopNavContainer />
          </Box>
        </Toolbar>
      </AppBar>

      <motion.div />
    </>
  )
}

export default TopNav