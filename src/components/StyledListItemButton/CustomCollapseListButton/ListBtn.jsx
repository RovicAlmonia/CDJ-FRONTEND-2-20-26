import { Box, ListItemButton, Typography, useTheme } from '@mui/material'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom';
import { SvgIconColors } from '../../../themes/palette';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useEffect, useState } from 'react';

const ListBtn = ({ activePath, onClick, onMouseEnter, label, badge }) => {
  const theme = useTheme(); 
  const location = useLocation();
  const isActive = location.pathname === activePath;
  const hoverColor = SvgIconColors(theme.palette.appSettings)

  return (
    <ListItemButton sx={{
        margin: '0px 0px 4px',
        padding: '4px 8px 4px 12px',
        minHeight: '36px',
        display: 'flex',
        fontSize: '0.875rem',
        borderRadius: '6px',
        color: isActive ? theme.palette.appSettings.paletteMode === 'dark' ? 'white' : 'black' : '#637381',
        justifyContent:"space-between"
    }}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    >   
    <Box sx={{display:"flex"}}>
      <Box sx={{
          display: 'flex', 
          justifyContent:'center', 
          alignItems: 'center', 
          width: '24px', 
          height: '24px', 
          flexShrink: 0, 
          marginRight: '16px',
        }}>
          <FiberManualRecordIcon sx={{ fontSize: '5px',
              transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms', 
              transform: isActive ? 'scale(2.5)' : 'scale(1)',
              color: isActive ? `${hoverColor.svgcolor[100]}` : '#637381'
              }} />
        </Box>
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
    </ListItemButton>
  )
}

ListBtn.propTypes = {
    activePath: PropTypes.string,
    onClick: PropTypes.any,
    onMouseEnter: PropTypes.func,
    label: PropTypes.string,
    badge: PropTypes.string,

}

export default ListBtn