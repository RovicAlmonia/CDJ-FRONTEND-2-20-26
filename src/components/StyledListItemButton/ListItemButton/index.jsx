import PropTypes from 'prop-types'
import { useTheme } from "@emotion/react"
import { Box, ListItemButton } from "@mui/material"
import { useLocation } from 'react-router-dom'
import { SvgIconColors } from '../../../themes/palette'

const ListItemButtonStyle = ({ListbtnLabel, activePath, MenuClick, IconChildrens, onMouseEnter}) => {
  const theme = useTheme();
  const sideActiveColor = SvgIconColors(theme.palette.appSettings)
  const location = useLocation();
  const isActive = location.pathname === activePath;
  return (
    <ListItemButton 
        sx={{ 
            margin: '0px 0px 4px',
            display: 'flex',
            justifyContent: theme.palette.appSettings.layout === 'collapsed' ? 'center' : 'flex-start',
            flexDirection: theme.palette.appSettings.layout === 'collapsed' ? 'column' : 'row',
            borderRadius: theme.palette.appSettings.layout === 'vertical' ? '8px' : theme.palette.appSettings.layout === 'horizontal' ? '6px' : '6px',
            minHeight: theme.palette.appSettings.layout === 'vertical' ? '44px' : theme.palette.appSettings.layout === 'horizontal' ? '32px' : '56px',
            fontSize: theme.palette.appSettings.layout === 'vertical' ? '0.875rem' : theme.palette.appSettings.layout === 'horizontal' ? '0.875rem' : '10px',
            padding: theme.palette.appSettings.layout === 'vertical' ? '4px 8px 4px 12px' : theme.palette.appSettings.layout === 'horizontal' ? '0px 6px' : '4px',
            textAlign: 'center',
            background: isActive ? `${sideActiveColor.svgcolor[600]}` : 'none',
            '&:hover': {
              backgroundColor: isActive ? `${sideActiveColor.svgcolor[600]}` : 'none',
            },
            color: isActive ? `${sideActiveColor.svgcolor[100]}` : '#637381'
        }}
        onClick={MenuClick}
        onMouseEnter={onMouseEnter}
    >
      <Box 
        sx={{ 
          display: theme.palette.appSettings.layout === 'horizontal' ? 'none' : 'flex', 
          justifyContent:'center', 
          alignItems: 'center', 
          width: '24px', 
          height: '24px', 
          flexShrink: 0, 
          marginRight: theme.palette.appSettings.layout === 'collapsed' ? '20px' : '16px',
          marginLeft: theme.palette.appSettings.layout === 'collapsed' ? '20px' : '0px',
          }}>
        {IconChildrens}
      </Box>
        {ListbtnLabel}
    </ListItemButton>
  )
}

ListItemButtonStyle.propTypes = {
    ListbtnLabel: PropTypes.any,
    activePath: PropTypes.string,
    MenuClick: PropTypes.any,
    IconChildrens: PropTypes.any,
    onMouseEnter: PropTypes.func
};

export default ListItemButtonStyle