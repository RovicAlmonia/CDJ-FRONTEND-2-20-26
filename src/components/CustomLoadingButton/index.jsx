import PropTypes from 'prop-types'
import { Button, CircularProgress } from "@mui/material"
import { useTheme } from '@emotion/react'

const CustomLoadingButton = ( {isDisabled, label, btnSize, btnVariant, btnClick, type, fullWidth, color, startIcon} ) => {
  const theme = useTheme();
  return (
    <Button 
     type={type}
     onClick={btnClick}
     size={btnSize}
     startIcon={isDisabled ? <CircularProgress size={13} sx={{ color: theme.palette.appSettings.paletteMode === 'dark' ? 'white' : 'black', }} /> : startIcon}
     variant={btnVariant}
     disabled={isDisabled}
     fullWidth={fullWidth}
     color={color}
    >
        {label}
    </Button>
  )
}

CustomLoadingButton.propTypes = {
    isDisabled: PropTypes.bool,
    label: PropTypes.any,
    btnSize: PropTypes.any,
    btnVariant: PropTypes.any,
    btnClick: PropTypes.any,
    type: PropTypes.string,
    fullWidth: PropTypes.bool,
    color: PropTypes.any,
    startIcon: PropTypes.node
};

export default CustomLoadingButton