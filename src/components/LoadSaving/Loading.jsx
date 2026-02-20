import { Box, Typography } from "@mui/material";
import MDDotFlash from "../DotFlash/mdDotflash";
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';


export default function LoadSaving(props) {
    const { title } = props;
    return(
        <Box sx={{display: 'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height: '90vh', gap:3}}>
            <CircularProgress size="3rem" />
            <Typography variant="h3">{title} <MDDotFlash /> </Typography>
        </Box>
    )
}

LoadSaving.propTypes = {
    title: PropTypes.string,
  };