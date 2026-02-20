import { ListItemIcon, MenuItem, Typography } from '@mui/material'
import PropTypes from 'prop-types'

const TableMenuItem = ({ListTypo, ListIcon, color, onClick}) => {
  return (
    <MenuItem sx={{
        padding: '6px 8px',
        borderRadius: '6px',
        lineHeight: 1.57143,
    }}
    onClick={onClick}
    >
        <ListItemIcon>
            {ListIcon}
        </ListItemIcon>
        <Typography sx={{fontSize: '0.875rem'}} color={color}>
            {ListTypo}
        </Typography>
        
    </MenuItem>
  )
}

TableMenuItem.propTypes = {
    ListTypo: PropTypes.string,
    ListIcon: PropTypes.node,
    color: PropTypes.string,
    onClick: PropTypes.func
}

export default TableMenuItem