import PropTypes from 'prop-types'
import { Box, ListItemButton, Stack, useTheme } from "@mui/material"
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
const CustomCollapseButton = ({ CollpaseBtnLabel, CollpaseClick, children, IconChildren, onMouseEnter, Leave, onKeyDown, id }) => {
  const theme = useTheme();
  
  return (
    <ListItemButton onMouseEnter={onMouseEnter} onMouseLeave={Leave} sx=
      {{
        margin: '0px 0px 4px',
        display: 'flex',
        padding: theme.palette.appSettings.layout === 'vertical' ? '4px 8px 4px 12px' : theme.palette.appSettings.layout === 'horizontal' ? '0px' : '4px',
        justifyContent: theme.palette.appSettings.layout === 'collapsed' ? 'center' : 'flex-start',
        flexDirection: theme.palette.appSettings.layout === 'collapsed' ? 'column' : 'row',
        borderRadius: theme.palette.appSettings.layout === 'vertical' ? '8px' : theme.palette.appSettings.layout === 'horizontal' ? '6px' : '6px',
        minHeight: theme.palette.appSettings.layout === 'vertical' ? '44px' : theme.palette.appSettings.layout === 'horizontal' ? '32px' : '56px', 
        color: '#637381',
        cursor: 'pointer'
      }}
      aria-owns={id}
      aria-haspopup="true"
      onClick={CollpaseClick}
      onKeyDown={onKeyDown}
    >
      <Box 
        sx={{ 
          display: theme.palette.appSettings.layout === 'horizontal' ? 'none' : 'flex', 
          justifyContent:'center', 
          alignItems: 'center', 
          width: '24px', 
          height: '24px', 
          flexShrink: 0, 
          marginRight: theme.palette.appSettings.layout === 'collapsed' ? '0px' : '16px',
          marginLeft: theme.palette.appSettings.layout === 'collapsed' ? '20px' : '0px',
          }}>
        {IconChildren}
        <ArrowRightIcon sx={{ display: theme.palette.appSettings.layout === 'collapsed' ? 'flex' : 'none'}} />
      </Box>
      <Stack component="span" 
        sx={{
          marginTop: theme.palette.appSettings.layout === 'collapsed' ? '7px' : '0px',
          fontSize: theme.palette.appSettings.layout === 'vertical' ? '0.875rem' 
          : theme.palette.appSettings.layout === 'horizontal' ? '0.875rem' 
          : '10px',
          flex: '1 1 auto'
        }}
      >
        {CollpaseBtnLabel}
      </Stack>
      {children}
    </ListItemButton>
  )
}

CustomCollapseButton.propTypes = {
  id: PropTypes.string,
  children: PropTypes.any,
  CollpaseBtnLabel: PropTypes.any,
  CollpaseClick: PropTypes.func,
  IconChildren: PropTypes.any,
  onMouseEnter: PropTypes.any,
  onKeyDown: PropTypes.func,
  Leave: PropTypes.any
};


export default CustomCollapseButton
