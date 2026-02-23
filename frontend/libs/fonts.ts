/**
 * Self-hosted fonts CSS for injection into GrapesJS editor canvas (iframe).
 * This ensures fonts render the same in preview as in generated PDF.
 */
export const SELF_HOSTED_FONTS_CSS = `
/* Inter - Static fonts */
@font-face { font-family: 'Inter'; src: url('/fonts/Inter/Inter-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; }
@font-face { font-family: 'Inter'; src: url('/fonts/Inter/Inter-Italic.ttf') format('truetype'); font-weight: 400; font-style: italic; }
@font-face { font-family: 'Inter'; src: url('/fonts/Inter/Inter-Medium.ttf') format('truetype'); font-weight: 500; font-style: normal; }
@font-face { font-family: 'Inter'; src: url('/fonts/Inter/Inter-SemiBold.ttf') format('truetype'); font-weight: 600; font-style: normal; }
@font-face { font-family: 'Inter'; src: url('/fonts/Inter/Inter-Bold.ttf') format('truetype'); font-weight: 700; font-style: normal; }

/* Roboto - Variable font */
@font-face { font-family: 'Roboto'; src: url('/fonts/Roboto/Roboto-Variable.ttf') format('truetype'); font-weight: 100 900; font-style: normal; }
@font-face { font-family: 'Roboto'; src: url('/fonts/Roboto/Roboto-Italic-Variable.ttf') format('truetype'); font-weight: 100 900; font-style: italic; }

/* Open Sans - Variable font */
@font-face { font-family: 'Open Sans'; src: url('/fonts/OpenSans/OpenSans-Variable.ttf') format('truetype'); font-weight: 300 800; font-style: normal; }
@font-face { font-family: 'Open Sans'; src: url('/fonts/OpenSans/OpenSans-Italic-Variable.ttf') format('truetype'); font-weight: 300 800; font-style: italic; }

/* Lato - Static fonts */
@font-face { font-family: 'Lato'; src: url('/fonts/Lato/Lato-Light.ttf') format('truetype'); font-weight: 300; font-style: normal; }
@font-face { font-family: 'Lato'; src: url('/fonts/Lato/Lato-LightItalic.ttf') format('truetype'); font-weight: 300; font-style: italic; }
@font-face { font-family: 'Lato'; src: url('/fonts/Lato/Lato-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; }
@font-face { font-family: 'Lato'; src: url('/fonts/Lato/Lato-Italic.ttf') format('truetype'); font-weight: 400; font-style: italic; }
@font-face { font-family: 'Lato'; src: url('/fonts/Lato/Lato-Bold.ttf') format('truetype'); font-weight: 700; font-style: normal; }
@font-face { font-family: 'Lato'; src: url('/fonts/Lato/Lato-BoldItalic.ttf') format('truetype'); font-weight: 700; font-style: italic; }

/* Montserrat - Variable font */
@font-face { font-family: 'Montserrat'; src: url('/fonts/Montserrat/Montserrat-Variable.ttf') format('truetype'); font-weight: 100 900; font-style: normal; }
@font-face { font-family: 'Montserrat'; src: url('/fonts/Montserrat/Montserrat-Italic-Variable.ttf') format('truetype'); font-weight: 100 900; font-style: italic; }

/* Source Sans Pro (Source Sans 3) - Variable font */
@font-face { font-family: 'Source Sans Pro'; src: url('/fonts/SourceSansPro/SourceSans3-Variable.ttf') format('truetype'); font-weight: 200 900; font-style: normal; }
@font-face { font-family: 'Source Sans Pro'; src: url('/fonts/SourceSansPro/SourceSans3-Italic-Variable.ttf') format('truetype'); font-weight: 200 900; font-style: italic; }

/* IBM Plex Sans - Variable font */
@font-face { font-family: 'IBM Plex Sans'; src: url('/fonts/IBMPlexSans/IBMPlexSans-Variable.ttf') format('truetype'); font-weight: 100 700; font-style: normal; }
@font-face { font-family: 'IBM Plex Sans'; src: url('/fonts/IBMPlexSans/IBMPlexSans-Italic-Variable.ttf') format('truetype'); font-weight: 100 700; font-style: italic; }

/* Playfair Display - Variable font */
@font-face { font-family: 'Playfair Display'; src: url('/fonts/PlayfairDisplay/PlayfairDisplay-Variable.ttf') format('truetype'); font-weight: 400 900; font-style: normal; }
@font-face { font-family: 'Playfair Display'; src: url('/fonts/PlayfairDisplay/PlayfairDisplay-Italic-Variable.ttf') format('truetype'); font-weight: 400 900; font-style: italic; }

/* Merriweather - Variable font */
@font-face { font-family: 'Merriweather'; src: url('/fonts/Merriweather/Merriweather-Variable.ttf') format('truetype'); font-weight: 300 900; font-style: normal; }
@font-face { font-family: 'Merriweather'; src: url('/fonts/Merriweather/Merriweather-Italic-Variable.ttf') format('truetype'); font-weight: 300 900; font-style: italic; }

/* Great Vibes - Elegant script for certificates */
@font-face { font-family: 'Great Vibes'; src: url('/fonts/GreatVibes/GreatVibes-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; }

/* Dancing Script - Casual handwriting */
@font-face { font-family: 'Dancing Script'; src: url('/fonts/DancingScript/DancingScript-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; }
@font-face { font-family: 'Dancing Script'; src: url('/fonts/DancingScript/DancingScript-Bold.ttf') format('truetype'); font-weight: 700; font-style: normal; }

/* Pacifico - Fun brush script */
@font-face { font-family: 'Pacifico'; src: url('/fonts/Pacifico/Pacifico-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; }

/* Allura - Formal calligraphy */
@font-face { font-family: 'Allura'; src: url('/fonts/Allura/Allura-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; }
`;
