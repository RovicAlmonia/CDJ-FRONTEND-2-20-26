import { Box, MenuItem, Typography, useTheme } from "@mui/material"
import PropTypes from 'prop-types'
import { useLocation } from "react-router-dom";

const CustomMenuButton = ({activePath, onClick, label, badge}) => {
  const theme = useTheme(); 
  const location = useLocation();
  const isActive = location.pathname === activePath;
  return (
    <MenuItem
        sx={{ 
            display:'flex',
            justifyContent:"space-between",
            fontSize: '16px', 
            padding: '6px 8px', 
            borderRadius: '8px',
            background: isActive ? theme.palette.appSettings.paletteMode === 'dark' ? '#323C46' : '#F5F5F5' : 'none'
        }}
        onClick={onClick}
    >
        <Box>
          {label}
        </Box>
      {(badge && badge !== "0" && badge !== 0) && (
            <Box sx={{
              backgroundColor: "blue",
              borderRadius: '8px',
              padding: '2px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '24px',
              height: '24px',
            }}>
              <Typography variant="caption" sx={{ color: 'white' }}>{badge}</Typography>
            </Box>
      )}
    </MenuItem>
  )
}

CustomMenuButton.propTypes = {
    activePath: PropTypes.string,
    onClick: PropTypes.any,
    onMouseEnter: PropTypes.func,
    label: PropTypes.string,
    badge: PropTypes.string
}

export default CustomMenuButton