import { Stack } from "@mui/material"
import OverView from "../../Sidebar/SidebarContainer/Overview"

const TopNavContainer = () => {
  return (
    <Stack sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
    }}>
        <OverView />
    </Stack>
  )
}

export default TopNavContainer