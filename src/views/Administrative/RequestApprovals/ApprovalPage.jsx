import { Badge, Box, Paper } from "@mui/material";
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { hookContainer } from "../../../hooks/globalQuery";

export default function ApprovalPage() {
  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? "#1976d2" : "#FFFFFF",
    fontWeight: isActive ? "bold" : "normal",
    textDecoration: "none",
    padding: "8px",
    display: "inline-block",
    borderBottom: isActive ? "2px solid #1976d2" : "2px solid transparent",
  });

  const { data: AbsentData } = hookContainer("/get-approval-absent");
  const AbsentList = Array.isArray(AbsentData)
    ? AbsentData?.map((row) => {
        return {
          ...row,
          id: row.id,
        };
      })
    : [];
  const { data: backpay } = hookContainer("/get-approval-BackPay");
  const BackPayList = Array.isArray(backpay)
    ? backpay?.map((row) => {
        return {
          ...row,
          id: row.did,
        };
      })
    : [];
  const { data: loans } = hookContainer("/get-approval-loans");
  const loanList = Array.isArray(loans)
    ? loans?.map((row) => {
        return {
          ...row,
          id: row.CAID,
          FullName: `${row.CAEmployeeLName}, ${row.CAEmployeeName}`,
        };
      })
    : [];
  const { data: OT } = hookContainer("/get-approval-ot");
  const OTList = Array.isArray(OT)
    ? OT?.map((row) => {
        return {
          ...row,
          id: row.OTid,
          time: `${row.OTTimeFrom} - ${row.OTTimeTo}`,
        };
      })
    : [];
  const { data: otherDeductions } = hookContainer(
    "/get-approval-otherDeductions"
  );
  const otherDeductionList = Array.isArray(otherDeductions)
    ? otherDeductions?.map((row) => {
        return {
          ...row,
          id: row.did,
        };
      })
    : [];
  const { data: OTOff } = hookContainer("/get-approval-otoff");
  const OTOffList = Array.isArray(OTOff)
    ? OTOff?.map((row) => {
        return {
          ...row,
          id: row.id,
          ottime: `${row.otTimeFrom} - ${row.otTimeTo}`,
        };
      })
    : [];
  const { data: SL } = hookContainer("/get-approval-sl");
  const SLList = Array.isArray(SL)
    ? SL?.map((row) => {
        return {
          ...row,
          id: row.id,
        };
      })
    : [];
  const { data: VL } = hookContainer("/get-approval-vl");
  const VLList = Array.isArray(VL)
    ? VL?.map((row) => {
        return {
          ...row,
          id: row.id,
        };
      })
    : [];

  return (
    <Box>
      <Paper sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{display:"flex", gap: 2, padding: 1}}>
          <NavLink
            to="/dashboard/request-approval/BackPay"
            style={navLinkStyle}
          >
            <Badge badgeContent={BackPayList?.length} color="warning">
              BackPay/Adjustments
            </Badge>
          </NavLink>

          <NavLink to="/dashboard/request-approval/OT" style={navLinkStyle}>
            <Badge badgeContent={OTList?.length} color="warning">
              Overtime
            </Badge>
          </NavLink>
          <NavLink
            to="/dashboard/request-approval/other-deductions"
            style={navLinkStyle}
          >
            <Badge badgeContent={otherDeductionList?.length} color="warning">
              Other Deductions
            </Badge>
          </NavLink>
          <NavLink
            to="/dashboard/request-approval/special-ca"
            style={navLinkStyle}
          >
            <Badge badgeContent={loanList?.length} color="warning">
              Special CA / Loans
            </Badge>
          </NavLink>
        </Box>
        <Box sx={{display:"flex", gap: 2, padding: 1}}>
          <NavLink to="/dashboard/request-approval/vl" style={navLinkStyle}>
            <Badge badgeContent={VLList?.length} color="warning">
              Paid Leave
            </Badge>
          </NavLink>
          <NavLink to="/dashboard/request-approval/absent" style={navLinkStyle}>
            <Badge badgeContent={AbsentList?.length} color="warning">
              Unpaid Leave
            </Badge>
          </NavLink>
          <NavLink to="/dashboard/request-approval/ot-off" style={navLinkStyle}>
            <Badge badgeContent={OTOffList?.length} color="warning">
              OT Off Set
            </Badge>
          </NavLink>
          
        </Box>
      </Paper>
      <Paper sx={{ marginTop: 2 }}>
        <Outlet />
      </Paper>
    </Box>
  );
}
