import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

export default function CustomConfirmationDialog({
  openState,
  dialogTitle,
  dialogDescription,
  dialogAction,
}) {
  const [open, setOpen] = openState;

  const handleClose = () => {
    setOpen(false);
  };

  const handleOk = async () => {
    const result = await dialogAction();
    if (result === true) {
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="custom-confirm-dialog-title"
      aria-describedby="custom-confirm-dialog-description"
    >
      <DialogTitle id="custom-confirm-dialog-title">
        {dialogTitle}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="custom-confirm-dialog-description">
          {dialogDescription}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleOk} color="primary" variant="contained">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
