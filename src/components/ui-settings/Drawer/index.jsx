import PropTypes from 'prop-types';
import { Drawer, useTheme } from "@mui/material";
import DrawerContainer from '../Container';


const DrawerIndex = ({drawerOpen, drawerToggle}) => {
  const theme = useTheme();
  return (
    <Drawer
      sx={{ '& .MuiDrawer-paper': {...theme.components.MuiDrawer, maxWidth: '280px', backdropFilter: 'blur(20px)'} }}
      open={drawerOpen}
      onClose={drawerToggle}
      BackdropProps={{ invisible: true  }}
      anchor="right"
    >
        <DrawerContainer />
    </Drawer>
  )
}

DrawerIndex.propTypes = {
    drawerOpen: PropTypes.bool,
    drawerToggle: PropTypes.func,
    window: PropTypes.object
};

export default DrawerIndex