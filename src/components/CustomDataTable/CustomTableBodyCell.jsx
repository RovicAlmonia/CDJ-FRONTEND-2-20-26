import { TableCell, useTheme } from '@mui/material'
import PropTypes from 'prop-types'

const CustomTableBodyCell = ({children, width, display, justifyContent, alignItems, textAlign, padding, background}) => {
  const theme = useTheme();
  return (
    <TableCell sx={{ 
        borderBottom: theme.palette.appSettings.paletteMode === 'dark' ? '1px dashed rgb(46, 50, 54)' : '1px dashed rgb(241, 243, 244)', 
        width: width, 
        borderLeft: 'none', 
        borderRight: 'none', 
        textAlign: textAlign, 
        padding: padding, 
        display: display,
        justifyContent: justifyContent, 
        alignItems: alignItems,
        background:background
        }}>
        {children}
    </TableCell>
  )
}

CustomTableBodyCell.propTypes = {
    children: PropTypes.node,
    width: PropTypes.string,
    display: PropTypes.string,
    justifyContent: PropTypes.string,
    alignItems: PropTypes.string,
    textAlign: PropTypes.string,
    padding: PropTypes.number,
    background: PropTypes.string,
}

export default CustomTableBodyCell