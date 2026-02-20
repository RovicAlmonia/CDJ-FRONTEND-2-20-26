import { TableBody } from "@mui/material"
import PropTypes from 'prop-types'

const CustomTableBody = ({children}) => {
  return (
    <TableBody>
          {children}
    </TableBody>
  )
}

CustomTableBody.propTypes = {
    children: PropTypes.node
}

export default CustomTableBody