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
import LayersIcon from "@mui/icons-material/Layers";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

export default function Administrative() {
  const theme = useTheme();
  const sideActiveColor = SvgIconColors(theme.palette.appSettings);
  const isCollapsed = theme.palette.appSettings.layout === "collapsed";
  const isHorizontal = theme.palette.appSettings.layout === "horizontal";
  const isVertical = theme.palette.appSettings.layout === "vertical";

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

  // ── Navigation ──────────────────────────────────────────────────────────────
  const navigateServicesList    = () => navigate("/dashboard/services-list");
  const navigateServicesAvailed = () => navigate("/dashboard/services-availed");
  const navigateClients         = () => navigate("/dashboard/clients");
  const navigateTransactions    = () => navigate("/dashboard/transactions");
  const navigateBilling         = () => navigate("/dashboard/billing");
  const navigatePaymentLedger   = () => navigate("/dashboard/payment-ledger");

  // ── Collapse toggles ────────────────────────────────────────────────────────
  const toggleMasterfile = () => setOpenMasterfile((prev) => !prev);
  const toggleClient     = () => setOpenClient((prev) => !prev);
  const blackFunc        = () => {};

  // ── Popover handlers ────────────────────────────────────────────────────────
  const handleOpenMasterfileCollapse  = (e) => setAnchorMasterfile(e.currentTarget);
  const handleCloseMasterfileCollapse = () => {
    if (popoverMasterfileRef.current?.contains(event.relatedTarget)) return;
    setAnchorMasterfile(null);
  };

  const handleOpenClientCollapse  = (e) => setAnchorClient(e.currentTarget);
  const handleCloseClientCollapse = () => {
    if (popoverClientRef.current?.contains(event.relatedTarget)) return;
    setAnchorClient(null);
  };

  // ── Arrow icon helper ───────────────────────────────────────────────────────
  const CollapseArrow = ({ isOpen }) => (
    <>
      {/* vertical layout */}
      {isOpen
        ? <ArrowDropDownTwoToneIcon sx={{ display: isCollapsed || isHorizontal ? "none" : "flex" }} />
        : <ArrowRightIcon           sx={{ display: isCollapsed || isHorizontal ? "none" : "flex" }} />
      }
      {/* horizontal layout */}
      <ArrowDropDownTwoToneIcon sx={{ display: isHorizontal ? "flex" : "none" }} />
    </>
  );

  useEffect(() => {
    dispatch({
      type: COLOR_DAR_OPTIONS,
      colorBatchingDar: location.pathname === "/dashboard/edit-employee-salary",
    });
  }, [dispatch]);

  const btnColors = {
    bgcolor:    activateColor ? `${sideActiveColor.svgcolor[600]}` : "none",
    iconcolor:  activateColor ? `${sideActiveColor.svgcolor[100]}` : "#637381",
  };

  return (
    <>
      {/* ══════════════════════ MASTERFILE ══════════════════════ */}
      <StyledCollapsedButton
        id={id}
        onClick={toggleMasterfile}
        IconChildren={<LayersIcon fontSize="small" />}
        CollpaseBtnLabels="Masterfile"
        handlePopoverOpen={isVertical ? blackFunc : handleOpenMasterfileCollapse}
        handlePopoverClose={handleCloseMasterfileCollapse}
        {...btnColors}
      >
        <CollapseArrow isOpen={openMasterfile} />
      </StyledCollapsedButton>

      {/* Collapsed / horizontal popover */}
      <StyledPopover
        id={id}
        open={openMasterfileBool}
        anchorEl={anchorMasterfile}
        onMouseLeave={handleCloseMasterfileCollapse}
        onMouseEnter={toggleMasterfile}
        popoverRef={popoverMasterfileRef}
        menuButton={
          <>
            <CustomMenuButton
              label="Services List"
              activePath="/dashboard/services-list"
              onClick={navigateServicesList}
            />
            <CustomMenuButton
              label="Payment Ledger"
              activePath="/dashboard/payment-ledger"
              onClick={navigatePaymentLedger}
            />
          </>
        }
      />

      {/* Vertical expanded collapse */}
      <Collapsebtn stateOpen={openMasterfile}>
        <ListBtn
          label="Services List"
          activePath="/dashboard/services-list"
          onClick={navigateServicesList}
        />
        <ListBtn
          label="Payment Ledger"
          activePath="/dashboard/payment-ledger"
          onClick={navigatePaymentLedger}
        />
      </Collapsebtn>

      {/* ══════════════════════ CLIENT ══════════════════════════ */}
      <StyledCollapsedButton
        id={id}
        onClick={toggleClient}
        IconChildren={<PeopleAltIcon fontSize="small" />}
        CollpaseBtnLabels={
          <span
            onClick={(e) => { e.stopPropagation(); navigateClients(); }}
            style={{ cursor: "pointer" }}
          >
            Client
          </span>
        }
        handlePopoverOpen={isVertical ? blackFunc : handleOpenClientCollapse}
        handlePopoverClose={handleCloseClientCollapse}
        {...btnColors}
      >
        <CollapseArrow isOpen={openClient} />
      </StyledCollapsedButton>

      {/* Collapsed / horizontal popover */}
      <StyledPopover
        id={id}
        open={openClientBool}
        anchorEl={anchorClient}
        onMouseLeave={handleCloseClientCollapse}
        onMouseEnter={toggleClient}
        popoverRef={popoverClientRef}
        menuButton={
          <>
            <CustomMenuButton
              label="Services Availed"
              activePath="/dashboard/services-availed"
              onClick={navigateServicesAvailed}
            />
            <CustomMenuButton
              label="Create Transaction & Logs"
              activePath="/dashboard/transactions"
              onClick={navigateTransactions}
            />
          </>
        }
      />

      {/* Vertical expanded collapse */}
      <Collapsebtn stateOpen={openClient}>
        <ListBtn
          label="Services Availed"
          activePath="/dashboard/services-availed"
          onClick={navigateServicesAvailed}
        />
        <ListBtn
          label="Create Transaction & Logs"
          activePath="/dashboard/transactions"
          onClick={navigateTransactions}
        />
      </Collapsebtn>
    </>
  );
}