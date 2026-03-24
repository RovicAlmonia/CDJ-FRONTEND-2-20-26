import { Table, TableContainer } from '@mui/material'
import PropTypes from 'prop-types'
const CustomTable = ({ children, size, maxHeight  }) => {
  return (
    <TableContainer sx={{ maxHeight: maxHeight, height: '100%' }}>
        <Table stickyHeader size={size} sx={{ width: '100%' }}>
            {children}
        </Table>
    </TableContainer>
  )
}

CustomTable.propTypes = {
    children: PropTypes.node,
    size: PropTypes.string,
    maxHeight: PropTypes.number,
}

export default CustomTable