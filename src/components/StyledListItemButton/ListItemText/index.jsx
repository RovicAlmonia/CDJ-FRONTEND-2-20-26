import PropTypes from 'prop-types'
import { ListItemText, useTheme } from "@mui/material"

const CustomItemText = ({textLabel}) => {
  const theme = useTheme();
  return (
    <ListItemText primary={textLabel} sx={{ fontSize: theme.palette.appSettings.layout === 'vertical' ? '0.875rem' : theme.palette.appSettings.layout === 'horizontal' ? '0.875rem' : '10px' }}  />
  )
}

CustomItemText.propTypes = {
    textLabel: PropTypes.any,
};

export default CustomItemText