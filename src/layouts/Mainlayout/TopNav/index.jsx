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
import { useCallback, useEffect, useRef, useState } from 'react';
import SidebarMobileMode from '../Sidebar/SidebarMobileMode';
import TopNavLogo from './Logo';
import PerfectScrollBar from 'react-perfect-scrollbar';
import TopNavContainer from './TopNavContainer';
import { useAuth } from '../../../modules/context/AuthContext';
import NotificationDrawer from '../../../components/Notification/Drawer';
import NotificationIcon from '../../../components/svg-icons/NotificationIcon'
import { WebSocket } from '../../../main';
import StyledBadges from '../../../components/StyledBadge';
import { http } from '../../../api/http';

// ── sound files ───────────────────────────────────────────────────────────────
import notifSound from '../../../assets/NotifSound/notifSound.mp3';

const TopNav = () => {
  const theme = useTheme();
  const color = TopNavColor(theme.palette.appSettings);
  const navColor = navColors(theme.palette.appSettings);
  const btmColor = tokens(theme.palette.appSettings);
  const OpenDrawer  = useSelector((state) => state.customization.opened);
  const OpenSidebar = useSelector((state) => state.customization.openSidebarMobile);
  const OpenNotif   = useSelector((state) => state.customization.openNotif);
  const dispatch    = useDispatch();
  const lgUp        = useResponsive('up', 'lg');
  const [navBar, setNavbar]     = useState(false);
  const [notifData, setNotifData] = useState(0);

  // 🔥 Icon Flash State
  const [iconFlash, setIconFlash] = useState(false);

  // 🔥 NEW: Badge Pop State
  const [badgePop, setBadgePop] = useState(false);

  const AppSocket   = WebSocket();
  const { accessToken } = useAuth();

  const prevCountRef = useRef(0);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(notifSound);
    audioRef.current.preload = 'auto';
  }, []);

  useEffect(() => {
    const unlockAudio = () => {
      if (!audioRef.current) return;

      audioRef.current.play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        })
        .catch(() => {});

      document.removeEventListener('click', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
    };
  }, []);

  const fetchNotifCount = useCallback(async () => {
    try {
      const res = await http.get('/get-notifications');
      const data = res?.data?.data ?? res?.data ?? [];
      const unreadCount = Array.isArray(data)
        ? data.filter((n) => n.notif_status === 0).length
        : 0;

      if (unreadCount > prevCountRef.current) {

        if (audioRef.current) {
          try {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } catch (err) {
            console.log('Sound blocked:', err);
          }
        }

        // Glow flash
        setIconFlash(true);
        setTimeout(() => {
          setIconFlash(false);
        }, 700);

        // 🔴 Badge number pop
        setBadgePop(true);
        setTimeout(() => {
          setBadgePop(false);
        }, 500);
      }

      prevCountRef.current = unreadCount;
      setNotifData(unreadCount);

    } catch (err) {
      console.error('fetchNotifCount error:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifCount]);

  useEffect(() => {
    AppSocket.on('openNewNotification', () => {
      fetchNotifCount();
    });

    return () => {
      AppSocket.off('openNewNotification');
    };
  }, [AppSocket, fetchNotifCount]);

  useEffect(() => {
    const triggerHeight = () => setNavbar(window.scrollY >= 80);
    window.addEventListener('scroll', triggerHeight);
    return () => window.removeEventListener('scroll', triggerHeight);
  }, []);

  const handleRightDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !OpenDrawer });
  };

  const handleSidebarOpen = () => {
    dispatch({ type: OPEN_SIDEBAR_MOBILE, openSidebarMobile: !OpenSidebar });
  };

  const handleRightNotifDrawer = async () => {
    dispatch({ type: OPEN_NOTIF, openNotif: !OpenNotif });

    try {
      await http.post('/read-unread-notification', { LoginID: accessToken.userID });
      fetchNotifCount();
    } catch (err) {
      console.error('read-unread-notification error:', err);
    }
  };

  const renderContent = (
    <>
      {!lgUp && (
        <IconButton onClick={handleSidebarOpen} sx={{ mr: 1 }}>
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>
      )}

      {lgUp && <TopNavLogo />}

      <Typography variant="h5" sx={{ color: 'text.primary' }} noWrap>
        Good Day! {accessToken.Fname} &#128526;
      </Typography>

      <Box sx={{ flexGrow: 1 }} />

      <Stack direction="row" alignItems="center" spacing={1}>

        <IconButton size="small" onClick={handleRightNotifDrawer}>
          <StyledBadges
            badgeContent={
              notifData > 0 ? (
                <motion.span
                  animate={
                    badgePop
                      ? { scale: [1, 1.4, 1] }
                      : {}
                  }
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ display: 'inline-block' }}
                >
                  {notifData}
                </motion.span>
              ) : null
            }
            color="error"
          >
            <motion.div
              animate={
                iconFlash
                  ? {
                      scale: [1, 1.25, 1],
                      boxShadow: [
                        '0 0 0px rgba(255,0,0,0)',
                        '0 0 25px rgba(255,0,0,0.9)',
                        '0 0 0px rgba(255,0,0,0)'
                      ]
                    }
                  : {}
              }
              transition={{
                duration: 0.6,
                ease: "easeInOut"
              }}
              style={{
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <NotificationIcon color="action" />
            </motion.div>
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
      <motion.div layout animate={{ opacity: 1 }} initial={{ opacity: 0 }} exit={{ opacity: 0 }} />

      <AppBar sx={{
        borderBottom:
          theme.palette.appSettings.layout === 'vertical' ? '0px' :
          theme.palette.appSettings.layout === 'horizontal' ? '1px dashed' : '0px',
        borderColor: `${btmColor.sidebarColor[200]} !important`,
        width: {
          xl: theme.palette.appSettings.layout === 'vertical' ? `calc(100% - ${280 + 1}px)` :
              theme.palette.appSettings.layout === 'horizontal' ? 'calc(100%)px' :
              `calc(100% - ${88 + 1}px)`,
          lg: theme.palette.appSettings.layout === 'vertical' ? `calc(100% - ${280 + 1}px)` :
              theme.palette.appSettings.layout === 'horizontal' ? 'calc(100%)px' :
              `calc(100% - ${88 + 1}px)`,
          md: 'calc(100%)px',
          sm: 'calc(100%)px',
          xs: 'calc(100%)px',
        },
        display: 'block',
        backdropFilter:
          theme.palette.appSettings.layout === 'vertical' ? 'blur(20px)' :
          theme.palette.appSettings.layout === 'horizontal' ? 'blur(0px)' :
          'blur(20px)',
        boxShadow: 0,
        zIndex: theme.zIndex.appBar + 1,
        height: {
          xl: navBar ? '64px' :
              theme.palette.appSettings.layout === 'vertical' ? '80px' :
              theme.palette.appSettings.layout === 'horizontal' ? '64px' : '80px',
          lg: '64px',
          md: '64px',
          sm: '64px',
          xs: '64px',
        },
        backgroundColor:
          theme.palette.appSettings.layout === 'vertical'
            ? `${color.TopNavColors[100]}`
            : theme.palette.appSettings.layout === 'horizontal'
            ? `${navColor.navcolor[100]} !important`
            : `${color.TopNavColors[100]}`,
      }}>
        <Toolbar sx={{ height: 1, px: { lg: 5 } }}>
          {renderContent}
          <DrawerIndex drawerOpen={OpenDrawer} drawerToggle={handleRightDrawerToggle} />
          <NotificationDrawer notifDrawerOpen={OpenNotif} notifdrawerToggle={handleRightNotifDrawer} />
          <SidebarMobileMode sideBarMobileOpen={OpenSidebar} sideBarMobileToggle={handleSidebarOpen} />
        </Toolbar>
      </AppBar>

      <motion.div />
    </>
  );
};

export default TopNav;