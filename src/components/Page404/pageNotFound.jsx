import { Box, Button, Grow, Stack, Typography } from "@mui/material"
import Page404Error from "."
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
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
        gap: 5
      }}>

        <Typography variant="h2">Page Not Found! &#128565;</Typography>
        <Stack sx={{ textAlign: 'center' }}>
          <Typography variant="h4">The url you are trying to access is not in our system. </Typography>
          <Typography variant="h4">Please contact the administrator for further assistance.</Typography>
          <Typography variant="h4">Thank you!</Typography>
        </Stack>
        {/* <Page404Error /> */}
        <Typography sx={{ fontSize: '1000%' }}>404</Typography>
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
          {/* <Button variant="contained" size="large">Override access</Button> */}
          <Button variant="contained" size="large" color="error" onClick={() => { goBack() }}>Go Back</Button>
        </Stack>
      </Box>
    </Grow>
  )
}

export default PageNotFound