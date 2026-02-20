import { Skeleton, ListItemAvatar } from "@mui/material"
const SkeletonAvatar = () => {
  return (
    <ListItemAvatar sx={{
        flexShrink: 0,
        minWidth: 0,
        marginRight: '16px'
    }}>
        <Skeleton variant="circular" width={40} height={40} />
    </ListItemAvatar>
  )
}

export default SkeletonAvatar