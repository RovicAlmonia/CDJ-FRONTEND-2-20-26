import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  InputAdornment,
  Chip,
  useTheme,
  TablePagination,
  alpha,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Collapse,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import BarChartIcon from "@mui/icons-material/BarChart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import dayjs from "dayjs";
import { hookContainer } from "../../hooks/globalQuery";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtPHP = (v) =>
  "₱ " +
  parseFloat(v || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (v) => (v ? dayjs(v).format("MMM D, YYYY") : "—");

const statusColor = (s) =>
  s === "Paid" ? "success" : s === "Posted" ? "primary" : "warning";

// ─── shared styles ────────────────────────────────────────────────────────────
const cellSx = {
  fontSize: "0.82rem",
  whiteSpace: "nowrap",
  px: 1.5,
  py: 1,
  borderBottom: "1px solid",
  borderColor: "divider",
};

const headerSx = {
  fontWeight: "bold",
  fontSize: "0.78rem",
  whiteSpace: "nowrap",
  px: 1.5,
  py: 1.2,
  backgroundColor: "action.hover",
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "2px solid",
  borderColor: "divider",
};

// ─── sub-component: Summary Tab ───────────────────────────────────────────────
function SummaryTab({ summaryRaw }) {
  const rows = Array.isArray(summaryRaw?.data) ? summaryRaw.data : [];

  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}
    >
      <TableContainer sx={{ overflowX: "auto", maxHeight: 560 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {["#", "Service", "Unique Clients", "Times Availed", "Total QTY", "Total Gross", "Total Discount", "Total Net"].map(
                (h) => (
                  <TableCell
                    key={h}
                    sx={{
                      ...headerSx,
                      ...(["Total Gross", "Total Discount", "Total Net", "Times Availed", "Total QTY", "Unique Clients"].includes(h)
                        ? { textAlign: "right" }
                        : {}),
                    }}
                  >
                    {h}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <BarChartIcon sx={{ fontSize: 30, color: "text.disabled" }} />
                    <Typography variant="body2" color="text.disabled" fontSize="0.8rem" fontStyle="italic">
                      No summary data available.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => (
                <TableRow
                  key={row.ServiceID || i}
                  hover
                  sx={{
                    backgroundColor: i % 2 === 0 ? "transparent" : "action.hover",
                    "&:hover": { backgroundColor: "action.selected" },
                  }}
                >
                  <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.72rem", textAlign: "center", width: 40 }}>
                    {i + 1}
                  </TableCell>
                  <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <MiscellaneousServicesIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                      {row.ServiceName || "—"}
                      {row.ServiceID && (
                        <Chip
                          label={`ID: ${row.ServiceID}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.65rem", height: 16, fontFamily: "monospace" }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={cellSx} align="right">
                    <Chip label={row.UniqueClients} size="small" color="info" variant="outlined" sx={{ fontSize: "0.72rem" }} />
                  </TableCell>
                  <TableCell sx={cellSx} align="right">
                    <Typography variant="caption" fontWeight="bold" sx={{ fontSize: "0.82rem" }}>
                      {row.TimesAvailed}
                    </Typography>
                  </TableCell>
                  <TableCell sx={cellSx} align="right">
                    {row.TotalQty}
                  </TableCell>
                  <TableCell sx={cellSx} align="right">
                    <Typography variant="caption" sx={{ fontFamily: "monospace" }}>{fmtPHP(row.TotalGross)}</Typography>
                  </TableCell>
                  <TableCell sx={cellSx} align="right">
                    <Typography variant="caption" sx={{ fontFamily: "monospace", color: "error.main" }}>
                      {fmtPHP(row.TotalDiscount)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={cellSx} align="right">
                    <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>
                      {fmtPHP(row.TotalNet)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

// ─── sub-component: By-Client Tab ─────────────────────────────────────────────
function ByClientTab({ allRows }) {
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");

  // Group rows by ClientID
  const grouped = useMemo(() => {
    const map = {};
    allRows.forEach((r) => {
      const key = r.ClientID || "unknown";
      if (!map[key]) map[key] = { clientId: key, clientName: r.ClientName || key, rows: [] };
      map[key].rows.push(r);
    });
    return Object.values(map);
  }, [allRows]);

  const filtered = useMemo(() => {
    if (!search) return grouped;
    const q = search.toLowerCase();
    return grouped.filter(
      (g) =>
        g.clientName.toLowerCase().includes(q) ||
        g.rows.some((r) => (r.ServiceName || "").toLowerCase().includes(q))
    );
  }, [grouped, search]);

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <TextField
        placeholder="Search client or service..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ width: 280 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: search ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearch("")}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {filtered.length === 0 ? (
        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, py: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <PeopleIcon sx={{ fontSize: 30, color: "text.disabled" }} />
            <Typography variant="body2" color="text.disabled" fontSize="0.8rem" fontStyle="italic">
              {search ? `No clients matching "${search}"` : "No client data available."}
            </Typography>
          </Box>
        </Paper>
      ) : (
        filtered.map((group) => {
          const isOpen = !!expanded[group.clientId];
          const totalNet = group.rows.reduce((s, r) => s + parseFloat(r.Net || 0), 0);
          const serviceCount = group.rows.length;
          const uniqueServices = new Set(group.rows.map((r) => r.ServiceName)).size;

          return (
            <Paper
              key={group.clientId}
              elevation={0}
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}
            >
              {/* Client header row */}
              <Box
                onClick={() => toggle(group.clientId)}
                sx={{
                  px: 2,
                  py: 1.2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  backgroundColor: "action.hover",
                  "&:hover": { backgroundColor: "action.selected" },
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <PeopleIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography variant="subtitle2" fontWeight="bold">
                    {group.clientName}
                  </Typography>
                  <Chip
                    label={`${serviceCount} line item${serviceCount !== 1 ? "s" : ""}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: "0.65rem", height: 18 }}
                  />
                  <Chip
                    label={`${uniqueServices} service${uniqueServices !== 1 ? "s" : ""}`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{ fontSize: "0.65rem", height: 18 }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    sx={{ fontFamily: "monospace", color: "success.main" }}
                  >
                    Total Net: {fmtPHP(totalNet)}
                  </Typography>
                  {isOpen ? (
                    <ExpandLessIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  ) : (
                    <ExpandMoreIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  )}
                </Box>
              </Box>

              {/* Expandable detail rows */}
              <Collapse in={isOpen}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {["#", "Txn Date", "Service", "Rate", "QTY", "Gross", "Disc.", "Net", "Status"].map((h) => (
                          <TableCell key={h} sx={{ ...headerSx, backgroundColor: "background.paper" }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.rows.map((r, i) => (
                        <TableRow
                          key={r.ID || i}
                          hover
                          sx={{
                            backgroundColor: i % 2 === 0 ? "transparent" : "action.hover",
                            "&:hover": { backgroundColor: "action.selected" },
                          }}
                        >
                          <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.72rem", textAlign: "center", width: 40 }}>
                            {i + 1}
                          </TableCell>
                          <TableCell sx={cellSx}>{fmtDate(r.TransactionDate)}</TableCell>
                          <TableCell sx={{ ...cellSx, fontWeight: 600 }}>{r.ServiceName || "—"}</TableCell>
                          <TableCell sx={cellSx} align="right">
                            <Typography variant="caption" sx={{ fontFamily: "monospace" }}>{fmtPHP(r.Rate)}</Typography>
                          </TableCell>
                          <TableCell sx={{ ...cellSx, textAlign: "center" }}>{r.QTY}</TableCell>
                          <TableCell sx={cellSx} align="right">
                            <Typography variant="caption" sx={{ fontFamily: "monospace" }}>{fmtPHP(r.Gross)}</Typography>
                          </TableCell>
                          <TableCell sx={cellSx} align="right">
                            <Typography variant="caption" sx={{ fontFamily: "monospace", color: "error.main" }}>
                              {fmtPHP(r.Discount)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx} align="right">
                            <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>
                              {fmtPHP(r.Net)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <Chip
                              label={r.Status || "—"}
                              size="small"
                              color={statusColor(r.Status)}
                              sx={{ fontSize: "0.65rem" }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Collapse>
            </Paper>
          );
        })
      )}
    </Box>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ServicesAvailedInt() {
  const theme = useTheme();

  const { data: availedRaw }  = hookContainer("/selectservicesavailed");
  const { data: summaryRaw }  = hookContainer("/selectservicesavailedsummary");

  const allRows = Array.isArray(availedRaw?.data) ? availedRaw.data : [];

  // ── Tab state ──
  const [tab, setTab] = useState(0);

  // ── "All Records" tab state ──
  const [searchQuery, setSearchQuery]   = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage]                 = useState(0);
  const [rowsPerPage, setRowsPerPage]   = useState(10);

  const filteredAll = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allRows.filter((row) => {
      const matchSearch =
        !searchQuery ||
        (row.ClientName || "").toLowerCase().includes(q) ||
        (row.ServiceName || "").toLowerCase().includes(q) ||
        (row.Particulars || "").toLowerCase().includes(q) ||
        (row.ServiceID?.toString() || "").includes(q);
      const matchStatus = statusFilter === "All" || row.Status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [allRows, searchQuery, statusFilter]);

  const hasFilters = searchQuery || statusFilter !== "All";

  const paginatedAll = filteredAll.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ── stat chips ──
  const totalClients  = new Set(allRows.map((r) => r.ClientID)).size;
  const totalServices = new Set(allRows.map((r) => r.ServiceName)).size;
  const totalRecords  = allRows.length;

  const headerCells = ["#", "Date", "Client", "Service", "Rate", "QTY", "Gross", "Disc.", "Net", "Status"];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      {/* ── Top stat bar ── */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <AssignmentIcon fontSize="small" sx={{ color: "text.secondary" }} />
          <Typography variant="subtitle2" fontWeight="bold">
            Services Availed
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Chip
            icon={<AssignmentIcon sx={{ fontSize: "14px !important" }} />}
            label={`${totalRecords} total records`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: "0.7rem", height: 22 }}
          />
          <Chip
            icon={<PeopleIcon sx={{ fontSize: "14px !important" }} />}
            label={`${totalClients} client${totalClients !== 1 ? "s" : ""}`}
            size="small"
            color="info"
            variant="outlined"
            sx={{ fontSize: "0.7rem", height: 22 }}
          />
          <Chip
            icon={<MiscellaneousServicesIcon sx={{ fontSize: "14px !important" }} />}
            label={`${totalServices} service type${totalServices !== 1 ? "s" : ""}`}
            size="small"
            color="secondary"
            variant="outlined"
            sx={{ fontSize: "0.7rem", height: 22 }}
          />
        </Box>
      </Paper>

      {/* ── Tabs ── */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: "1px solid", borderColor: "divider", px: 1, pt: 0.5, minHeight: 40 }}
          TabIndicatorProps={{ sx: { height: 3, borderRadius: "3px 3px 0 0" } }}
        >
          <Tab
            icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="All Records"
            sx={{ fontSize: "0.78rem", minHeight: 40, textTransform: "none", gap: 0.5, py: 0 }}
          />
          <Tab
            icon={<PeopleIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="By Client"
            sx={{ fontSize: "0.78rem", minHeight: 40, textTransform: "none", gap: 0.5, py: 0 }}
          />
          <Tab
            icon={<BarChartIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Summary"
            sx={{ fontSize: "0.78rem", minHeight: 40, textTransform: "none", gap: 0.5, py: 0 }}
          />
        </Tabs>

        {/* ── Tab: All Records ── */}
        {tab === 0 && (
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>

            {/* Filters */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <TextField
                placeholder="Search client, service, particulars..."
                size="small"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                sx={{ width: 280 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => { setSearchQuery(""); setPage(0); }}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
              <TextField
                label="Status"
                select
                size="small"
                sx={{ width: 130 }}
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              >
                <MenuItem value="All">All</MenuItem>
                {["Active", "Posted", "Paid"].map((s) => (
                  <MenuItem key={s} value={s}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8, height: 8, borderRadius: "50%",
                          backgroundColor:
                            s === "Paid" ? "success.main" : s === "Posted" ? "primary.main" : "warning.main",
                        }}
                      />
                      {s}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              {hasFilters && (
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  startIcon={<FilterAltOffIcon />}
                  onClick={() => { setSearchQuery(""); setStatusFilter("All"); setPage(0); }}
                >
                  Clear
                </Button>
              )}
              {hasFilters && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {filteredAll.length} of {totalRecords} record(s)
                </Typography>
              )}
            </Box>

            {/* Table */}
            <Paper
              elevation={0}
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}
            >
              <TableContainer sx={{ overflowX: "auto", maxHeight: 480 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {headerCells.map((h) => (
                        <TableCell
                          key={h}
                          sx={{
                            ...headerSx,
                            ...( ["Rate", "Gross", "Disc.", "Net"].includes(h) ? { textAlign: "right" } : {}),
                            ...( ["QTY", "Status"].includes(h) ? { textAlign: "center" } : {}),
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedAll.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={headerCells.length} align="center" sx={{ py: 5, color: "text.secondary" }}>
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                            <AssignmentIcon sx={{ fontSize: 30, color: "text.disabled" }} />
                            <Typography variant="body2" color="text.disabled" fontSize="0.8rem" fontStyle="italic">
                              {hasFilters
                                ? `No records match your filters.`
                                : "No services availed data found."}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedAll.map((row, index) => (
                        <TableRow
                          key={row.ID || index}
                          hover
                          sx={{
                            backgroundColor: index % 2 === 0 ? "transparent" : "action.hover",
                            "&:hover": { backgroundColor: "action.selected" },
                          }}
                        >
                          <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.72rem", textAlign: "center", width: 40 }}>
                            {page * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell sx={cellSx}>{fmtDate(row.TransactionDate)}</TableCell>
                          <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <PeopleIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                              {row.ClientName || row.ClientID || "—"}
                            </Box>
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                              <MiscellaneousServicesIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                              <Typography variant="body2" fontWeight={500}>{row.ServiceName || "—"}</Typography>
                              {row.ServiceID && (
                                <Chip
                                  label={row.ServiceID}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: "0.65rem", height: 16, fontFamily: "monospace" }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={cellSx} align="right">
                            <Typography variant="caption" sx={{ fontFamily: "monospace" }}>{fmtPHP(row.Rate)}</Typography>
                          </TableCell>
                          <TableCell sx={{ ...cellSx, textAlign: "center" }}>{row.QTY}</TableCell>
                          <TableCell sx={cellSx} align="right">
                            <Typography variant="caption" sx={{ fontFamily: "monospace" }}>{fmtPHP(row.Gross)}</Typography>
                          </TableCell>
                          <TableCell sx={cellSx} align="right">
                            <Typography variant="caption" sx={{ fontFamily: "monospace", color: "error.main" }}>
                              {fmtPHP(row.Discount)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx} align="right">
                            <Typography variant="caption" fontWeight="bold" sx={{ fontFamily: "monospace", color: "success.main" }}>
                              {fmtPHP(row.Net)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ ...cellSx, textAlign: "center" }}>
                            <Chip
                              label={row.Status || "—"}
                              size="small"
                              color={statusColor(row.Status)}
                              sx={{ fontSize: "0.65rem" }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredAll.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                sx={{ borderTop: "1px solid", borderColor: "divider" }}
              />
            </Paper>
          </Box>
        )}

        {/* ── Tab: By Client ── */}
        {tab === 1 && (
          <Box sx={{ p: 2 }}>
            <ByClientTab allRows={allRows} />
          </Box>
        )}

        {/* ── Tab: Summary ── */}
        {tab === 2 && (
          <Box sx={{ p: 2 }}>
            <SummaryTab summaryRaw={summaryRaw} />
          </Box>
        )}
      </Paper>
    </Box>
  );
}