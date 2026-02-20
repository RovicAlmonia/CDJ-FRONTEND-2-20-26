import PropTypes from 'prop-types'
import { ListItemButton } from "@mui/material"

const NotifButton = ({children}) => {
  return (
    <ListItemButton sx={{
        WebkitTapHighlightColor: 'transparent', 
        backgroundColor: 'transparent', 
        outline: 0,
        borderWidth: '0px 0px 1px',
        borderTopStyle: 'initial',
        borderLeftStyle: 'initial',
        borderTopColor: 'initial',
        borderRightColor: 'initial',
        borderLeftColor: 'initial',
        borderImage: 'initial',
        margin: 0,
        borderRadius: 0,
        cursor: 'pointer',
        userSelect: 'none',
        verticalAlign: 'middle',
        appearance: 'none',
        color: 'inherit',
        display: 'flex',
        WebkitBoxFlex: 1,
        flexGrow: 1,
        WebkitBoxPack: 'start',
        justifyContent: 'flex-start',
        WebkitBoxAlign: 'center',
        position: 'relative',
        textDecoration: 'none',
        padding: '20px',
        alignItems: 'flex-start',
        borderBottom: '1px dashed',
        borderBottomColor: 'rgba(145, 158, 171, 0.2)'
    }}>
        {children}
    </ListItemButton>
  )
}

NotifButton.propTypes = {
    children: PropTypes.any,
};

export default NotifButton