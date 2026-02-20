import { Dialog, DialogContent, DialogTitle, useMediaQuery, Grid, useTheme, IconButton } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';

export default function MainModal(props) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { title, open, setOpen, viewSize, children } = props;

    return (
        <>
            <Dialog
                fullScreen={fullScreen}
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="responsive-dialog-title"
                maxWidth={viewSize}
                fullWidth={true}
            >
                <DialogTitle id="responsive-dialog-title">
                    <Grid container sx={{ mb: 1 }} spacing={1}>
                        <Grid item xs={12} md={6} >
                            {title}
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <IconButton size="small" color="error" onClick={() => { setOpen(false) }}><CloseIcon fontSize="small" /></IconButton>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>{children}</DialogContent>
            </Dialog>
        </>
    );
}