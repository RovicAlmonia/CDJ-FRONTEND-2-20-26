import { TableHead, TableRow } from '@mui/material'
import PropTypes from 'prop-types'

const TableHeader = ({children}) => {
  return (
    <TableHead sx={{zIndex:0}}>
        <TableRow>
            {children}
        </TableRow>
    </TableHead>
  )
}

TableHeader.propTypes = {
    children: PropTypes.node
}

export default TableHeader