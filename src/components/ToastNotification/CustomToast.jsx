import { IconButton, Stack, Typography } from "@mui/material";
import toast from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";
import Avatar from "react-avatar";

export const showCustomToast = ({ avatarname, name }) => {
  toast((t) => (
    <Stack sx={{ paddingBottom: 1, width: "100%" }}>
      {/* Header */}
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontSize={11}>Notification</Typography>
        <IconButton
          color="error"
          size="small"
          onClick={() => toast.dismiss(t.id)}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </Stack>
      {/* Body */}
      <Stack sx={{ flexDirection: "row", gap: 1 }}>
        <Stack sx={{ justifyContent: "center", alignItems: "center" }}>
          <Avatar name={avatarname} size="35" round />
        </Stack>
        <Stack sx={{ justifyContent: "center" }}>
          <Typography fontSize={15}>
            New Transaction from: {name}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  ));
};