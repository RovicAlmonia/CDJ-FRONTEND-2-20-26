
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, useTheme } from "@mui/material";


const LoginOverride = ({onClose, open, maxWidth, YesOnClick, NoOnClick}) => {
  const theme = useTheme()
  return (
    <Dialog
    maxWidth={maxWidth}
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
      <DialogTitle>Admin Authentication required!</DialogTitle>
      <DialogContent sx={{
       flex: '1 1 auto',
       overflowY: 'auto', 
       padding: '0px 24px',
      }}>
        <TextField variant="outlined" label="Username" fullWidth sx={{mb:1}} />
        <TextField variant="outlined" label="Password" fullWidth />
      </DialogContent>
      <DialogActions 
            sx={{ 
                flex: '1 1 auto',
                overflowY: 'auto', 
                padding: '15px 24px',
            }}
        >
        <Button variant="contained" color="error" onClick={YesOnClick}>Yes</Button>
        <Button variant="contained" color="secondary" onClick={NoOnClick}>No</Button>
      </DialogActions>
    </Dialog>
  )
}

LoginOverride.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    DialogTitles: PropTypes.string,
    DialogAction: PropTypes.node, 
    maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    YesOnClick: PropTypes.func,
    NoOnClick: PropTypes.func,
  }

export default LoginOverride