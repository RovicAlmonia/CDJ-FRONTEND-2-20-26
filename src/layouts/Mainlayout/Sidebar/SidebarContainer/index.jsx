import { Box, Stack, useTheme } from "@mui/material";
import OverView from "./Overview";
const SidebarContainer = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          paddingLeft:
            theme.palette.appSettings.layout === "collapsed" ? "3px" : "16px",
          paddingRight:
            theme.palette.appSettings.layout === "collapsed" ? "3px" : "16px",
        }}
      >
        
        <OverView />
      </Box>
    </Box>
  );
};

export default SidebarContainer;
