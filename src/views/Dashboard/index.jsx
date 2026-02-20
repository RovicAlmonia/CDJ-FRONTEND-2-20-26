import { Helmet } from "react-helmet-async";
import {
  Typography,
  Button,
  Box,
  Badge,
  Fab,
  Stack,
  useTheme,
} from "@mui/material";
import { Fragment, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../modules/context/AuthContext";
import { SvgIconColors } from "../../themes/palette";
import { hookContainer } from "../../hooks/globalQuery";
import BreadCrumbs from "../../components/BreadCrumbs";
import Content from "./Content";

const Dashboard = () => {
  const theme = useTheme();
  const bgColor = SvgIconColors(theme.palette.appSettings);

  const { accessToken } = useContext(AuthContext);

  const { data: PayrollPeriod } = hookContainer("/get-payroll-active?Type=Q");

  return (
    <Fragment>
          <Helmet>
            <title></title>
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
                <Typography variant="h4"></Typography>
                <BreadCrumbs />
              </Box>
            </Stack>
          </Box>
          <Content />
    </Fragment>
  );
};

export default Dashboard;
