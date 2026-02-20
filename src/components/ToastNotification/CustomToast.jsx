import { IconButton, Stack, Typography } from "@mui/material";
import toast from "react-hot-toast";
import CloseIcon from '@mui/icons-material/Close';
import Avatar from "react-avatar";


export const CustomToast = (avatarname, name) => {
    toast((t) => (
        <Stack sx={{ display:'flex', paddingBottom: 1, width:'100%'}}>
            <Stack sx={{display: 'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Typography fontSize={11}>Notification</Typography>
                <IconButton color="error" size="small" onClick={() => toast.dismiss(t.id)}>
                    <CloseIcon fontSize="inherit" />
                </IconButton>
            </Stack>
            <Stack sx={{display: 'flex', flexDirection:'row', gap:1}}>
            <Stack sx={{display: 'flex', justifyContent:'center', alignItems:'center'}}>
            <Avatar
                name={avatarname}
                size="35" 
                round={true}
            />
            </Stack>
            <Stack sx={{display: 'flex', flexDirection:'column', justifyContent:'center'}}>
                <Typography fontSize={15}>New Transaction from: {name}</Typography>
            </Stack>
            </Stack>
        </Stack>
    ));
};