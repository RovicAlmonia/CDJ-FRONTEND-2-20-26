import PropTypes from 'prop-types'
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, useTheme } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';

const CustomDialog = ({onClose, open, DialogTitles, DialogContents, DialogAction, maxWidth, fullScreen, width}) => {
  const theme = useTheme();
  return (
    <Dialog
    fullScreen={fullScreen} 
    maxWidth={maxWidth}
    width={width}
    fullWidth={true}
    onClose={onClose} 
    open={open} 
    BackdropProps={{
        sx: {
          backgroundColor: 'rgba(22, 28, 36, 0.8)',
        }
    }}
    sx={{
        overflowY: 'auto',
        boxShadow: theme.palette.appSettings.paletteMode === 'dark' ? 'rgba(0, 0, 0, 0.24) -40px 40px 80px -8px' : 'rgba(0, 0, 0, 0.24) -40px 40px 80px -8px'
    }}>
        <DialogTitle sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography>{DialogTitles}</Typography>
            <IconButton size="small" color="error" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{display:"flex", justifyContent:"center"}}>{DialogContents}
        </DialogContent>
        <DialogActions 
            sx={{ 
                flex: 'auto',
                overflowY: 'auto', 
                padding: '15px 24px'
            }}
        >
            {DialogAction}
        </DialogActions>
    </Dialog>
  )
}

CustomDialog.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    DialogTitles: PropTypes.string,
    DialogContents: PropTypes.node,
    DialogAction: PropTypes.node, 
    maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    width: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    fullScreen: PropTypes.bool
}


export default CustomDialog