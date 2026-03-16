// Notification/Data/index.jsx
<<<<<<< HEAD
// Merged: regular system notifications + BIR filing deadline alerts

import { Box, ListItemText, Stack, Typography, Skeleton, Chip } from "@mui/material";
=======

import { Box, ListItemText, Stack, Typography, Skeleton } from "@mui/material";
>>>>>>> 5c691c4ef26b3a96ddd4ea215a5e150f8f3626c4
import NotifButton from "../NotifComponent";
import DataContainer from "../NotifComponent/Container";
import Identification from "../NotifComponent/Identification";
import ListAvatar from "../NotifComponent/ListAvatar";
import ListContainer from "../NotifComponent/ListContainer";
import ReactTimeAgo from 'react-time-ago';
import { http } from "../../../api/http";
import SkeletonAvatar from "../NotifComponent/SkeletonAvatar";
import NoNotificationIcon from '../../../assets/images/no-alarm.png';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
<<<<<<< HEAD
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const daysLeft = (s) => {
  const d = new Date(s);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - TODAY) / 86400000);
};

const fmtDate = (s) =>
  !s
    ? "—"
    : new Date(s).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

const periodLabel = (hdr) => {
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (hdr.PeriodType === "Monthly")
    return `${M[(hdr.PeriodMonth || 1) - 1]} ${hdr.PeriodYear}`;
  if (hdr.PeriodType === "Quarterly")
    return `Q${hdr.PeriodQuarter} ${hdr.PeriodYear}`;
  return String(hdr.PeriodYear);
};

// ── API calls ─────────────────────────────────────────────────────────────────
=======

// ── API calls ────────────────────────────────────────────────────────────────
>>>>>>> 5c691c4ef26b3a96ddd4ea215a5e150f8f3626c4

const fetchNotifications = async () => {
  const res = await http.get('/get-notifications');
  return res?.data?.data ?? res?.data ?? [];
};

<<<<<<< HEAD
const fetchMonitors = async () => {
  const res = await http.get('/selectmonitors');
  return res?.data?.data ?? [];
};

=======
>>>>>>> 5c691c4ef26b3a96ddd4ea215a5e150f8f3626c4
const markReadRequest = async (id) => {
  const res = await http.post(`/mark-notification-read?id=${id}`);
  return res.data;
};

<<<<<<< HEAD
// ── Build BIR alert objects from monitors ────────────────────────────────────
// Surfaces any unfiled form with a deadline within the next 7 days (or already overdue).

const buildBirAlerts = (monitors) => {
  const alerts = [];

  monitors.forEach((monitor) => {
    const details = monitor.Details ?? [];
    details.forEach((detail) => {
      if (detail.IsFiled) return;
      const dl = daysLeft(detail.DeadlineDate);
      if (dl > 7) return; // only urgent / overdue items

      alerts.push({
        // Unique key so React doesn't clash with regular notif IDs
        id: `bir-${detail.ID}`,
        type: "bir_deadline",
        formCode: detail.FormCode,
        formName: detail.FormName,
        clientName: monitor.Client?.TradeName || monitor.Client?.LNF || "—",
        period: periodLabel(monitor),
        deadlineDate: detail.DeadlineDate,
        daysLeft: dl,
        isOverdue: dl < 0,
        // Use the monitor's creation/update time as a timestamp if available;
        // otherwise fall back to the deadline itself so ReactTimeAgo has something.
        time_created: detail.DeadlineDate,
      });
    });
  });

  // Sort: overdue first, then soonest deadline
  alerts.sort((a, b) => a.daysLeft - b.daysLeft);
  return alerts;
};

// ── BIR Alert list item ───────────────────────────────────────────────────────

const BirAlertItem = ({ alert }) => {
  const isOverdue = alert.isOverdue;
  const isDueToday = alert.daysLeft === 0;

  const accentColor = isOverdue ? "#DC2626" : isDueToday ? "#D97706" : "#D97706";
  const bgColor     = isOverdue ? "rgba(220,38,38,0.06)" : "rgba(217,119,6,0.06)";
  const borderColor = isOverdue ? "rgba(220,38,38,0.25)" : "rgba(217,119,6,0.25)";

  const urgencyLabel = isOverdue
    ? `${Math.abs(alert.daysLeft)}d overdue`
    : isDueToday
    ? "Due today!"
    : `${alert.daysLeft}d left`;

  return (
    <ListContainer>
      <NotifButton>
        {/* Left accent stripe + icon in place of avatar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: bgColor,
            border: `1.5px solid ${borderColor}`,
            flexShrink: 0,
            mr: 1.5,
          }}
        >
          {isOverdue ? (
            <ErrorIcon sx={{ fontSize: 20, color: accentColor }} />
          ) : (
            <WarningAmberIcon sx={{ fontSize: 20, color: accentColor }} />
          )}
        </Box>

        <DataContainer>
          <ListItemText sx={{ flex: "1 1 auto", minWidth: 0, margin: 0 }}>
            {/* Form code pill + form name */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                flexWrap: "wrap",
                mb: 0.4,
              }}
            >
              <Chip
                label={alert.formCode}
                size="small"
                sx={{
                  fontSize: "0.6rem",
                  height: 18,
                  fontFamily: "monospace",
                  fontWeight: 800,
                  bgcolor: bgColor,
                  color: accentColor,
                  border: `1px solid ${borderColor}`,
                }}
              />
              <Typography fontSize="13px" fontWeight={600} lineHeight={1.3}>
                {alert.formName}
              </Typography>
            </Box>

            {/* Client · Period · deadline */}
            <Stack
              direction="row"
              alignItems="center"
              flexWrap="wrap"
              gap={0.5}
              sx={{ fontSize: "0.72rem", color: "text.secondary" }}
            >
              <Typography variant="caption" fontWeight={700} color={accentColor}>
                {urgencyLabel}
              </Typography>
              <Box
                sx={{
                  width: 2,
                  height: 2,
                  borderRadius: "50%",
                  bgcolor: "currentcolor",
                }}
              />
              <Typography variant="caption">{alert.clientName}</Typography>
              <Box
                sx={{
                  width: 2,
                  height: 2,
                  borderRadius: "50%",
                  bgcolor: "currentcolor",
                }}
              />
              <CalendarTodayIcon sx={{ fontSize: 11 }} />
              <Typography variant="caption">{alert.period}</Typography>
              <Box
                sx={{
                  width: 2,
                  height: 2,
                  borderRadius: "50%",
                  bgcolor: "currentcolor",
                }}
              />
              <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                Due {fmtDate(alert.deadlineDate)}
              </Typography>
            </Stack>
          </ListItemText>
        </DataContainer>
      </NotifButton>
    </ListContainer>
  );
};

=======
>>>>>>> 5c691c4ef26b3a96ddd4ea215a5e150f8f3626c4
// ── Component ─────────────────────────────────────────────────────────────────

const NotificationData = () => {
  const queryClient = useQueryClient();

<<<<<<< HEAD
  // Regular system notifications
  const { data: notifications = [], isLoading: notifsLoading } = useQuery({
=======
  const { data: notifications = [], isLoading } = useQuery({
>>>>>>> 5c691c4ef26b3a96ddd4ea215a5e150f8f3626c4
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
  });

<<<<<<< HEAD
  // BIR monitors (for deadline alerts)
  const { data: monitors = [], isLoading: monitorsLoading } = useQuery({
    queryKey: ['monitors-notif'],
    queryFn: fetchMonitors,
    refetchInterval: 5 * 60_000, // same cadence as FilingTracker
  });

  const isLoading = notifsLoading || monitorsLoading;

  // Only unread system notifications
  const unRead = notifications.filter((n) => n.notif_status === 0);

  // BIR deadline alerts (overdue or due within 7 days)
  const birAlerts = buildBirAlerts(monitors);

=======
  // Only show pending (notif_status === 0) notifications
  const unRead = notifications.filter((n) => n.notif_status === 0);

>>>>>>> 5c691c4ef26b3a96ddd4ea215a5e150f8f3626c4
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['notifications'] });

  const markReadMutation = useMutation({
    mutationFn: markReadRequest,
    onSuccess: invalidate,
  });

<<<<<<< HEAD
  const totalCount = unRead.length + birAlerts.length;

  // ── Loading skeleton ────────────────────────────────────────────────────────
=======
  // ── Loading skeleton ──────────────────────────────────────────────────────
>>>>>>> 5c691c4ef26b3a96ddd4ea215a5e150f8f3626c4

  if (isLoading) {
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <ListContainer key={i}>
            <NotifButton>
              <SkeletonAvatar />
              <DataContainer>
                <ListItemText sx={{ flex: '1 1 auto', minWidth: 0, margin: 0 }}>
                  <Box sx={{ marginBottom: '4px' }}>
                    <Skeleton variant="text" animation="wave" sx={{ fontSize: '15px', width: '100%' }} />
                  </Box>
                  <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', fontSize: '0.75rem' }}>
                    <Skeleton variant="text" animation="wave" width={150} sx={{ fontSize: '15px' }} />
                  </Stack>
                </ListItemText>
              </DataContainer>
            </NotifButton>
          </ListContainer>
        ))}
      </>
    );
  }

<<<<<<< HEAD
  // ── Empty state ─────────────────────────────────────────────────────────────

  if (totalCount === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1.5,
          height: '85vh',
        }}
      >
=======
  // ── Empty state ───────────────────────────────────────────────────────────

  if (unRead.length === 0) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        gap: 1.5, height: '85vh',
      }}>
>>>>>>> 5c691c4ef26b3a96ddd4ea215a5e150f8f3626c4
        <img
          src={NoNotificationIcon}
          style={{ height: '5%', width: '10%' }}
          alt="No notifications"
        />
        <Typography variant="body2" align="center">
          No notifications
        </Typography>
      </Box>
    );
  }

<<<<<<< HEAD
  // ── Notification list ───────────────────────────────────────────────────────
  // Order: overdue BIR alerts first → pending BIR alerts → regular system notifs

  return (
    <>
      {/* BIR deadline alerts (overdue first, then soonest) */}
      {birAlerts.map((alert) => (
        <BirAlertItem key={alert.id} alert={alert} />
      ))}

      {/* Section divider when both types are present */}
      {birAlerts.length > 0 && unRead.length > 0 && (
        <Box
          sx={{
            px: 2,
            py: 0.75,
            bgcolor: 'background.default',
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.disabled"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.62rem' }}
          >
            System Notifications
          </Typography>
        </Box>
      )}

      {/* Regular system notifications */}
=======
  // ── Notification list ─────────────────────────────────────────────────────

  return (
    <>
>>>>>>> 5c691c4ef26b3a96ddd4ea215a5e150f8f3626c4
      {unRead.map((notif, index) => (
        <ListContainer key={notif.id ?? index}>
          <NotifButton>
            <Identification />
            <ListAvatar />
            <DataContainer>
              <ListItemText
                sx={{ flex: '1 1 auto', minWidth: 0, margin: 0 }}
                onClick={() => markReadMutation.mutate(notif.id)}
              >
                <Box sx={{ marginBottom: '4px' }}>
                  <Typography fontSize="15px">
                    {notif.first_name} {notif.last_name} — {notif.id_number}
                  </Typography>
                </Box>
<<<<<<< HEAD
                <Stack
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    lineHeight: 1.5,
                    fontSize: '0.75rem',
                    fontWeight: 400,
                  }}
                >
                  <ReactTimeAgo date={new Date(notif.time_created).getTime()} />
                  <Box
                    sx={{
                      width: '2px',
                      height: '2px',
                      backgroundColor: 'currentcolor',
                      marginLeft: '4px',
                      marginRight: '4px',
                      borderRadius: '50%',
                    }}
                  />
=======
                <Stack sx={{
                  display: 'flex', flexDirection: 'row', alignItems: 'center',
                  lineHeight: 1.5, fontSize: '0.75rem', fontWeight: 400,
                }}>
                  <ReactTimeAgo date={new Date(notif.time_created).getTime()} />
                  <Box sx={{
                    width: '2px', height: '2px',
                    backgroundColor: 'currentcolor',
                    marginLeft: '4px', marginRight: '4px',
                    borderRadius: '50%',
                  }} />
>>>>>>> 5c691c4ef26b3a96ddd4ea215a5e150f8f3626c4
                  {notif.type_of_notification}
                </Stack>
              </ListItemText>
            </DataContainer>
          </NotifButton>
        </ListContainer>
      ))}
    </>
  );
};

export default NotificationData;