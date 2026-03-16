import { Box, Button, Divider, IconButton, Stack, Typography } from "@mui/material"
import { Fragment } from "react";
import CloseIcon from "../../svg-icons/CloseIcon";
import PerfectScrollbar from 'react-perfect-scrollbar';
import Mode from "../Settings/Mode";
import Contrast from "../Settings/Contast";
import Layout from "../Settings/Layout";
import Stretch from "../Settings/Stretch";
import Presets from "../Settings/Presets";
import NavColor from "../Settings/NavColor";
import BorderRadius from "../Settings/BorderRadius";
import Fonts from "../Settings/Fonts";
import { useDispatch } from "react-redux";
import { SET_MENU } from "../../../store/actions";

const DrawerContainer = () => {
  const dispatch = useDispatch();
  const closeSettingDrawer = () => {
    dispatch({ type: SET_MENU, opened: false });
  };
  return (
    <Fragment>
        <Stack sx={{
            display: 'flex',
            flexDirection: 'row',
            WebkitBoxAlign: 'center',
            alignItems: 'center',
            WebkitBoxPack: 'justify',
            justifyContent: 'space-between', 
            padding: '16px 8px 16px 20px'
        }}>
            <Typography fontSize="18px">Settings</Typography>
            <IconButton size="medium" onClick={closeSettingDrawer} ><CloseIcon /></IconButton>
        </Stack>
        <Divider sx={{
            margin:0,
            flexShrink: 0,
            borderWidth: '0px 0px thin',
            borderStyle: 'dashed'
         }} />
         <Box sx={{ 
            WebkitBoxFlex: 1,
            flexGrow: 1,
            height: '100%',
            overflow: 'hidden'
         }}>
            <PerfectScrollbar >
                <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    padding: '24px'
                }}>
                    <Mode />
                    <Contrast />
                    <Layout />
                    <Stretch />
                    <Presets />
                    <NavColor />
                    <BorderRadius />
                    <Fonts />
                </Box>
            </PerfectScrollbar>
         </Box>
         <Box sx={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button fullWidth sx={{
                border: '1px solid rgba(145, 158, 171, 0.08)',
            }}>
                Fullscreen
            </Button>
         </Box>
    </Fragment>
  )
}

export default DrawerContainer