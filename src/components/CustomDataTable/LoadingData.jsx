import { Box, CircularProgress, Stack, Typography } from "@mui/material"
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

const dotFlashing = keyframes`
  0% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
`;

const DotFlashing = styled('div')`
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 2px;
  background-color: currentColor;
  border-radius: 50%;
  animation: ${dotFlashing} 1s infinite linear alternate;
  &:nth-of-type(1) {
    animation-delay: 0s;
  }
  &:nth-of-type(2) {
    animation-delay: 0.2s;
  }
  &:nth-of-type(3) {
    animation-delay: 0.4s;
  }
`;

const LoadingData = () => {
  return (
    <Box sx={{ padding: 2 }}>
      <Stack sx={{
        display: 'flex',
        flexDirection: 'colum',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        height: '100%',
        borderRadius: '16px',
        flexGrow: 1,
        color: 'rgb(99, 115, 129)',
        gap:2.5
    }}>
        <CircularProgress color="inherit" />
        <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}><Typography sx={{mr:1}}>Retrieving Data</Typography> <DotFlashing /><DotFlashing /><DotFlashing /></Box>
    </Stack>
    </Box>
  )
}

export default LoadingData