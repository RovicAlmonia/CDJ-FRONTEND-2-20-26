
import PropTypes from 'prop-types'
import { ListSubheader, useTheme } from "@mui/material"

const ListSubHeaderStyle = ({ListLabel}) => {
  const theme = useTheme()
  return (
    <ListSubheader component="div" 
    sx={{ 
    background: 'none', 
    display: theme.palette.appSettings.layout === 'vertical' ? 'block' : theme.palette.appSettings.layout === 'horizontal' ? 'none' : 'none', 
    fontSize: '0.75rem',
    color: '#637381'
    }}>
        {ListLabel}
    </ListSubheader> 
  )
}

ListSubHeaderStyle.propTypes = {
    ListLabel: PropTypes.any
};

export default ListSubHeaderStyle