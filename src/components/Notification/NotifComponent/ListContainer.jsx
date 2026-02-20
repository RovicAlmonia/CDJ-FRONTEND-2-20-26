import PropTypes from 'prop-types'
import { List } from "@mui/material"

const ListContainer = ({children}) => {
  return (
    <List sx={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        position: 'relative'
    }}>
        {children}
    </List>
  )
}

ListContainer.propTypes = {
    children: PropTypes.any,
};

export default ListContainer