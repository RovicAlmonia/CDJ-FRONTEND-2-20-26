import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useTheme } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { OPEN_DELETESWAL } from '../../store/actions';

const DeleteSwal = ({maxWidth, onClick}) => {
  const theme = useTheme();
  const open = useSelector((state) => state.customization.confirmDelete);
  const dispatch = useDispatch();
  const CloseDialog = () => {dispatch({ type: OPEN_DELETESWAL, confirmDelete: false })}
  return (
    <Dialog
    maxWidth={maxWidth}
    fullWidth={true}
    onClose={CloseDialog} 
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
      <DialogTitle>Confirm Deletion.</DialogTitle>
      <DialogContent
      sx={{ 
        flex: '1 1 auto',
        overflowY: 'auto', 
        padding: '0px 24px'
      }}
      >
        Are you sure you want to delete this data?
      </DialogContent>
      <DialogActions 
            sx={{ 
                flex: '1 1 auto',
                overflowY: 'auto', 
                padding: '15px 24px'
            }}
        >
        <Button variant="contained" color="error" onClick={onClick}>Yes</Button>
        <Button variant="contained" color="secondary" onClick={CloseDialog}>No</Button>
      </DialogActions>
    </Dialog>
  )
}

DeleteSwal.propTypes = {
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  onClick: PropTypes.func,
}

export default DeleteSwal