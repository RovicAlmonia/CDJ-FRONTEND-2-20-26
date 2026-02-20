import { Stack, Typography } from "@mui/material"


const CustomNoDataRow = () => {
  return (
      <Stack sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',     
        height: '100%',
        maxHeight: 150,
        color: 'rgb(99, 115, 129)'
    }}>
        <Typography>No Data</Typography>  
    </Stack>
  )
}

export default CustomNoDataRow