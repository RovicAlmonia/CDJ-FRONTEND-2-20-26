import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../modules/context/AuthContext';
import { Box, Container, useTheme } from '@mui/material'
import TopNav from './TopNav';
import { motion } from 'framer-motion';
import Nav from './Sidebar/Sidebar';
import MainCard from '../../components/Cards/MainCard';
import PageLoader from '../../components/Loaders/SteveBlox';
import { useState } from 'react';
import ToastNotification from '../../components/ToastNotification';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
  const theme = useTheme();
  const { accessToken } = useAuth();
  const [loading] = useState(false);

  if (!accessToken) return <Navigate to="/" />;

  // #161C24 — matches the navbar/sidebar dark color exactly
  const bgColor = theme.palette.mode === 'dark' ? '#161C24' : '#EAECEE';

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: bgColor }}>
      {loading ? (
        <Box className="loading">
          <PageLoader />
        </Box>
      ) : (
        <>
          <ToastNotification />

          <Toaster
            position="bottom-right"
            reverseOrder={false}
            toastOptions={{
              style: {
                background:
                  theme.palette.appSettings.paletteMode === 'dark'
                    ? '#161C24'
                    : 'rgb(88, 88, 88)',
                border: 'none',
                color:
                  theme.palette.appSettings.paletteMode === 'dark'
                    ? 'rgb(200, 200, 200)'
                    : 'rgb(22, 28, 36)',
                boxShadow: 'rgba(0, 0, 0, 0.16) 0px 8px 16px 0px',
                padding: 0,
                width: '100%',
              },
            }}
          />

          <TopNav />

          <Box
            sx={{
              minHeight: 1,
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              backgroundColor: bgColor,
            }}
          >
            <Nav />

            <MainCard
              sx={{
                backgroundColor: bgColor,
                flexGrow: 1,
                boxShadow: 'none',
              }}
            >
              <motion.div layout>
                <Container
                  maxWidth={
                    theme.palette.appSettings.stretch === 'true' ? 'xl' : 'xxl'
                  }
                  sx={{ backgroundColor: bgColor, padding: 2 }}
                >
                  <Outlet />
                </Container>
              </motion.div>
            </MainCard>
          </Box>
        </>
      )}
    </Box>
  );
};

export default MainLayout;