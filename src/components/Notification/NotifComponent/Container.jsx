import PropTypes from 'prop-types'
import { Stack } from '@mui/material'


const DataContainer = ({children}) => {
  return (
    <Stack sx={{
        display: 'flex',
        flexDirection: 'column',
        WebkitBoxFlex: 1,
        flexGrow: 1
    }}>
        {children}
    </Stack>
  )
}

DataContainer.propTypes = {
    children: PropTypes.any,
};

export default DataContainer