import PropTypes from 'prop-types';
import { Drawer, useTheme } from "@mui/material";
import NotifDrawerContainer from '../Container';


const NotificationDrawer = ({notifDrawerOpen, notifdrawerToggle}) => {
  const theme = useTheme();
  return (
    <Drawer
      sx={{ '& .MuiDrawer-paper': {...theme.components.MuiDrawer, maxWidth: '420px', backdropFilter: 'blur(20px)', 
      background: theme.palette.appSettings.paletteMode === 'dark' ? 'rgba(33, 43, 54, 0.9)' : 'rgba(255, 255, 255, 0.9)'
      } 
    }}
      open={notifDrawerOpen}
      onClose={notifdrawerToggle}
      BackdropProps={{ invisible: true  }}
      anchor="right"
    >
        <NotifDrawerContainer />
    </Drawer>
  )
}

NotificationDrawer.propTypes = {
  notifDrawerOpen: PropTypes.bool,
  notifdrawerToggle: PropTypes.func,
  window: PropTypes.object
};

export default NotificationDrawer