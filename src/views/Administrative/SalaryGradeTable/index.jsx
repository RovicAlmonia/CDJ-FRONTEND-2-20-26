import { Box, Stack, Typography } from "@mui/material";
import React, { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import BreadCrumbs from "../../../components/BreadCrumbs";
import SalaryGrade from "./SalaryGrade";

export default function index() {
  return (
    <Fragment>
      <Helmet>
        <title>Salary Grade Table</title>
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
            <Typography variant="h4">Salary Grade Table</Typography>
            <BreadCrumbs />
          </Box>
        </Stack>
      </Box>
      <SalaryGrade />
    </Fragment>
  );
}
