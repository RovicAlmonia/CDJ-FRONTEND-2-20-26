import PropTypes from 'prop-types'
import { List, useTheme } from '@mui/material'

const CustomList = ({children}) => {
  const theme = useTheme();
  return (
    <List disablePadding
        sx={{ 
            background: 'none', 
            display: 'flex', 
            flexDirection: theme.palette.appSettings.layout === 'vertical' ? 'column' : theme.palette.appSettings.layout === 'horizontal' ? 'row' : 'column',
            gap: theme.palette.appSettings.layout === 'vertical' ? '0px' : theme.palette.appSettings.layout === 'horizontal' ? '6px' : '0px'
        }}
    >
        {children}
    </List>
  )
}

CustomList.propTypes = {
    children: PropTypes.any,
};

export default CustomList