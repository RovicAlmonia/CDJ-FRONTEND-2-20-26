import { useState, useEffect } from 'react';
import { Box, Dialog, DialogContent, Typography } from "@mui/material";
// import ConfettiExplosion from "react-confetti-explosion";
import { Checkmark } from 'react-checkmark'

// const bigExplodeProps = {
//     force: 0.6,
//     duration: 5000,
//     particleCount: 200,
// };

const ConfettiExplosions = () => {
  const [showMessage, setShowMessage] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog
      open={showMessage}
      onClose={() => setShowMessage(false)}
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: '#00A76F',
          boxShadow: 'none'
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'transparent'
        }
      }}
    >
      <Box sx={{display: 'flex', flexDirection: 'column', justifyContent:'center', alignItems:'center'}}>
      {/* <ConfettiExplosion {...bigExplodeProps} /> */}
      <DialogContent sx={{display: 'flex', flexDirection:'row', gap:2, background:'none', padding: 1.5}}>
      <Checkmark size='medium' />
        <Typography variant="h6">
          Debit and Credit is balanced
        </Typography>
      </DialogContent>
      </Box>
    </Dialog>
  );
}

export default ConfettiExplosions;
