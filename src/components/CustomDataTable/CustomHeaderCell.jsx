import PropTypes from 'prop-types'
import { TableCell, Typography, useTheme } from "@mui/material"

const CustomHeaderCell = ({children, width, textAlign}) => {
  const theme = useTheme();
  return (
    <TableCell 
        sx={{    
        width: width,  
        backgroundColor: theme.palette.appSettings.paletteMode === 'dark' ? 'rgb(40,50,61)' : '', 
        color: 'rgb(99, 115, 129)' ,
        borderBottom: theme.palette.appSettings.paletteMode === 'dark' ? '1px dashed rgb(46, 50, 54)' : '1px dashed rgb(241, 243, 244)',
        textAlign: textAlign
        }}
        >
        <Typography>{children}</Typography>
    </TableCell>
  )
}

CustomHeaderCell.propTypes = {
    children: PropTypes.any,
    width: PropTypes.string,
    textAlign: PropTypes.string,
}

export default CustomHeaderCell