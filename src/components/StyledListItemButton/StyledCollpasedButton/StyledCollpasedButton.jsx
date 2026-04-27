import PropTypes from 'prop-types'
import { Box, ListItemButton, Stack, useTheme } from "@mui/material"
import ArrowRight from '@mui/icons-material/ArrowRight';

const StyledCollapsedButton = ({id ,handlePopoverOpen, handlePopoverClose, IconChildren, CollpaseBtnLabels, children, onClick, bgcolor, iconcolor}) => {
  const theme = useTheme();
  return (
    <ListItemButton
    sx=
    {{
      margin: '0px 0px 4px',
      display: 'flex',
      padding: theme.palette.appSettings.layout === 'vertical' ? '4px 8px 4px 12px' : theme.palette.appSettings.layout === 'horizontal' ? '0px 6px' : '4px',
      justifyContent: theme.palette.appSettings.layout === 'collapsed' ? 'center' : 'flex-start',
      flexDirection: theme.palette.appSettings.layout === 'collapsed' ? 'column' : 'row',
      borderRadius: theme.palette.appSettings.layout === 'vertical' ? '8px' : theme.palette.appSettings.layout === 'horizontal' ? '6px' : '6px',
      minHeight: theme.palette.appSettings.layout === 'vertical' ? '44px' : theme.palette.appSettings.layout === 'horizontal' ? '32px' : '56px', 
      color: iconcolor,
      cursor: 'pointer',
      backgroundColor: bgcolor
    }}
    aria-owns={id}
    aria-haspopup="true"
    onMouseEnter={handlePopoverOpen}
    onMouseLeave={handlePopoverClose}
    onClick={onClick}
  >
    <Box 
        sx={{ 
          display: theme.palette.appSettings.layout === 'horizontal' ? 'flex' : 'flex', 
          justifyContent:'center', 
          alignItems: 'center', 
          width: '24px', 
          height: '24px', 
          flexShrink: 0, 
          marginRight: theme.palette.appSettings.layout === 'vertical' ? '16px' : theme.palette.appSettings.layout === 'horizontal' ? '10px' : '0px',
          marginLeft: theme.palette.appSettings.layout === 'collapsed' ? '20px' : '0px',
          }}>
        {IconChildren}
        <ArrowRight sx={{ display: theme.palette.appSettings.layout === 'collapsed' ? 'flex' : 'none'}} />
      </Box>
      <Stack component="span" 
        sx={{
          textAlign:theme.palette.appSettings.layout === 'collapsed' ? 'center' : '',
          marginTop: theme.palette.appSettings.layout === 'collapsed' ? '7px' : '0px',
          fontSize: theme.palette.appSettings.layout === 'vertical' ? '0.875rem' 
          : theme.palette.appSettings.layout === 'horizontal' ? '0.875rem' 
          : '10px',
          flex: '1 1 auto'
        }}
      >
        {CollpaseBtnLabels}
      </Stack>
      {children}
  </ListItemButton>
  )
}

StyledCollapsedButton.propTypes = {
    id: PropTypes.string,
    handlePopoverOpen: PropTypes.func.isRequired,
    handlePopoverClose: PropTypes.func.isRequired,
    IconChildren: PropTypes.any,
    children: PropTypes.any,
    CollpaseBtnLabels: PropTypes.any,
    onClick: PropTypes.func.isRequired,
    bgcolor: PropTypes.string,
    iconcolor: PropTypes.string
};

export default StyledCollapsedButton