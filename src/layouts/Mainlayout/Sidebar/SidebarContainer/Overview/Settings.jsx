import React from "react";
import { useTheme } from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownTwoToneIcon from "@mui/icons-material/ArrowDropDownTwoTone";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SvgIconColors } from "../../../../../themes/palette";
import StyledCollapsedButton from "../../../../../components/StyledListItemButton/StyledCollpasedButton/StyledCollpasedButton";
import Collapsebtn from "../../../../../components/StyledListItemButton/CustomCollapseListButton/Collapsebtn";
import StyledPopover from "../../../../../components/StyledPopover";
import ListBtn from "../../../../../components/StyledListItemButton/CustomCollapseListButton/ListBtn";
import CustomMenuButton from "../../../../../components/CustomMenuButton";
import {
  OPEN_MANAGEMENT_OPTIONS,
  COLOR_DAR_OPTIONS,
  OPEN_13PAY_OPTIONS,
  OPEN_ADMINISTRATIVE,
} from "../../../../../store/actions";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useNavigate } from "react-router-dom";
import RedeemIcon from "@mui/icons-material/Redeem";

export default function Administrative() {
  const theme = useTheme();
  const sideActiveColor = SvgIconColors(theme.palette.appSettings);

  const open = useSelector(
    (state) => state.customization.openManagementAdministrative
  );

  const activateColor = useSelector(
    (state) => state.customization.colorCashierPortal
  );
  const dispatch = useDispatch();

  const [openMasterfile, setOpenMasterfile] = useState(false);
  const [openClient, setOpenClient] = useState(false);

  const [anchorMasterfile, setAnchorMasterfile] = useState(null);
  const [anchorClient, setAnchorClient] = useState(null);

  const popoverMasterfileRef = useRef(null);
  const popoverClientRef = useRef(null);

  const openMasterfileBool = Boolean(anchorMasterfile);
  const openClientBool = Boolean(anchorClient);

  const navigate = useNavigate();
  const id = "mouse-over-popover";

  const navigateMassEditEmployeeSalary = () => {
    navigate("/dashboard/edit-employee-salary");
  };
  const navigateSalaryGrade = () => {
    navigate("/dashboard/services-list");
  };
  const navigateReqApp = () => {
    navigate("/dashboard/request-approval");
  };
  const navigatetDTRApproval = () => {
    navigate("/dashboard/dtr-approval");
  };
  const navigateManagementUser = () => {
    navigate("/dashboard/management-user");
  };
  const navigateAuditLog = () => {
    navigate("/dashboard/audit-log");
  };
  const navigateClients = () => {
    navigate("/dashboard/clients");
  };

  const openMasterfileCollapseBtn = () => {
    setOpenMasterfile((prev) => !prev);
  };

  const openClientCollapseBtn = () => {
    setOpenClient((prev) => !prev);
  };

  const colorCollapseBtn = () => {
    dispatch({ type: COLOR_DAR_OPTIONS, colorBatchingDar: true });
  };

  useEffect(() => {
    if (location.pathname === "/dashboard/edit-employee-salary") {
      dispatch({ type: COLOR_DAR_OPTIONS, colorBatchingDar: true });
    } else {
      dispatch({ type: COLOR_DAR_OPTIONS, colorBatchingDar: false });
    }
  }, [dispatch]);

  const handleOpenMasterfileCollapse = (event) => {
    setAnchorMasterfile(event.currentTarget);
  };
  const handleCloseMasterfileCollapse = () => {
    if (
      popoverMasterfileRef.current &&
      popoverMasterfileRef.current.contains(event.relatedTarget)
    ) {
      return;
    }
    setAnchorMasterfile(null);
  };

  const handleOpenClientCollapse = (event) => {
    setAnchorClient(event.currentTarget);
  };
  const handleCloseClientCollapse = () => {
    if (
      popoverClientRef.current &&
      popoverClientRef.current.contains(event.relatedTarget)
    ) {
      return;
    }
    setAnchorClient(null);
  };

  const blackFunc = () => {};

  return (
    <>
      {/* ===================== MASTERFILE ===================== */}
      <StyledCollapsedButton
        id={id}
        onClick={openMasterfileCollapseBtn}
        IconChildren={<RedeemIcon fontSize="small" />}
        CollpaseBtnLabels="Masterfile"
        handlePopoverOpen={
          theme.palette.appSettings.layout === "vertical"
            ? blackFunc
            : handleOpenMasterfileCollapse
        }
        handlePopoverClose={handleCloseMasterfileCollapse}
        bgcolor={activateColor ? `${sideActiveColor.svgcolor[600]}` : "none"}
        iconcolor={
          activateColor ? `${sideActiveColor.svgcolor[100]}` : "#637381"
        }
      >
        {openMasterfile ? (
          <ArrowDropDownTwoToneIcon
            sx={{
              display:
                theme.palette.appSettings.layout === "collapsed"
                  ? "none"
                  : theme.palette.appSettings.layout === "horizontal"
                  ? "none"
                  : "flex",
            }}
          />
        ) : (
          <ArrowRightIcon
            sx={{
              display:
                theme.palette.appSettings.layout === "collapsed"
                  ? "none"
                  : theme.palette.appSettings.layout === "horizontal"
                  ? "none"
                  : "flex",
            }}
          />
        )}
        <ArrowDropDownTwoToneIcon
          sx={{
            display:
              theme.palette.appSettings.layout === "collapsed"
                ? "none"
                : theme.palette.appSettings.layout === "horizontal"
                ? "flex"
                : "none",
          }}
        />
      </StyledCollapsedButton>

      <StyledPopover
        id={id}
        open={openMasterfileBool}
        anchorEl={anchorMasterfile}
        onMouseLeave={handleCloseMasterfileCollapse}
        onMouseEnter={openMasterfileCollapseBtn}
        popoverRef={popoverMasterfileRef}
        menuButton={
          <>
            <CustomMenuButton
              label="Services Lists"
              activePath="/dashboard/services-list"
              onClick={navigateSalaryGrade}
            />
            <CustomMenuButton
              label="Payment Ledger"
              activePath="/dashboard/device-list"
              onClick={navigateMassEditEmployeeSalary}
            />
          </>
        }
      />

      <Collapsebtn stateOpen={openMasterfile}>
        <ListBtn
          label="Services Lists"
          activePath="/dashboard/services-list"
          onClick={navigateSalaryGrade}
        />
        <ListBtn
          label="Payment Ledger"
          activePath="/dashboard/device-list"
          onClick={navigateMassEditEmployeeSalary}
        />
      </Collapsebtn>

      {/* ===================== CLIENT ===================== */}
      <StyledCollapsedButton
        id={id}
        // Clicking the whole bar toggles the dropdown
        onClick={openClientCollapseBtn}
        IconChildren={<RedeemIcon fontSize="small" />}
        // Clicking the label text navigates to /clients
        CollpaseBtnLabels={
          <span
            onClick={(e) => {
              e.stopPropagation(); // prevents the bar onClick from also firing
              navigateClients();
            }}
            style={{ cursor: "pointer" }}
          >
            Client
          </span>
        }
        handlePopoverOpen={
          theme.palette.appSettings.layout === "vertical"
            ? blackFunc
            : handleOpenClientCollapse
        }
        handlePopoverClose={handleCloseClientCollapse}
        bgcolor={activateColor ? `${sideActiveColor.svgcolor[600]}` : "none"}
        iconcolor={
          activateColor ? `${sideActiveColor.svgcolor[100]}` : "#637381"
        }
      >
        {openClient ? (
          <ArrowDropDownTwoToneIcon
            sx={{
              display:
                theme.palette.appSettings.layout === "collapsed"
                  ? "none"
                  : theme.palette.appSettings.layout === "horizontal"
                  ? "none"
                  : "flex",
            }}
          />
        ) : (
          <ArrowRightIcon
            sx={{
              display:
                theme.palette.appSettings.layout === "collapsed"
                  ? "none"
                  : theme.palette.appSettings.layout === "horizontal"
                  ? "none"
                  : "flex",
            }}
          />
        )}
        <ArrowDropDownTwoToneIcon
          sx={{
            display:
              theme.palette.appSettings.layout === "collapsed"
                ? "none"
                : theme.palette.appSettings.layout === "horizontal"
                ? "flex"
                : "none",
          }}
        />
      </StyledCollapsedButton>

      <StyledPopover
        id={id}
        open={openClientBool}
        anchorEl={anchorClient}
        onMouseLeave={handleCloseClientCollapse}
        onMouseEnter={openClientCollapseBtn}
        popoverRef={popoverClientRef}
        menuButton={
          <>
            <CustomMenuButton
              label="Services Avail"
              activePath="/dashboard/services-list"
              onClick={navigateSalaryGrade}
            />
            <CustomMenuButton
              label="History/Logs"
              activePath="/dashboard/services-list"
              onClick={navigateMassEditEmployeeSalary}
            />
          </>
        }
      />

      <Collapsebtn stateOpen={openClient}>
        <ListBtn
          label="Services Avail"
          activePath="/dashboard/"
          onClick={navigateSalaryGrade}
        />
        <ListBtn
          label="History/Logs"
          activePath="/dashboard/"
          onClick={navigateMassEditEmployeeSalary}
        />
      </Collapsebtn>
    </>
  );
}