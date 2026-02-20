import { Breadcrumbs, Stack, Typography, styled, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";



const BreadCrumbs = () => {
  const theme = useTheme();
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const StyledLink = styled(Link)(() => ({
    textDecoration: 'none',
    cursor: 'pointer',
    color: theme.palette.appSettings.paletteMode === 'dark' ? 'white' : 'black',
    '&:hover': {
      textDecoration: 'underline',
    },
  }));
  return (
    <Stack spacing={2}>
        <Breadcrumbs separator="›" sx={{ margin : '2px 0px', fontSize:"0.875rem"}}>
            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                return isLast ? (
                <Typography key={to} fontSize="0.875rem">
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </Typography>
                ) : (
                <StyledLink to={to} key={to}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </StyledLink>
                );
            })}
        </Breadcrumbs>
    </Stack>
  )
}

export default BreadCrumbs