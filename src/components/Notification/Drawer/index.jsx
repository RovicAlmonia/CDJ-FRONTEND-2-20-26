import PropTypes from 'prop-types';
import { Drawer, useTheme } from "@mui/material";
import NotifDrawerContainer from '../Container';

const NotificationDrawer = ({ notifDrawerOpen, notifdrawerToggle }) => {
  const theme = useTheme();
  const isDark = theme.palette.appSettings.paletteMode === 'dark';

  return (
    <Drawer
      sx={{
        '& .MuiDrawer-paper': {
          ...theme.components.MuiDrawer,
          maxWidth: '420px',
          backdropFilter: 'blur(20px)',
          background: isDark
            ? 'rgba(33, 43, 54, 0.9)'
            : 'rgba(226, 228, 231, 0.95)', // ash grey, matches sidebar
        },
      }}
      open={notifDrawerOpen}
      onClose={notifdrawerToggle}
      BackdropProps={{ invisible: true }}
      anchor="right"
    >
      <NotifDrawerContainer />
    </Drawer>
  );
};

NotificationDrawer.propTypes = {
  notifDrawerOpen: PropTypes.bool,
  notifdrawerToggle: PropTypes.func,
  window: PropTypes.object,
};

export default NotificationDrawer;