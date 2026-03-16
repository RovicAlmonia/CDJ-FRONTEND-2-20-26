import { useTheme } from "@mui/material"

const SidebarFront = () => {
  const theme = useTheme();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-hidden="true"
      role="img"
      className="component-iconify MuiBox-root css-3o0h5k iconify iconify--eva"
      viewBox="0 0 24 24"
      width="0.9em" 
      height="0.9em"
    >
      <path
        fill={theme.palette.appSettings.paletteMode === 'dark' ? '#919EAB' : 'black'}
        d="M10 19a1 1 0 0 1-.64-.23a1 1 0 0 1-.13-1.41L13.71 12L9.39 6.63a1 1 0 0 1 .15-1.41a1 1 0 0 1 1.46.15l4.83 6a1 1 0 0 1 0 1.27l-5 6A1 1 0 0 1 10 19"
      ></path>
    </svg>
  )
}

export default SidebarFront