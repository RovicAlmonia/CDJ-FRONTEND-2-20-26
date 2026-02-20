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

  // Fetch client statistics from backend
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

  // Client stats — reads from real backend, no hardcoded fallbacks, others removed
  const clientStats = {
    total: clientData?.data?.total || 0,
    active: clientData?.data?.active || 0,
    inactive: clientData?.data?.inactive || 0,
    soleProprietor: clientData?.data?.soleProprietor || 0,
    corporation: clientData?.data?.corporation || 0,
    coop: clientData?.data?.coop || 0,
  };

  // Percentages — guard against divide by zero
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

  // Chart data — Active vs Inactive
  const clientStatusData = [
    { id: 0, value: clientStats.active, label: "Active Clients", color: chartColors.active },
    { id: 1, value: clientStats.inactive, label: "Inactive Clients", color: chartColors.inactive },
  ];

  // Chart data — 3 types only, others removed
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
      notifications,
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

  const notifications = [
    ...(VLList.length > 0
      ? [{ text: `${VLList.length} Vacation Leave request(s) pending approval` }]
      : []),
    ...(OTList.length > 0
      ? [{ text: `${OTList.length} Overtime request(s) pending approval` }]
      : []),
    ...(loanList.length > 0
      ? [{ text: `${loanList.length} Loan application(s) pending approval` }]
      : []),
    ...(AbsentList.length > 0
      ? [{ text: `${AbsentList.length} Absence report(s) pending approval` }]
      : []),
    { text: `Tax Clearance will expire on ${dayjs().add(1, "day").format("MMMM D, YYYY")}` },
    { text: `Upcoming payment is set for ${dayjs().format("MMMM D, YYYY")}` },
  ];

  const chartSetting = {
    xAxis: [{ label: "Employees Hired", min: 0, tickInterval: 2 }],
  };

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

              {/* Active/Inactive Breakdown */}
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
              {/* Chart Controls */}
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

              {/* Chart */}
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

              {/* Client Types Breakdown — 3 cards only, others removed */}
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

              {/* Quick Action Buttons */}
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

      {/* Notifications Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: colors.sectionBg,
          border: `1px solid ${colors.sectionBorder}`,
          borderRadius: 2,
          minHeight: 200,
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
            Notifications
          </Typography>
          <Chip label={`${notifications.length} items`} size="small" color="primary" />
        </Box>
        {notifications.length > 0 ? (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <ListItem
                key={index}
                sx={{
                  py: 1,
                  px: 0,
                  borderBottom:
                    index < notifications.length - 1
                      ? `1px solid ${colors.notificationBorder}`
                      : "none",
                }}
              >
                <ListItemText
                  primary={`• ${notification.text}`}
                  primaryTypographyProps={{ fontSize: 14, color: colors.text }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography sx={{ py: 3, textAlign: "center", color: colors.textSecondary }}>
            No notifications at this time.
          </Typography>
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