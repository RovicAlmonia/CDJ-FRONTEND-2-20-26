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
  OPEN_TEST,
} from "../../../../../store/actions";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useNavigate } from "react-router-dom";
import RedeemIcon from "@mui/icons-material/Redeem";

export default function Test() {
  const theme = useTheme();
  const sideActiveColor = SvgIconColors(theme.palette.appSettings);

  const open = useSelector(
    (state) => state.customization.openManagementTest
  );

  const activateColor = useSelector(
    (state) => state.customization.colorCashierPortal
  );
  const dispatch = useDispatch();
  const [anchorHere, setAnchorHere] = useState(null);
  const popoverRef = useRef(null);
  const openBool = Boolean(anchorHere);
  const navigate = useNavigate();
  const id = "mouse-over-popover";

  const navigateMassEditEmployeeSalary = () => {
    navigate("/dashboard/edit-employee-salary");
  };
  const navigateSalaryGrade = () => {
    navigate("/dashboard/salary-grade");
  };
  const navigateReqApp = () => {
    navigate("/dashboard/request-approval");
  };

  const navigatetTest= () => {
    navigate("/dashboard/test");
  };


  const openCollapseBtn = () => {
    dispatch({
      type: OPEN_TEST,
      openManagementTest: !open,
    });
  };

  const colorCollapseBtn = () => {
    dispatch({ type: COLOR_DAR_OPTIONS, colorBatchingDar: true });
  };

  useEffect(() => {
    if (
      location.pathname === "/dashboard/edit-employee-salary"
      // || location.pathname ===
    ) {
      dispatch({ type: COLOR_DAR_OPTIONS, colorBatchingDar: true });
    } else {
      dispatch({ type: COLOR_DAR_OPTIONS, colorBatchingDar: false });
    }
  }, [dispatch]);

  const handleOpenCollapse = (event) => {
    setAnchorHere(event.currentTarget);
  };

  const HandlecloseCollapse = () => {
    if (
      popoverRef.current &&
      popoverRef.current.contains(event.relatedTarget)
    ) {
      return;
    }
    setAnchorHere(null);
  };

  const blackFunc = () => {};
  return (
    <>
      <StyledCollapsedButton
        id={id}
        onClick={openCollapseBtn}
        IconChildren={<RedeemIcon fontSize="small" />}
        CollpaseBtnLabels="Test"
        handlePopoverOpen={
          theme.palette.appSettings.layout === "vertical"
            ? blackFunc
            : handleOpenCollapse
        }
        handlePopoverClose={HandlecloseCollapse}
        bgcolor={activateColor ? `${sideActiveColor.svgcolor[600]}` : "none"}
        iconcolor={
          activateColor ? `${sideActiveColor.svgcolor[100]}` : "#637381"
        }
      >
        {open ? (
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
        open={openBool}
        anchorEl={anchorHere}
        onMouseLeave={HandlecloseCollapse}
        onMouseEnter={openCollapseBtn}
        popoverRef={popoverRef}
        menuButton={
          <>
            <CustomMenuButton
              label="test List"
              activePath="/dashboard/test"
              onClick={navigatetTest}
            />
          </>
        }
      />
      <Collapsebtn stateOpen={open}>
        <ListBtn
          label="test List"
          activePath="/dashboard/test"
          onClick={navigatetTest}
        />
        
        
      </Collapsebtn>
    </>
  );
}
