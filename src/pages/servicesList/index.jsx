import React from "react";
import { Helmet } from "react-helmet-async";
import { Box, Typography } from "@mui/material";
import BreadCrumbs from "../../components/BreadCrumbs";
import ServicesListInt from "./servicesListInt";

export default function ServicesList() {
  return (
    <>
      <Helmet>
        <title>Services List</title>
      </Helmet>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Services List
        </Typography>
        <BreadCrumbs items={[{ label: "Dashboard", path: "/dashboard" }, { label: "Services List" }]} />
        <Box sx={{ mt: 3 }}>
          <ServicesListInt />
        </Box>
      </Box>
    </>
  );
}