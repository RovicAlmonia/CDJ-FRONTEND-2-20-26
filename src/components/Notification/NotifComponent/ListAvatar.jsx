import { Avatar, ListItemAvatar } from "@mui/material"

const ListAvatar = () => {
  return (
    <ListItemAvatar sx={{
        flexShrink: 0,
        minWidth: 0,
        marginRight: '16px'
    }}>
        <Avatar />
    </ListItemAvatar>
  )
}

export default ListAvatar