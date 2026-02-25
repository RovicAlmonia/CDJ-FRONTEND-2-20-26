// Notification/Data/index.jsx

import { Box, ListItemText, Stack, Typography, Skeleton } from "@mui/material";
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

// ── API calls ────────────────────────────────────────────────────────────────

const fetchNotifications = async () => {
  const res = await http.get('/get-notifications');
  return res?.data?.data ?? res?.data ?? [];
};

const markReadRequest = async (id) => {
  const res = await http.post(`/mark-notification-read?id=${id}`);
  return res.data;
};

// ── Component ─────────────────────────────────────────────────────────────────

const NotificationData = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
  });

  // Only show pending (notif_status === 0) notifications
  const unRead = notifications.filter((n) => n.notif_status === 0);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['notifications'] });

  const markReadMutation = useMutation({
    mutationFn: markReadRequest,
    onSuccess: invalidate,
  });

  // ── Loading skeleton ──────────────────────────────────────────────────────

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

  // ── Empty state ───────────────────────────────────────────────────────────

  if (unRead.length === 0) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        gap: 1.5, height: '85vh',
      }}>
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

  // ── Notification list ─────────────────────────────────────────────────────

  return (
    <>
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