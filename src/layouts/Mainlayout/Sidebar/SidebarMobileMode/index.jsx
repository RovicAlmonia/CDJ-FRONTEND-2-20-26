import PropTypes from 'prop-types';
import { Drawer, useTheme } from "@mui/material"
import PerfectScrollBar from 'react-perfect-scrollbar';
import SidebarLogo from '../Logo';
import SidebarContainer from '../SidebarContainer';

const SidebarMobileMode = ({sideBarMobileOpen, sideBarMobileToggle}) => {
  const theme = useTheme();
  return (
    <Drawer
      open={sideBarMobileOpen}
      onClose={sideBarMobileToggle}
      sx={{ '& .MuiDrawer-paper': {...theme.components.MuiDrawer, maxWidth: '280px', backdropFilter: 'blur(20px)'},
          display: {
            xl: 'none',
            lg: 'none'
          }
      }}
      BackdropProps={{ invisible: false  }}
      anchor="left"
    >
        <PerfectScrollBar>
                <SidebarLogo />
                <SidebarContainer />
          </PerfectScrollBar>
    </Drawer>
  )
}

SidebarMobileMode.propTypes = {
    sideBarMobileOpen: PropTypes.bool,
    sideBarMobileToggle: PropTypes.func,
    window: PropTypes.object
};

export default SidebarMobileMode