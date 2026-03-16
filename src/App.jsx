import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from "@mui/material/styles"
import { RouterProvider } from "react-router-dom"
import { AuthProvider } from "./modules/context/AuthContext"
import routes from "./routes"
import { AppSettingsContext, UseMode } from "./themes"

function App() {
  const [theme, appMode] = UseMode();
  console.log("\x1b[31m" + `
    █████████   ███████████   ██
    ██          ██            ██
    ██          ██            ██
    █████████   ██            ██
           ██   ██            ██
           ██   ██            ██
    █████████   ███████████   ██████████
    ` +"\x1b[0m");
  return (
    
    <AppSettingsContext.Provider value={appMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <RouterProvider router={routes} />
          </AuthProvider>
        </ThemeProvider>
    </AppSettingsContext.Provider>
    
  )
}

export default App
