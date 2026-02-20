import { Box, Button, Grow, Stack, Typography } from "@mui/material"
import Page403Error from "."
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
  const navigate = useNavigate();
  const goBack = () => {
    navigate('/');
  }
  const grow = true;
  return (
    <Grow in={grow}>
      <Box sx={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2
      }}>

        <Typography variant="h2" color="error">Access denied!</Typography>
        <Stack sx={{ textAlign: 'center' }}>
          <Typography variant="h4">You do not have permission to access this page. </Typography>
          <Typography variant="h4">Please contact the administrator for further assistance.</Typography>
          <Typography variant="h4">Thank you!</Typography>
        </Stack>
        <Page403Error />
        {/* <Typography sx={{ fontSize: '1000%' }}>403</Typography> */}
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 3, mt:2 }}>
          <Button variant="contained" size="large">Override access</Button>
          <Button variant="contained" size="large" color="error" onClick={() => { goBack() }}>Go Back</Button>
        </Stack>
      </Box>
    </Grow>
  )
}

export default AccessDenied