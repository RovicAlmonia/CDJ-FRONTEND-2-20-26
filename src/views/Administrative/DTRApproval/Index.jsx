import { Box, Stack, Typography } from "@mui/material";
import { Fragment } from "react";

import { Helmet } from "react-helmet-async";
import BreadCrumbs from "../../../components/BreadCrumbs";
import DTRPrep from "./DTRPrep";

const Index = () => {
  return (
    <Fragment>
      <Helmet>
        <title>DTR Approval</title>
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
            <Typography variant="h4">DTR Approval</Typography>
            <BreadCrumbs />
          </Box>
        </Stack>
      </Box>
      <DTRPrep />
    </Fragment>
  );
};

export default Index;
