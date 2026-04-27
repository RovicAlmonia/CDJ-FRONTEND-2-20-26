export function remToPx(value) {
  return Math.round(parseFloat(value) * 16);
}

export function pxToRem(value) {
  return `${value / 16}rem`;
}

export function responsiveFontSizes({ sm, md, lg }) {
  return {
    '@media (min-width:600px)': {
      fontSize: pxToRem(sm),
    },
    '@media (min-width:900px)': {
      fontSize: pxToRem(md),
    },
    '@media (min-width:1200px)': {
      fontSize: pxToRem(lg),
    },
  };
}

export default function themeTypography(appSettings){
    const paletteMode = appSettings && appSettings.paletteMode ? appSettings.paletteMode : 'light'; // Default to 'light' if appSettings or paletteMode is not defined
    const textColor = paletteMode === 'dark' ? 'white' : 'black';
    return {
        fontFamily: [`${appSettings.UiFont}`].join(","),
          h6: {
            fontWeight: 500,
            color: textColor,
            fontSize: pxToRem(17),
            ...responsiveFontSizes({ sm: 18, md: 18, lg: 18 }),
                  },
          h5: {
            fontSize: pxToRem(18),
            ...responsiveFontSizes({ sm: 19, md: 20, lg: 20 }),
            color: textColor,
            fontWeight: 500
          },
          h4: {
            fontSize: pxToRem(20),
            ...responsiveFontSizes({ sm: 20, md: 24, lg: 24 }),
            color: textColor,
            fontWeight: 600
          },
          h3: {
            fontSize: pxToRem(24),
            ...responsiveFontSizes({ sm: 26, md: 30, lg: 32 }),
            color: textColor,
            fontWeight: 600
          },
          h2: {
            fontSize: pxToRem(32),
            ...responsiveFontSizes({ sm: 40, md: 44, lg: 48 }),
            color: textColor,
            fontWeight: 700
          },
          h1: {
            fontSize: pxToRem(40),
            ...responsiveFontSizes({ sm: 52, md: 58, lg: 64 }),
            color: textColor,
            fontWeight: 700
          },
          subtitle1: {
            fontSize: pxToRem(16),
            fontWeight: 600,
            color: textColor,
            lineHeight: 1.5,
          },
          subtitle2: {
            fontSize: pxToRem(14),
            fontWeight: 600,
            color: textColor,
            lineHeight: 22 / 14,
          },
          caption: {
            lineHeight: 1.5,
            fontSize: pxToRem(12),
            color: textColor
          },
          overline: {
            fontWeight: 700,
            lineHeight: 1.5,
            fontSize: pxToRem(12),
            textTransform: 'uppercase',
          },
          body1: {
            lineHeight: 1.5,
            fontSize: pxToRem(16),
          },
          body2: {
            lineHeight: 22 / 14,
            fontSize: pxToRem(14),
            color: textColor
          },
          button: {
            fontWeight: 700,
            lineHeight: 24 / 14,
            fontSize: pxToRem(14),
            textTransform: 'unset',
          },
          
          customInput: {
            marginTop: 1,
            marginBottom: 1,
            '& > label': {
              top: 23,
              left: 0,
              color: 'inherit',
              '&[data-shrink="false"]': {
                top: 5
              }
            },
            '& > div > input': {
              padding: '30.5px 14px 11.5px !important'
            },
            '& legend': {
              display: 'none'
            },
            '& fieldset': {
              top: 0
            }
          },
          mainContent: {
            width: '100%',
            minHeight: 'calc(100vh - 88px)',
            flexGrow: 1,
            padding: '20px',
            marginTop: '88px',
            marginRight: '20px',
            borderRadius: `2px`,  
          },
          menuCaption: {
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'black',
            padding: '6px',
            textTransform: 'capitalize',
            marginTop: '10px'
          },
          subMenuCaption: {
            fontSize: '0.6875rem',
            fontWeight: 500,
            color: 'black',
            textTransform: 'capitalize'
          },
          commonAvatar: {
            cursor: 'pointer',
            borderRadius: '8px'
          },
          smallAvatar: {
            width: '22px',
            height: '22px',
            fontSize: '1rem'
          },
          mediumAvatar: {
            width: '34px',
            height: '34px',
            fontSize: '1.2rem'
          },
          largeAvatar: {
            width: '44px',
            height: '44px',
            fontSize: '1.5rem'
          }
    }
}