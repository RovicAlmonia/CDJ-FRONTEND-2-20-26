import { Box, Stack, Typography } from "@mui/material"

const NoData2 = () => {
  return (
    <Box>
      <Stack sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flexGrow: 1,
        color: 'rgb(99, 115, 129)'
    }}>
        <Typography>No Data Found</Typography>  
    </Stack>
    </Box>
  )
}

export default NoData2