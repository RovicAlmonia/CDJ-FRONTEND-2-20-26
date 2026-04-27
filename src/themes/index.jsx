import { createContext, useEffect, useMemo, useState } from "react";
import themeTypography from "./typography";
import { createTheme } from "@mui/material/styles";
import compStyleOverride from "./compStyleOverride";
import { navColors, tokens } from "./palette";
import { useSelector } from "react-redux";

export const ThemeSettings = (appSettings, radius) => {
    return {
        palette: {
            appSettings: appSettings,
            ...(appSettings.paletteMode === "dark" 
            ? { 
                 mode: 'dark', 
                ...(appSettings.colorPreset === "dark-green" ? {
                    primary: { main: "#00A76F" }
                } : appSettings.colorPreset === "light-blue" ? {
                    primary: { main: "#078DEE" }
                } : appSettings.colorPreset === "dark-purple" ? {
                    primary: { main: "#7635DC" }
                } : appSettings.colorPreset === "dark-blue" ? {
                    primary: { main: '#2065D1' }
                } : appSettings.colorPreset === "light-orange" ? {
                    primary: { main: '#FDA92D' }
                } : {
                    primary: { main: '#FF3030' }
                }),
                ...(appSettings.contrast === "default" ? {
                    background: { default: "#161C24" },
                } : {
                    background: { default: "#161C24" },
                }),
            }
            :
            {
                mode: 'light', 
                ...(appSettings.colorPreset === "dark-green" ? {
                    primary: { main: "#00A76F" }
                } : appSettings.colorPreset === "light-blue" ? {
                    primary: { main: "#078DEE" }
                } : appSettings.colorPreset === "dark-purple" ? {
                    primary: { main: "#7635DC" }
                } : appSettings.colorPreset === "dark-blue" ? {
                    primary: { main: '#2065D1' }
                } : appSettings.colorPreset === "light-orange" ? {
                    primary: { main: '#FDA92D' }
                } : {
                    primary: { main: '#FF3030' }
                }),
                ...(appSettings.contrast === "default" ? {
                    background: { default: "#FFFFFF" },
                } : {
                    background: { default: "#F4F6F8" },
                }),
            })
        },
        typography: themeTypography(appSettings),
        components: compStyleOverride(appSettings, radius),
        tokens: tokens(appSettings),
        navColors: navColors(appSettings)
    };
};

export const AppSettingsContext = createContext({
    //Color Preset
    toggleDarkGreen: () => {},
    toggleLightBlue: () => {},
    toggleDarkPurple: () => {},
    toggleDarkBlue: () => {},
    toggleLightOrange: () => {},
    toggleDarkRed: () => {},
    //contrast
    toggleDefault: () => {},
    toggleBold: () => {},
    //layout
    toggleVertical: () => {},
    toggleHorizontal: () => {},
    toggleCollapsed: () => {},
    //nav bar Colors
    toggleBlendin: () => {},
    toggleDiscrete: () => {},
    toggleEvident: () => {},
    //palette Mode
    toggleLightMode: () => {},
    toggleDarkMode: () => {},
    //stretch
    toggleStretch: () => {},
    //UiFont
    toggleRobotSlab: () => {},
    togglePoetsenOne: () => {},
    togglePublicSans: () => {},
    togglePlusJakarta: () => {},
    toggleDMSans: () => {},
});

export const UseMode = () => {
    const radius = useSelector((state) => state.customization.borderRadius);
    const colors = JSON.parse(localStorage.getItem("app.settings")) || 'dark-green';
    const appContrasts = JSON.parse(localStorage.getItem("app.settings")) || 'default';
    const appLayout = JSON.parse(localStorage.getItem("app.settings")) || 'horizontal';
    const navColors = JSON.parse(localStorage.getItem("app.settings")) || 'blend-in';
    const palettes = JSON.parse(localStorage.getItem("app.settings")) || 'dark';
    const appContent = JSON.parse(localStorage.getItem("app.settings")) || 'true';
    const UiFont = JSON.parse(localStorage.getItem("app.settings")) || "'Plus Jakarta Sans', sans-serif";
    const [appSettings, setAppSettings] = useState({
        colorPreset: colors.colorPreset || 'dark-green',
        contrast: appContrasts.contrast || 'default',
        layout: appLayout.layout || 'horizontal',
        navColor: navColors.navColor || 'blend-in',
        paletteMode: palettes.paletteMode || 'dark',
        stretch: appContent.stretch || 'true',
        UiFont: UiFont.UiFont || "'Plus Jakarta Sans', sans-serif"
    });


    const appMode = useMemo(
        () => ({
            //Color Preset
            toggleDarkGreen: () => setAppSettings({ ...appSettings, colorPreset: 'dark-green' }),
            toggleLightBlue: () => setAppSettings({ ...appSettings, colorPreset: 'light-blue' }),
            toggleDarkPurple: () => setAppSettings({ ...appSettings, colorPreset: 'dark-purple' }),
            toggleDarkBlue: () => setAppSettings({ ...appSettings, colorPreset: 'dark-blue' }),
            toggleLightOrange: () => setAppSettings({ ...appSettings, colorPreset: 'light-orange' }),
            toggleDarkRed: () => setAppSettings({ ...appSettings, colorPreset: 'dark-red' }),
            //contrast 
            toggleDefault: () => setAppSettings({ ...appSettings, contrast: 'default' }),
            toggleBold: () => setAppSettings({ ...appSettings, contrast: 'bold' }),
            //layout
            toggleVertical: () => setAppSettings({ ...appSettings, layout: 'vertical' }),
            toggleHorizontal: () => setAppSettings({ ...appSettings, layout: 'horizontal' }),
            toggleCollapsed: () => setAppSettings({ ...appSettings, layout: 'collapsed' }),
            //Nav Bar Color
            toggleBlendin: () => setAppSettings({ ...appSettings, navColor: 'blend-in' }),
            toggleDiscrete: () => setAppSettings({ ...appSettings, navColor: 'discrete' }),
            toggleEvident: () => setAppSettings({ ...appSettings, navColor: 'evident' }),
            //palette Mode
            toggleLightMode: () => setAppSettings({ ...appSettings, paletteMode: 'light' }),
            toggleDarkMode: () => setAppSettings({ ...appSettings, paletteMode: 'dark' }),
            //stretch
            toggleStretch: () => {
                const newStretchValue = appSettings.stretch === 'true' ? 'false' : 'true';
                setAppSettings({ ...appSettings, stretch: newStretchValue });
            },
            toggleRobotSlab: () => setAppSettings({ ...appSettings, UiFont: "'Roboto Slab', serif" }),
            togglePoetsenOne: () => setAppSettings({ ...appSettings, UiFont: "'Poetsen One', sans-serif" }),
            togglePublicSans: () => setAppSettings({ ...appSettings, UiFont: "'Public Sans', sans-serif" }),
            togglePlusJakarta: () => setAppSettings({ ...appSettings, UiFont: "'Plus Jakarta Sans', sans-serif" }),
            toggleDMSans: () => setAppSettings({ ...appSettings, UiFont: "'DM Sans', sans-serif" }),
            appSettings, radius
        }),
        [appSettings, radius]
    );

    useEffect(() => {
        localStorage.setItem("app.settings", JSON.stringify(appSettings));
    }, [appSettings]);



    const theme = useMemo(() => createTheme(ThemeSettings(appSettings, radius)), [appSettings, radius]);
    return [theme, appMode];

}
