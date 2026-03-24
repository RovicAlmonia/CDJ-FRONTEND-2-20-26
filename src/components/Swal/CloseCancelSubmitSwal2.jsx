import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useTheme } from "@mui/material";

const ConfirmationSwal = (props) => {
    const { openConfirmation, maxWidth, onClose, onConfirm, confirmTitle } = props;
    const theme = useTheme();
    const CloseDialog = () => { onClose(false) }
    return (
        <Dialog
            maxWidth={maxWidth}
            fullWidth={true}
            onClose={CloseDialog}
            open={openConfirmation}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(22, 28, 36, 0.8)',
                }
            }}
            sx={{
                overflowY: 'auto',
                boxShadow: theme.palette.appSettings.paletteMode === 'dark' ? 'rgba(0, 0, 0, 0.24) -40px 40px 80px -8px' : 'rgba(0, 0, 0, 0.24) -40px 40px 80px -8px'
            }}>
            <DialogTitle>Confirmation</DialogTitle>
            <DialogContent
                sx={{
                    flex: '1 1 auto',
                    overflowY: 'auto',
                    padding: '0px 24px'
                }}
            >
                {confirmTitle ? confirmTitle : 'Are you sure?'}
            </DialogContent>
            <DialogActions
                sx={{
                    flex: '1 1 auto',
                    overflowY: 'auto',
                    padding: '15px 24px'
                }}
            >
                <Button variant="contained" color="error" onClick={onConfirm}>Yes</Button>
                <Button variant="contained" color="secondary" onClick={CloseDialog}>No</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmationSwal