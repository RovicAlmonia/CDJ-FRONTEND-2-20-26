import { useTheme } from "@mui/material"

const SidebarBack = () => {
  const theme = useTheme();
  return (
    <svg xmlns="http://www.w3.org/2000/svg" 
    xmlnsXlink="http://www.w3.org/1999/xlink" 
    aria-hidden="true" 
    role="img" 
    className="component-iconify MuiBox-root css-3o0h5k iconify iconify--eva" 
    viewBox="0 0 24 24" width="0.9em" height="0.9em"
    >
      <path fill={theme.palette.appSettings.paletteMode === 'dark' ? '#919EAB' : 'black'} d="M13.83 19a1 1 0 0 1-.78-.37l-4.83-6a1 1 0 0 1 0-1.27l5-6a1 1 0 0 1 1.54 1.28L10.29 12l4.32 5.36a1 1 0 0 1-.78 1.64"></path>
    </svg>
  )
}

export default SidebarBack