import { Box } from "@mui/material"
import { useResponsive } from "../../hooks/use-responsive"
import PropTypes from 'prop-types';

const MainCard = ({ sx, ...other }) => {
  const lgUp = useResponsive('up', 'lg');
  return (
    <Box
        sx={{
            flexGrow: 1,
            minHeight: 1,
            display: 'flex',
            flexDirection: 'column',
            py: `${64 + 8}px`, 
            ...(lgUp && {
                px: 2,
                py: `${80 + 8}px`,
                width: `calc(100% - ${280}px)`,
            }),
            ...sx,
        }}
        {...other}
    >

    </Box>
  )
}

MainCard.propTypes = {
    sx: PropTypes.object,
};

export default MainCard