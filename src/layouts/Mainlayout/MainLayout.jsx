import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../modules/context/AuthContext';
import { Box, Container, useTheme } from '@mui/material'
import TopNav from './TopNav';
import { motion } from 'framer-motion';
import Nav from './Sidebar/Sidebar';
import MainCard from '../../components/Cards/MainCard';
import PageLoader from '../../components/Loaders/SteveBlox';
import { useEffect, useState } from 'react';
import ToastNotification from '../../components/ToastNotification';
import {http} from '../../api/http';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
  const theme = useTheme();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  if (!accessToken) return <Navigate to="/" />;

  
  return (
    <>  
      {loading ? ( <Box className="loading"><PageLoader /></Box>  ) : (
        <>
        <ToastNotification />
        <Toaster position="bottom-right" reverseOrder={false} toastOptions={{
          style: { 
          background: theme.palette.appSettings.paletteMode === 'dark' ? 'rgb(33,43,54)' : 'rgb(255,255,255)', 
          border: 'none',
          color: theme.palette.appSettings.paletteMode === 'dark' ? 'rgb(255,255,255)' : 'rgb(22, 28, 36)',
          boxShadow: 'rgba(0, 0, 0, 0.16) 0px 8px 16px 0px',
          padding: 0,
          width: '100%',
        },
        }} />
        <TopNav />
        <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          }}
        >
          <Nav /> 
          <MainCard>
          <motion.div layout>
            <Container maxWidth={theme.palette.appSettings.stretch === 'true' ? 'xl' : 'xxl'}>
              <Outlet />
            </Container>
          </motion.div>
          </MainCard>
        </Box>
        </>
      )}

    </>
  )
}

export default MainLayout