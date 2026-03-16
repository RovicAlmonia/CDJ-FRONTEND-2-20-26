import { Popover, useTheme } from "@mui/material"
import PropTypes from 'prop-types'
import CyanBlur from '../../assets/images/cyan-blur.png'
import RedBlur from '../../assets/images/red-blur.png'

const TableMenuList = ({children, anchorEl, CloseMenu, open }) => {
  const theme = useTheme()
  return (
    <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={CloseMenu}
        anchorOrigin={{
            horizontal: 'left',
            vertical: 'top',
        }}
        transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
        }}
        PaperProps={{
            sx: {
              minWidth: '16px',
              minHeight: '16px',
              maxWidth: 'calc(100% - 32px)',
              maxHeight: 'calc(100% - 32px)',
              padding: '4px',
              background: theme.palette.appSettings.paletteMode === 'dark' ? 'rgba(33, 43, 54, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              backgroundImage: `url(${CyanBlur}), url(${RedBlur})`,
              backgroundRepeat: 'no-repeat, no-repeat',
              backgroundPosition: 'right top, left bottom',
              backgroundSize: '50%, 50%',
              borderRadius: '10px',
              width: '140px',
            },
          }}
    >
        {children}
    </Popover>
  )
}

TableMenuList.propTypes = {
    children: PropTypes.node,
    anchorEl: PropTypes.object,
    CloseMenu: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
}

export default TableMenuList