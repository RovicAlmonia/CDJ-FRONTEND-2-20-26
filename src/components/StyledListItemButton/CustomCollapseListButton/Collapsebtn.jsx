import PropTypes from 'prop-types'
import { Collapse, List, useTheme } from "@mui/material"

const Collapsebtn = ( { stateOpen, children } ) => {
  const theme = useTheme();
  return (
    <Collapse in={stateOpen} timeout="auto" unmountOnExit sx={{ display: theme.palette.appSettings.layout === 'horizontal' ? 'none' : theme.palette.appSettings.layout === 'collapsed' ? 'none' : 'block' }}>
        <List component="div" disablePadding>
            {children}
        </List>
    </Collapse>
  )
}

Collapsebtn.propTypes = {
    stateOpen: PropTypes.bool,
    children: PropTypes.any,
};

export default Collapsebtn