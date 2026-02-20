import { Box, Stack, Typography } from "@mui/material";
import React, { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import BreadCrumbs from "../../../components/BreadCrumbs";
import ApprovalPage from "./ApprovalPage";


export default function index() {
  return (
    <Fragment>
      <Helmet>
        <title>Request for Approvals Page</title>
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
            <Typography variant="h4">Request for Approvals Page</Typography>
            <BreadCrumbs />
          </Box>
        </Stack>
      </Box>
      <ApprovalPage />
    </Fragment>
  );
}
