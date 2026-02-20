import { Box, Grid, Slider, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import { SET_BORDER_RADIUS } from '../../../store/actions'
import { useDispatch, useSelector } from 'react-redux';

function valueText(value) {
    return `${value}px`;
}

const BorderRadius = () => {
  const dispatch = useDispatch();
  const customization = useSelector((state) => state.customization);
  const [borderRadius, setBorderRadius] = useState(() => {
  return localStorage.getItem('borderRadius') ? 
    parseInt(localStorage.getItem('borderRadius')) : 
    customization.borderRadius || 4;
  });

  const handleBorderRadius = (event, newValue) => {
    setBorderRadius(newValue);
    localStorage.setItem('borderRadius', newValue);
  };

  useEffect(() => {
    dispatch({ type: SET_BORDER_RADIUS, borderRadius });
  }, [dispatch, borderRadius]);

  return (
    <Box>
        <Typography sx={{
            margin: '0px 0px 12px',
            lineHeight: 1.5,
            fontSize: '0.75rem',
            fontWeight: 600
        }}>
            Border Radius</Typography>
        <Grid item xs={12} container spacing={2} alignItems="center">
            <Grid item>
                <Typography sx={{ fontSize: '0.68rem', }}>
                    4px
                </Typography>
            </Grid>
            <Grid item xs>
                <Slider 
                value={borderRadius}
                onChange={handleBorderRadius}
                getAriaValueText={valueText}
                size="small"
                color="primary"
                step={2}
                min={4}
                max={24}
                valueLabelDisplay="auto"
                sx={{
                    '& .MuiSlider-valueLabel': {
                      color: 'primary.main'
                    }
                }}
                />
            </Grid>
            <Grid item>
                <Typography sx={{ fontSize: '0.68rem', }}>
                    24px
                </Typography>
            </Grid>
        </Grid>
    </Box>
  )
}

export default BorderRadius