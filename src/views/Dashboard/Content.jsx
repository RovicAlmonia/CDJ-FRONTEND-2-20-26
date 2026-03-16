import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
  alpha,
  Divider,
  Badge,
  Collapse,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../modules/context/AuthContext";
import { hookContainer } from "../../hooks/globalQuery";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { BarChart, PieChart } from "@mui/x-charts";
import { useQueryClient } from "@tanstack/react-query";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";

// ── Helper: convert total months to friendly label ────────────
const monthsToLabel = (totalMonths) => {
  const m = parseInt(totalMonths);
  if (!m) return "—";
  if (m < 12) return `${m} month${m !== 1 ? "s" : ""}`;
  const years = Math.floor(m / 12);
  const months = m % 12;
  if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years} yr${years !== 1 ? "s" : ""} ${months} mo${months !== 1 ? "s" : ""}`;
};

// ── Notification Category Config ────────────────────────────────
const NOTIFICATION_CATEGORIES = {
  SERVICE_EXPIRY: {
    key: "service_expiry",
    label: "Service Expirations",
    icon: <WarningAmberIcon fontSize="small" />,
    color: "#f59e0b",
    bgLight: "#fffbeb",
    bgDark: "rgba(245,158,11,0.1)",
    borderColor: "#fcd34d",
  },
  BILLING: {
    key: "billing",
    label: "Billing Due",
    icon: <ReceiptLongIcon fontSize="small" />,
    color: "#3b82f6",
    bgLight: "#eff6ff",
    bgDark: "rgba(59,130,246,0.1)",
    borderColor: "#93c5fd",
  },
  HR_APPROVALS: {
    key: "hr_approvals",
    label: "HR Approvals",
    icon: <AssignmentTurnedInIcon fontSize="small" />,
    color: "#8b5cf6",
    bgLight: "#f5f3ff",
    bgDark: "rgba(139,92,246,0.1)",
    borderColor: "#c4b5fd",
  },
};

// ── Single Notification Item ────────────────────────────────────
function NotificationItem({ notification, darkMode, isLast }) {
  const urgencyColor =
    notification.urgency === "critical"
      ? "#ef4444"
      : notification.urgency === "high"
      ? "#f59e0b"
      : notification.urgency === "medium"
      ? "#3b82f6"
      : "#6b7280";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        py: 1.25,
        px: 1.5,
        borderRadius: 1,
        mb: isLast ? 0 : 0.5,
        backgroundColor: darkMode
          ? "rgba(255,255,255,0.03)"
          : "rgba(0,0,0,0.015)",
        border: `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
        transition: "background-color 0.15s",
        "&:hover": {
          backgroundColor: darkMode
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.035)",
        },
      }}
    >
      {/* Urgency dot */}
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: urgencyColor,
          mt: 0.7,
          flexShrink: 0,
          boxShadow: `0 0 6px ${urgencyColor}88`,
        }}
      />
      <Typography
        variant="body2"
        sx={{
          color: darkMode ? "#e5e7eb" : "#374151",
          lineHeight: 1.5,
          flex: 1,
          fontSize: "0.8125rem",
        }}
      >
        {notification.text}
      </Typography>
      {notification.badge && (
        <Chip
          label={notification.badge}
          size="small"
          sx={{
            height: 18,
            fontSize: "0.65rem",
            fontWeight: 700,
            backgroundColor: urgencyColor,
            color: "#fff",
            flexShrink: 0,
          }}
        />
      )}
    </Box>
  );
}

// ── Notification Category Panel ─────────────────────────────────
function NotificationCategoryPanel({ category, items, darkMode }) {
  const [expanded, setExpanded] = useState(true);
  const cfg = NOTIFICATION_CATEGORIES[category];
  const bgColor = darkMode ? cfg.bgDark : cfg.bgLight;
  const borderColor = darkMode
    ? cfg.color + "44"
    : cfg.borderColor;

  if (items.length === 0) return null;

  return (
    <Box
      sx={{
        border: `1px solid ${borderColor}`,
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: bgColor,
      }}
    >
      {/* Category Header */}
      <Box
        onClick={() => setExpanded((p) => !p)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.25,
          cursor: "pointer",
          borderBottom: expanded
            ? `1px solid ${borderColor}`
            : "none",
          backgroundColor: darkMode
            ? cfg.color + "22"
            : cfg.color + "18",
          userSelect: "none",
          "&:hover": {
            backgroundColor: darkMode
              ? cfg.color + "33"
              : cfg.color + "25",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ color: cfg.color, display: "flex", alignItems: "center" }}>
            {cfg.icon}
          </Box>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{ color: cfg.color, fontSize: "0.8125rem", letterSpacing: 0.3 }}
          >
            {cfg.label.toUpperCase()}
          </Typography>
          <Chip
            label={items.length}
            size="small"
            sx={{
              height: 18,
              fontSize: "0.65rem",
              fontWeight: 700,
              backgroundColor: cfg.color,
              color: "#fff",
              minWidth: 22,
            }}
          />
        </Box>
        <Box sx={{ color: cfg.color, display: "flex", alignItems: "center" }}>
          {expanded ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </Box>
      </Box>

      {/* Items */}
      <Collapse in={expanded}>
        <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0 }}>
          {items.map((item, idx) => (
            <NotificationItem
              key={idx}
              notification={item}
              darkMode={darkMode}
              isLast={idx === items.length - 1}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

export default function Content() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { accessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const darkMode = theme.palette.mode === "dark";

  // Data Hooks
  const { data: PayrollPeriod } = hookContainer("/get-payroll-active?Type=Q");
  const { data: OTOff } = hookContainer("/get-approval-otoff");
  const { data: payrollPeriod } = hookContainer("/get-payperiod");
  const { data: VL } = hookContainer("/get-approval-vl");
  const { data: AbsentData } = hookContainer("/get-approval-absent");
  const { data: backpay } = hookContainer("/get-approval-BackPay");
  const { data: OT } = hookContainer("/get-approval-ot");
  const { data: otherDeductions } = hookContainer("/get-approval-otherDeductions");
  const { data: loans } = hookContainer("/get-approval-loans");

  const { data: servicesAvailedRaw } = hookContainer("/selectservicesavailed");
  const { data: allClientsRaw } = hookContainer("/selectclientss");

  console.log("accessToken:", accessToken);

  // Process data into lists
  const OTOffList = Array.isArray(OTOff)
    ? OTOff?.map((row) => ({ ...row, id: row.id, ottime: `${row.otTimeFrom} - ${row.otTimeTo}` }))
    : [];

  const VLList = Array.isArray(VL)
    ? VL?.map((row) => ({ ...row, id: row.id }))
    : [];

  const AbsentList = Array.isArray(AbsentData)
    ? AbsentData?.map((row) => ({ ...row, id: row.id }))
    : [];

  const BackPayList = Array.isArray(backpay)
    ? backpay?.map((row) => ({ ...row, id: row.did }))
    : [];

  const OTList = Array.isArray(OT)
    ? OT?.map((row) => ({ ...row, id: row.OTid, time: `${row.OTTimeFrom} - ${row.OTTimeTo}` }))
    : [];

  const otherDeductionList = Array.isArray(otherDeductions)
    ? otherDeductions?.map((row) => ({ ...row, id: row.did }))
    : [];

  const loanList = Array.isArray(loans)
    ? loans?.map((row) => ({
        ...row,
        id: row.CAID,
        FullName: `${row.CAEmployeeLName}, ${row.CAEmployeeName}`,
      }))
    : [];

  // State
  const [year, setYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [chartType, setChartType] = useState("pie");

  const { data: empHire } = hookContainer(`/get-empHire?Year=${year}`);
  const empHireList = Array.isArray(empHire?.data)
    ? empHire?.data?.map((row) => ({ ...row }))
    : [];

  const { data: WorkForceSummary } = hookContainer("/get-empCategory");
  const workforceList = Array.isArray(WorkForceSummary?.data)
    ? WorkForceSummary?.data?.map((row) => ({ ...row }))
    : [];

  const { data: clientData } = hookContainer("/get-clients-summary");

  const [payPeriod, setPayPeriod] = useState({
    PPID: "",
    PFrom: "",
    PTo: "",
    Type: "",
    Terms: "",
    Status: "",
  });

  const { data: branchBasicSummary } = hookContainer(
    `/get-SalaryBasicBranchTotal?PFrom=${payPeriod?.PFrom}&PTo=${payPeriod?.PTo}`
  );
  const branchBasicList = Array.isArray(branchBasicSummary?.data)
    ? branchBasicSummary?.data?.map((row) => ({ ...row }))
    : [];

  useEffect(() => {
    queryClient.invalidateQueries(`/get-empHire?Year=${year}`);
  }, [year]);

  useEffect(() => {
    queryClient.invalidateQueries(
      `/get-SalaryBasicBranchTotal?PFrom=${payPeriod?.PFrom}&PTo=${payPeriod?.PTo}`
    );
  }, [payPeriod]);

  // Totals
  const totalPendingApprovals =
    OTOffList.length +
    VLList.length +
    AbsentList.length +
    BackPayList.length +
    OTList.length +
    otherDeductionList.length +
    loanList.length;

  const totalEmployees = workforceList.reduce(
    (sum, item) => sum + (item.count || 0),
    0
  );

  const clientStats = {
    total: clientData?.data?.total || 0,
    active: clientData?.data?.active || 0,
    inactive: clientData?.data?.inactive || 0,
    soleProprietor: clientData?.data?.soleProprietor || 0,
    corporation: clientData?.data?.corporation || 0,
    coop: clientData?.data?.coop || 0,
  };

  const activePercentage =
    clientStats.total > 0
      ? ((clientStats.active / clientStats.total) * 100).toFixed(1)
      : "0.0";
  const inactivePercentage =
    clientStats.total > 0
      ? ((clientStats.inactive / clientStats.total) * 100).toFixed(1)
      : "0.0";

  // Dark mode color palette
  const colors = {
    cardBg: darkMode ? "#1e1e1e" : "#ffffff",
    cardBorder: darkMode ? "#333333" : "#ddd",
    text: darkMode ? "#ffffff" : "#000000",
    textSecondary: darkMode ? "#b0b0b0" : "#666666",
    headerBg: darkMode ? "#252525" : "#ffffff",
    headerBorder: darkMode ? "#333333" : "#000",
    sectionBg: darkMode ? "#2a2a2a" : "#f5f5f5",
    sectionBorder: darkMode ? "#404040" : "#ddd",
    inputBg: darkMode ? "#1a1a1a" : "#e81e1e",
    notificationBorder: darkMode ? "#404040" : "#e0e0e0",
  };

  const chartColors = {
    active: darkMode ? "#66bb6a" : "#4caf50",
    inactive: darkMode ? "#ef5350" : "#f44336",
    primary: darkMode ? "#42a5f5" : "#1976d2",
    purple: darkMode ? "#ab47bc" : "#9c27b0",
    orange: darkMode ? "#ffa726" : "#ff9800",
    gray: darkMode ? "#78909c" : "#607d8b",
  };

  const clientStatusData = [
    { id: 0, value: clientStats.active, label: "Active Clients", color: chartColors.active },
    { id: 1, value: clientStats.inactive, label: "Inactive Clients", color: chartColors.inactive },
  ];

  const clientTypeData = [
    { id: 0, value: clientStats.soleProprietor, label: "Sole Proprietor", color: chartColors.primary },
    { id: 1, value: clientStats.corporation, label: "Corporation", color: chartColors.purple },
    { id: 2, value: clientStats.coop, label: "COOP", color: chartColors.orange },
  ];

  const handleRefreshData = () => {
    queryClient.invalidateQueries("/get-clients-summary");
    queryClient.invalidateQueries(`/get-empHire?Year=${year}`);
    queryClient.invalidateQueries("/get-empCategory");
    console.log("Data refreshed");
  };

  const handleExportData = () => {
    const exportData = {
      date: dayjs().format("YYYY-MM-DD"),
      clientStats,
      categorizedNotifications,
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dashboard-export-${dayjs().format("YYYY-MM-DD")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleChartType = () => {
    setChartType((prev) => (prev === "pie" ? "bar" : "pie"));
  };

  // ── Build Notifications (Categorized) ───────────────────────────

  const today = dayjs();

  // 1. Service Expiration Notifications (within 7 days)
  const servicesAvailedList = Array.isArray(servicesAvailedRaw?.data)
    ? servicesAvailedRaw.data
    : Array.isArray(servicesAvailedRaw)
    ? servicesAvailedRaw
    : [];

  const latestPerClientService = {};
  servicesAvailedList.forEach((row) => {
    if (!row.TransactionDate || !row.ServiceRenewalMonths) return;
    const key = `${row.ClientID}__${row.ServiceName}`;
    const existing = latestPerClientService[key];
    if (
      !existing ||
      dayjs(row.TransactionDate).isAfter(dayjs(existing.TransactionDate))
    ) {
      latestPerClientService[key] = row;
    }
  });

  const serviceExpiryNotifications = Object.values(latestPerClientService)
    .map((row) => {
      const expirationDate = dayjs(row.TransactionDate).add(
        parseInt(row.ServiceRenewalMonths),
        "month"
      );
      const daysUntil = expirationDate.diff(today, "day");
      return { ...row, expirationDate, daysUntil };
    })
    .filter(({ daysUntil }) => daysUntil >= 0 && daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .map(({ ClientName, ServiceName, ServiceRenewalMonths, expirationDate, daysUntil }) => {
      const label =
        daysUntil === 0
          ? "TODAY"
          : `in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`;
      return {
        text: `"${ServiceName}" for ${ClientName} — ${monthsToLabel(ServiceRenewalMonths)} renewal expires ${expirationDate.format("MMM D, YYYY")}`,
        badge: daysUntil === 0 ? "TODAY" : `${daysUntil}d`,
        urgency: daysUntil === 0 ? "critical" : daysUntil <= 3 ? "high" : "medium",
      };
    });

  // 2. Billing Notifications
  const allClientsList = Array.isArray(allClientsRaw?.data)
    ? allClientsRaw.data
    : Array.isArray(allClientsRaw)
    ? allClientsRaw
    : [];

  const currentMonth = today.month();
  const isQuarterEndMonth = [2, 5, 8, 11].includes(currentMonth);
  const isSemiAnnualEndMonth = [5, 11].includes(currentMonth);

  const billingNotifications = allClientsList
    .filter((client) => {
      if (client.Status !== "Active") return false;
      const rt = client.RetentionType;
      if (rt === "Monthly") return true;
      if (rt === "Quarterly" && isQuarterEndMonth) return true;
      if (rt === "Semi Annual" && isSemiAnnualEndMonth) return true;
      return false;
    })
    .map((client) => {
      const cycleLabel =
        client.RetentionType === "Monthly"
          ? "Monthly"
          : client.RetentionType === "Quarterly"
          ? "Quarterly"
          : "Semi-Annual";
      return {
        text: `${client.TradeName || client.LNF} — ${cycleLabel} billing due end of ${today.format("MMMM YYYY")}`,
        badge: cycleLabel,
        urgency: "medium",
      };
    });

  // 3. HR Approval Notifications
  const hrApprovalNotifications = [
    ...(VLList.length > 0
      ? [{
          text: `${VLList.length} Vacation Leave request${VLList.length !== 1 ? "s" : ""} pending approval`,
          badge: `${VLList.length}`,
          urgency: "high",
        }]
      : []),
    ...(OTList.length > 0
      ? [{
          text: `${OTList.length} Overtime request${OTList.length !== 1 ? "s" : ""} pending approval`,
          badge: `${OTList.length}`,
          urgency: "medium",
        }]
      : []),
    ...(loanList.length > 0
      ? [{
          text: `${loanList.length} Loan application${loanList.length !== 1 ? "s" : ""} pending approval`,
          badge: `${loanList.length}`,
          urgency: "medium",
        }]
      : []),
    ...(AbsentList.length > 0
      ? [{
          text: `${AbsentList.length} Absence report${AbsentList.length !== 1 ? "s" : ""} pending approval`,
          badge: `${AbsentList.length}`,
          urgency: "medium",
        }]
      : []),
    ...(OTOffList.length > 0
      ? [{
          text: `${OTOffList.length} OT-Off request${OTOffList.length !== 1 ? "s" : ""} pending approval`,
          badge: `${OTOffList.length}`,
          urgency: "low",
        }]
      : []),
    ...(BackPayList.length > 0
      ? [{
          text: `${BackPayList.length} Back Pay request${BackPayList.length !== 1 ? "s" : ""} pending approval`,
          badge: `${BackPayList.length}`,
          urgency: "low",
        }]
      : []),
    ...(otherDeductionList.length > 0
      ? [{
          text: `${otherDeductionList.length} Other Deduction request${otherDeductionList.length !== 1 ? "s" : ""} pending approval`,
          badge: `${otherDeductionList.length}`,
          urgency: "low",
        }]
      : []),
  ];

  // Categorized Map
  const categorizedNotifications = {
    SERVICE_EXPIRY: serviceExpiryNotifications,
    BILLING: billingNotifications,
    HR_APPROVALS: hrApprovalNotifications,
  };

  const totalNotifications =
    serviceExpiryNotifications.length +
    billingNotifications.length +
    hrApprovalNotifications.length;

  const criticalCount = [
    ...serviceExpiryNotifications,
    ...hrApprovalNotifications,
  ].filter((n) => n.urgency === "critical").length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Dashboard Title with Actions */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: colors.headerBg,
          border: `2px solid ${colors.headerBorder}`,
          borderRadius: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: 1, color: colors.text }}>
          WELCOME TO CDJ ACCOUNTING SERVICES DASHBOARD
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefreshData} sx={{ color: colors.text }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Data">
            <IconButton onClick={handleExportData} sx={{ color: colors.text }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Month/Year Selector */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: colors.sectionBg,
          border: `1px solid ${colors.sectionBorder}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: colors.text }}>
          SELECT MONTH / YEAR
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={["year", "month"]}
            value={selectedMonth}
            onChange={(newValue) => setSelectedMonth(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                InputProps: { endAdornment: <CalendarMonthIcon /> },
                sx: {
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: colors.inputBg,
                    color: darkMode ? "#ffffff" : "#000000",
                  },
                },
              },
            }}
            format="MMMM YYYY"
          />
        </LocalizationProvider>
      </Paper>

      {/* Client Statistics Grid */}
      <Grid container spacing={2}>
        {/* No. of Clients Card */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: `2px solid ${colors.cardBorder}`,
              borderRadius: 2,
              backgroundColor: colors.cardBg,
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
              }}
            >
              <PeopleIcon sx={{ fontSize: 48, color: chartColors.primary, mb: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: colors.text }}>
                No. of Clients
              </Typography>
              <Typography
                variant="h1"
                fontWeight="bold"
                sx={{ color: colors.text, fontSize: "4rem" }}
              >
                {clientStats.total}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, mt: 1, mb: 2 }}>
                as of {dayjs().format("MMMM D, YYYY")}
              </Typography>

              <Box sx={{ width: "100%", mt: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpIcon sx={{ color: chartColors.active, fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: colors.text }}>Active</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: colors.text }}>
                    {clientStats.active} ({activePercentage}%)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingDownIcon sx={{ color: chartColors.inactive, fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: colors.text }}>Inactive</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: colors.text }}>
                    {clientStats.inactive} ({inactivePercentage}%)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Client Status Distribution */}
        <Grid item xs={12} md={8}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: `2px solid ${colors.cardBorder}`,
              borderRadius: 2,
              backgroundColor: colors.cardBg,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
                  Client Status Distribution
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={`${activePercentage}% Active`}
                    color="success"
                    size="small"
                  />
                  <Chip
                    icon={<TrendingDownIcon />}
                    label={`${inactivePercentage}% Inactive`}
                    color="error"
                    size="small"
                  />
                  <Tooltip title={`Toggle to ${chartType === "pie" ? "Bar" : "Pie"} Chart`}>
                    <IconButton size="small" onClick={handleToggleChartType}>
                      <VisibilityIcon sx={{ color: colors.text }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 300,
                }}
              >
                {chartType === "pie" ? (
                  <PieChart
                    series={[
                      {
                        data: clientStatusData,
                        highlightScope: { faded: "global", highlighted: "item" },
                        faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
                        arcLabel: (item) => `${item.value}`,
                        arcLabelMinAngle: 35,
                      },
                    ]}
                    height={300}
                    colors={[chartColors.active, chartColors.inactive]}
                    slotProps={{
                      legend: {
                        direction: "row",
                        position: { vertical: "bottom", horizontal: "middle" },
                        padding: 0,
                        labelStyle: { fill: colors.text },
                      },
                    }}
                    sx={{
                      "& .MuiChartsLegend-series text": { fill: `${colors.text} !important` },
                      "& .MuiChartsAxis-tickLabel": { fill: colors.text },
                      "& .MuiChartsAxis-label": { fill: colors.text },
                    }}
                  />
                ) : (
                  <BarChart
                    dataset={clientStatusData}
                    xAxis={[{
                      scaleType: "band",
                      dataKey: "label",
                      tickLabelStyle: { fill: colors.text },
                    }]}
                    yAxis={[{ tickLabelStyle: { fill: colors.text } }]}
                    series={[{ dataKey: "value", label: "Number of Clients" }]}
                    colors={[chartColors.active, chartColors.inactive]}
                    height={300}
                    sx={{
                      "& .MuiChartsLegend-series text": { fill: `${colors.text} !important` },
                      "& .MuiChartsAxis-tickLabel": { fill: colors.text },
                      "& .MuiChartsAxis-label": { fill: colors.text },
                    }}
                  />
                )}
              </Box>

              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: colors.text }}>
                  Client Types Breakdown
                </Typography>
              </Box>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: 1,
                      textAlign: "center",
                      backgroundColor: darkMode ? alpha(chartColors.primary, 0.1) : "#e3f2fd",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Sole Proprietor
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
                      {clientStats.soleProprietor}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: 1,
                      textAlign: "center",
                      backgroundColor: darkMode ? alpha(chartColors.purple, 0.1) : "#f3e5f5",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Corporation
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
                      {clientStats.corporation}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: 1,
                      textAlign: "center",
                      backgroundColor: darkMode ? alpha(chartColors.orange, 0.1) : "#fff3e0",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      COOP
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
                      {clientStats.coop}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate("/dashboard/clients")}
                  fullWidth
                  sx={{ color: colors.text, borderColor: colors.cardBorder }}
                >
                  View All Clients
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate("/dashboard/clients")}
                  fullWidth
                >
                  Add New Client
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── NOTIFICATIONS SECTION (Redesigned) ─────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: colors.sectionBg,
          border: `1px solid ${colors.sectionBorder}`,
          borderRadius: 2,
        }}
      >
        {/* Section Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Badge badgeContent={criticalCount} color="error">
              <NotificationsIcon sx={{ color: colors.text, fontSize: 24 }} />
            </Badge>
            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
              Notifications
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {criticalCount > 0 && (
              <Chip
                label={`${criticalCount} Critical`}
                size="small"
                color="error"
                variant="filled"
                sx={{ fontWeight: 700, fontSize: "0.7rem" }}
              />
            )}
            <Chip
              label={`${totalNotifications} Total`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: "0.7rem" }}
            />
          </Box>
        </Box>

        {/* Legend */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2.5,
            pb: 2,
            borderBottom: `1px solid ${colors.notificationBorder}`,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Critical", color: "#ef4444" },
            { label: "High", color: "#f59e0b" },
            { label: "Medium", color: "#3b82f6" },
            { label: "Low", color: "#6b7280" },
          ].map((item) => (
            <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: item.color,
                  boxShadow: `0 0 5px ${item.color}88`,
                }}
              />
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: "0.7rem" }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Category Panels */}
        {totalNotifications === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
              color: colors.textSecondary,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <NotificationsIcon sx={{ fontSize: 40, opacity: 0.3 }} />
            <Typography variant="body2">No notifications at this time.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {Object.entries(categorizedNotifications).map(([categoryKey, items]) => (
              <NotificationCategoryPanel
                key={categoryKey}
                category={categoryKey}
                items={items}
                darkMode={darkMode}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Additional Analytics Section */}
      <Grid container spacing={2}>
        {/* Employee Hiring Trends */}
        {empHireList.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 2,
                height: "100%",
                backgroundColor: colors.cardBg,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ color: colors.text }}>
                  Hiring Trends - {year}
                </Typography>
                <TextField
                  select
                  size="small"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{
                    width: 100,
                    "& .MuiOutlinedInput-root": {
                      color: colors.text,
                      "& fieldset": { borderColor: colors.cardBorder },
                    },
                  }}
                >
                  {[2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </TextField>
              </Box>
              <BarChart
                dataset={empHireList}
                xAxis={[{
                  scaleType: "band",
                  dataKey: "month",
                  tickLabelStyle: { fill: colors.text },
                }]}
                yAxis={[{ tickLabelStyle: { fill: colors.text } }]}
                series={[{ dataKey: "count", label: "Employees Hired", color: chartColors.primary }]}
                height={300}
                sx={{
                  "& .MuiChartsLegend-series text": { fill: `${colors.text} !important` },
                  "& .MuiChartsAxis-tickLabel": { fill: colors.text },
                  "& .MuiChartsAxis-label": { fill: colors.text },
                }}
              />
            </Paper>
          </Grid>
        )}

        {/* Workforce Distribution */}
        {workforceList.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 2,
                height: "100%",
                backgroundColor: colors.cardBg,
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: colors.text }}>
                Workforce Distribution
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <PieChart
                  series={[
                    {
                      data: workforceList.map((item, index) => ({
                        id: index,
                        value: item.count || 0,
                        label: item.category || "Unknown",
                      })),
                      highlightScope: { faded: "global", highlighted: "item" },
                      faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
                    },
                  ]}
                  height={300}
                  slotProps={{
                    legend: {
                      direction: "row",
                      position: { vertical: "bottom", horizontal: "middle" },
                      padding: 0,
                      labelStyle: { fill: colors.text },
                    },
                  }}
                  sx={{
                    "& .MuiChartsLegend-series text": { fill: `${colors.text} !important` },
                    "& .MuiChartsAxis-tickLabel": { fill: colors.text },
                    "& .MuiChartsAxis-label": { fill: colors.text },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}