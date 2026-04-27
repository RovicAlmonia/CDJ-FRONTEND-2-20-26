import { Box, Stack, Typography } from "@mui/material";
import React, { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import BreadCrumbs from "../../../components/BreadCrumbs";
import EditSalaries from "./EditSalaries";

export default function Index() {
  return (
    <Fragment>
      <Helmet>
        <title>Edit Employee Salary</title>
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
            <Typography variant="h4">Edit Employee Salary</Typography>
            <BreadCrumbs />
          </Box>
        </Stack>
      </Box>
      <EditSalaries />
    </Fragment>
  );
}
