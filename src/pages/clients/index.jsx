import { Helmet } from "react-helmet-async";
import { Typography, Box, Stack, useTheme } from "@mui/material";
import { Fragment, useContext } from "react";
import { AuthContext } from "../../modules/context/AuthContext";
import { SvgIconColors } from "../../themes/palette";
import BreadCrumbs from "../../components/BreadCrumbs";
import ClientInt from "./clientInt";

const Clients = () => {
  const theme = useTheme();
  const bgColor = SvgIconColors(theme.palette.appSettings);
  const { accessToken } = useContext(AuthContext);

  return (
    <Fragment>
      <Helmet>
        <title>Clients</title>
      </Helmet>
      <Box sx={{ mb: "20px" }}>
        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <Typography variant="h4">Clients</Typography>
            <BreadCrumbs />
          </Box>
        </Stack>
      </Box>
      <ClientInt />
    </Fragment>
  );
};

export default Clients;