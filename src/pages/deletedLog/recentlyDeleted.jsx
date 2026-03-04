import React, { useState, useContext } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HistoryIcon from "@mui/icons-material/History";
import PeopleIcon from "@mui/icons-material/People";
import BadgeIcon from "@mui/icons-material/Badge";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { hookContainer } from "../../hooks/globalQuery";
import { useQueryClient } from "@tanstack/react-query";
import { http } from "../../api/http";
import { toast } from "sonner";
import { AuthContext } from "../../modules/context/AuthContext";

dayjs.extend(relativeTime);

// ── Module config ─────────────────────────────────────────────
const MODULES = [
  { key: "All",         label: "All",         icon: <HistoryIcon />,               color: "default"   },
  { key: "Client",      label: "Clients",      icon: <PeopleIcon />,                color: "primary"   },
  { key: "Employee",    label: "Employees",    icon: <BadgeIcon />,                 color: "secondary" },
  { key: "Service",     label: "Services",     icon: <MiscellaneousServicesIcon />, color: "info"      },
  { key: "Transaction", label: "Transactions", icon: <ReceiptLongIcon />,           color: "warning"   },
  { key: "Payroll",     label: "Payroll",      icon: <AccountBalanceWalletIcon />,  color: "success"   },
];

const MODULE_COLORS = {
  Client:      "primary",
  Employee:    "secondary",
  Service:     "info",
  Transaction: "warning",
  Payroll:     "success",
};

export default function RecentlyDeleted() {
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  const queryClient = useQueryClient();
  const { accessToken } = useContext(AuthContext);

  const currentUser = accessToken?.username || accessToken?.name || accessToken?.EmployeeName || "system";

  // ── State ─────────────────────────────────────────────────
  const [moduleFilter, setModuleFilter]         = useState("All");
  const [searchQuery, setSearchQuery]           = useState("");
  const [page, setPage]                         = useState(0);
  const [rowsPerPage, setRowsPerPage]           = useState(10);
  const [detailDialog, setDetailDialog]         = useState({ open: false, record: null });
  const [restoreDialog, setRestoreDialog]       = useState({ open: false, record: null });
  const [permDeleteDialog, setPermDeleteDialog] = useState({ open: false, record: null });

  // ── Data ──────────────────────────────────────────────────
  const { data: deletedRaw, isLoading } = hookContainer(
    `/selectdeletedlog?module=${moduleFilter}&search=${searchQuery}`
  );
  const { data: summaryRaw } = hookContainer("/selectdeletedlogsummary");

  const deletedList = Array.isArray(deletedRaw?.data) ? deletedRaw.data : [];
  const summaryList = Array.isArray(summaryRaw?.data) ? summaryRaw.data : [];

  const summaryMap = {};
  summaryList.forEach((s) => { summaryMap[s.Module] = s.Count; });
  const totalDeleted = summaryList.reduce((sum, s) => sum + parseInt(s.Count || 0), 0);

  // Paginate
  const paginatedList = deletedList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const invalidate = () => {
    queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0]?.includes?.("deletedlog") });
  };

  // ── Restore ───────────────────────────────────────────────
  const handleRestore = async () => {
    const record = restoreDialog.record;
    try {
      const res = await http.post("/restoredeletedlog", {
        id: record.ID,
        restoredBy: currentUser,
      });
      if (res.data?.success) {
        toast.success(`Restored: ${record.RecordLabel}`);
        invalidate();
        setRestoreDialog({ open: false, record: null });
      } else {
        toast.error("Failed to restore record.");
      }
    } catch {
      toast.error("Failed to restore record.");
    }
  };

  // ── Permanent delete ──────────────────────────────────────
  const handlePermanentDelete = async () => {
    const record = permDeleteDialog.record;
    try {
      await http.delete(`/permanentdeletelog?id=${record.ID}`);
      toast.success(`Permanently deleted: ${record.RecordLabel}`);
      invalidate();
      setPermDeleteDialog({ open: false, record: null });
    } catch {
      toast.error("Failed to permanently delete.");
    }
  };

  // ── Styles ────────────────────────────────────────────────
  const cellSx = {
    fontSize: "0.82rem",
    px: 1.5,
    py: 1,
    borderBottom: "1px solid",
    borderColor: "divider",
    whiteSpace: "nowrap",
  };

  const headerSx = {
    fontWeight: "bold",
    fontSize: "0.75rem",
    px: 1.5,
    py: 1.2,
    backgroundColor: "action.hover",
    color: "text.secondary",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid",
    borderColor: "divider",
    whiteSpace: "nowrap",
  };

  const headerCells = ["#", "Module", "Record", "Deleted By", "Deleted At", "Actions"];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      {/* ── Page Header ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <HistoryIcon sx={{ fontSize: 28, color: "text.secondary" }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">Recently Deleted</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Deleted records are kept here until permanently removed.
            </Typography>
          </Box>
        </Box>
        <Chip
          icon={<HistoryIcon />}
          label={`${totalDeleted} deleted record${totalDeleted !== 1 ? "s" : ""}`}
          color="default"
          variant="outlined"
        />
      </Paper>

      {/* ── Summary Cards ── */}
      <Grid container spacing={1.5}>
        {MODULES.filter((m) => m.key !== "All").map((mod) => {
          const count = summaryMap[mod.key] || 0;
          return (
            <Grid item xs={6} sm={4} md={2} key={mod.key}>
              <Paper
                elevation={0}
                onClick={() => { setModuleFilter(mod.key); setPage(0); }}
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: moduleFilter === mod.key
                    ? `${mod.color}.main`
                    : "divider",
                  borderRadius: 2,
                  cursor: "pointer",
                  textAlign: "center",
                  backgroundColor: moduleFilter === mod.key
                    ? alpha(theme.palette[mod.color]?.main || theme.palette.primary.main, darkMode ? 0.15 : 0.07)
                    : "transparent",
                  transition: "all 0.15s ease",
                  "&:hover": { borderColor: `${mod.color}.main` },
                }}
              >
                <Box sx={{ color: `${mod.color}.main`, mb: 0.5 }}>
                  {React.cloneElement(mod.icon, { fontSize: "small" })}
                </Box>
                <Typography variant="h6" fontWeight="bold">{count}</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>{mod.label}</Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Toolbar ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        {/* Module filter tabs */}
        <ToggleButtonGroup
          value={moduleFilter}
          exclusive
          size="small"
          onChange={(e, val) => { if (val) { setModuleFilter(val); setPage(0); } }}
          sx={{ flexWrap: "wrap", gap: 0.5 }}
        >
          {MODULES.map((mod) => (
            <ToggleButton
              key={mod.key}
              value={mod.key}
              sx={{
                fontSize: "0.72rem",
                px: 1.5,
                py: 0.5,
                borderRadius: "6px !important",
                border: "1px solid !important",
                borderColor: "divider !important",
                "&.Mui-selected": {
                  backgroundColor: alpha(
                    theme.palette[mod.color]?.main || theme.palette.primary.main,
                    darkMode ? 0.2 : 0.12
                  ),
                  color: `${mod.color}.main`,
                  fontWeight: "bold",
                },
              }}
            >
              {mod.label}
              {mod.key !== "All" && summaryMap[mod.key] > 0 && (
                <Chip
                  label={summaryMap[mod.key]}
                  size="small"
                  sx={{ ml: 0.5, height: 16, fontSize: "0.65rem", cursor: "pointer" }}
                />
              )}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Search */}
        <TextField
          placeholder="Search by name, deleted by, module..."
          size="small"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          sx={{ width: 280, ml: "auto" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
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
      </Box>

      {/* ── Table ── */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ overflowX: "auto", maxHeight: 560 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {headerCells.map((label) => (
                  <TableCell
                    key={label}
                    sx={{
                      ...headerSx,
                      ...(label === "Actions" ? { textAlign: "center" } : {}),
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={headerCells.length} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.disabled">Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headerCells.length} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <HistoryIcon sx={{ fontSize: 32, color: "text.disabled" }} />
                      <Typography variant="body2" color="text.disabled" fontStyle="italic">
                        {searchQuery
                          ? `No deleted records matching "${searchQuery}"`
                          : "No recently deleted records."}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedList.map((row, index) => (
                  <TableRow
                    key={row.ID}
                    hover
                    sx={{
                      backgroundColor: index % 2 === 0 ? "transparent" : "action.hover",
                      "&:hover": { backgroundColor: "action.selected" },
                    }}
                  >
                    {/* # */}
                    <TableCell sx={{ ...cellSx, color: "text.disabled", fontSize: "0.72rem", width: 50, textAlign: "center" }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>

                    {/* Module */}
                    <TableCell sx={cellSx}>
                      <Chip
                        label={row.Module}
                        size="small"
                        color={MODULE_COLORS[row.Module] || "default"}
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: 20 }}
                      />
                    </TableCell>

                    {/* Record */}
                    <TableCell sx={{ ...cellSx, maxWidth: 260, whiteSpace: "normal" }}>
                      <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                        {row.RecordLabel}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>
                        ID: {row.RecordID}
                      </Typography>
                    </TableCell>

                    {/* Deleted By */}
                    <TableCell sx={cellSx}>
                      <Typography variant="body2">{row.DeletedBy}</Typography>
                    </TableCell>

                    {/* Deleted At */}
                    <TableCell sx={cellSx}>
                      <Typography variant="body2">
                        {dayjs(row.DeletedAt).format("MMM D, YYYY")}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>
                        {dayjs(row.DeletedAt).fromNow()}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={cellSx} align="center">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setDetailDialog({ open: true, record: row })}
                          >
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Restore">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => setRestoreDialog({ open: true, record: row })}
                          >
                            <RestoreIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Permanently">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setPermDeleteDialog({ open: true, record: row })}
                          >
                            <DeleteForeverIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
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
          count={deletedList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{ borderTop: "1px solid", borderColor: "divider" }}
        />
      </Paper>

      {/* ── Detail Dialog ── */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, record: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
          <InfoOutlinedIcon fontSize="small" />
          Deleted Record Details
          {detailDialog.record && (
            <Chip
              label={detailDialog.record.Module}
              size="small"
              color={MODULE_COLORS[detailDialog.record.Module] || "default"}
              sx={{ ml: "auto", fontSize: "0.7rem" }}
            />
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {detailDialog.record && (() => {
            const r = detailDialog.record;
            let parsed = {};
            try { parsed = typeof r.DeletedData === "string" ? JSON.parse(r.DeletedData) : r.DeletedData; } catch {}
            return (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Grid container spacing={1.5}>
                  {[
                    { label: "Module",      value: r.Module },
                    { label: "Record ID",   value: r.RecordID },
                    { label: "Record Name", value: r.RecordLabel },
                    { label: "Deleted By",  value: r.DeletedBy },
                    { label: "Deleted At",  value: dayjs(r.DeletedAt).format("MMMM D, YYYY h:mm A") },
                  ].map(({ label, value }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>{label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{value}</Typography>
                    </Grid>
                  ))}
                </Grid>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Snapshot of Deleted Data
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: darkMode ? alpha("#000", 0.3) : alpha("#000", 0.03),
                      maxHeight: 250,
                      overflowY: "auto",
                    }}
                  >
                    <List dense disablePadding>
                      {Object.entries(parsed).map(([key, val]) => (
                        <ListItem key={key} disablePadding sx={{ py: 0.25 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Typography variant="caption" sx={{ color: "text.secondary", minWidth: 140, fontFamily: "monospace" }}>
                                  {key}
                                </Typography>
                                <Typography variant="caption" fontWeight={600} sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                                  {val === null || val === undefined ? "—" : String(val)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Box>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
          <Button onClick={() => setDetailDialog({ open: false, record: null })}>Close</Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<RestoreIcon />}
            onClick={() => {
              setDetailDialog({ open: false, record: null });
              setRestoreDialog({ open: true, record: detailDialog.record });
            }}
          >
            Restore This Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Restore Confirmation Dialog ── */}
      <Dialog
        open={restoreDialog.open}
        onClose={() => setRestoreDialog({ open: false, record: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
          <RestoreIcon fontSize="small" sx={{ color: "success.main" }} />
          <Typography fontWeight="bold" sx={{ color: "success.main" }}>Restore Record</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          {restoreDialog.record && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2">
                Are you sure you want to restore this record?
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5, borderRadius: 1, border: "1px solid",
                  borderColor: "success.main",
                  backgroundColor: alpha(theme.palette.success.main, 0.05),
                  mt: 1,
                }}
              >
                <Typography variant="body2" fontWeight={700}>{restoreDialog.record.RecordLabel}</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {restoreDialog.record.Module} · Deleted by {restoreDialog.record.DeletedBy} on {dayjs(restoreDialog.record.DeletedAt).format("MMM D, YYYY")}
                </Typography>
              </Paper>
              <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5 }}>
                ⚠️ Note: Restoring marks this log entry as restored. You may need to re-insert the data into the original table depending on your system setup.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
          <Button onClick={() => setRestoreDialog({ open: false, record: null })}>Cancel</Button>
          <Button variant="contained" color="success" startIcon={<RestoreIcon />} onClick={handleRestore}>
            Restore
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Permanent Delete Confirmation Dialog ── */}
      <Dialog
        open={permDeleteDialog.open}
        onClose={() => setPermDeleteDialog({ open: false, record: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
          <DeleteForeverIcon fontSize="small" sx={{ color: "error.main" }} />
          <Typography fontWeight="bold" sx={{ color: "error.main" }}>Delete Permanently</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          {permDeleteDialog.record && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2">
                This will <strong>permanently remove</strong> this record from the deleted log. This action cannot be undone.
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5, borderRadius: 1, border: "1px solid",
                  borderColor: "error.main",
                  backgroundColor: alpha(theme.palette.error.main, 0.05),
                  mt: 1,
                }}
              >
                <Typography variant="body2" fontWeight={700}>{permDeleteDialog.record.RecordLabel}</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {permDeleteDialog.record.Module} · Deleted {dayjs(permDeleteDialog.record.DeletedAt).fromNow()}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider", p: 2 }}>
          <Button onClick={() => setPermDeleteDialog({ open: false, record: null })}>Cancel</Button>
          <Button variant="contained" color="error" startIcon={<DeleteForeverIcon />} onClick={handlePermanentDelete}>
            Delete Forever
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}