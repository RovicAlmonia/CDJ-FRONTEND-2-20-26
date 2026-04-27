import PropTypes from 'prop-types'
import { Popover, Typography, useTheme } from '@mui/material'
import CyanBlur from '../../assets/images/cyan-blur.png'
import RedBlur from '../../assets/images/red-blur.png'
const PopoverStyled = ({ id, opens, anchorElHere, ClosePopOver  }) => {
  const theme = useTheme();
  return (
       <>
       {theme.palette.appSettings.layout === 'vertical' ? (
        ''
       ): (
         <Popover
          id={id}
          open={opens}
          anchorEl={anchorElHere}
          onClose={ClosePopOver}
          anchorOrigin={{
            vertical: theme.palette.appSettings.layout === 'collapsed' ? 'top' : 'bottom',
            horizontal: theme.palette.appSettings.layout === 'collapsed' ? 'right' : 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          disableRestoreFocus
          PaperProps={{
            sx: {
              p: 4,
              width: 160,
              background: theme.palette.appSettings.paletteMode === 'dark' ? 'rgba(33, 43, 54, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              backgroundImage: `url(${CyanBlur}), url(${RedBlur})`,
              backgroundRepeat: 'no-repeat, no-repeat',
              backgroundPosition: 'right top, left bottom',
              backgroundSize: '50%, 50%',
              boxShadow: theme.palette.appSettings.paletteMode === 'dark' ? 'rgba(0, 0, 0, 0.24) 0px 0px 2px 0px, rgba(0, 0, 0, 0.24) -20px 20px 40px -4px' : 'rgba(145, 158, 171, 0.24) 0px 0px 2px 0px, rgba(145, 158, 171, 0.24) -20px 20px 40px -4px',
              borderRadius: '10px',
              minHeight: '16px',
              maxWidth: 'calc(100% - 32px)',
              maxHeight: 'calc(100% - 32px)',
              minWidth: '160px',
              pointerEvents: 'auto',
            },
          }}
        >
          <Typography sx={{ p: 2 }}>The content of the popover.</Typography>
        </Popover>
       )}
       </>
  )
}

PopoverStyled.propTypes = {
    id: PropTypes.string,
    opens: PropTypes.bool,
    anchorElHere: PropTypes.instanceOf(Element),
    ClosePopOver: PropTypes.func.isRequired,
};

export default PopoverStyled