
import PropTypes from 'prop-types';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, useTheme } from "@mui/material";

const IssueCheckSwal = ({onClose, open, maxWidth, YesOnClick, NoOnClick}) => {
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
      <DialogTitle>Confirm Check Issuance.</DialogTitle>
      <DialogContent
      sx={{ 
        flex: '1 1 auto',
        overflowY: 'auto', 
        padding: '0px 24px'
      }}
      >
        <Box sx={{display: 'flex', flexDirection:'row', gap:1}}>
        Are you sure you want to ISSUE this check?
        </Box>
      </DialogContent>
      <DialogActions 
            sx={{ 
                flex: '1 1 auto',
                overflowY: 'auto', 
                padding: '15px 24px'
            }}
        >
        <Button variant="contained" color="error" onClick={YesOnClick}>Yes</Button>
        <Button variant="contained" color="secondary" onClick={NoOnClick}>No</Button>
      </DialogActions>
    </Dialog>
  )
}

IssueCheckSwal.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    DialogTitles: PropTypes.string,
    DialogAction: PropTypes.node, 
    maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    YesOnClick: PropTypes.func,
    NoOnClick: PropTypes.func,
  }

export default IssueCheckSwal