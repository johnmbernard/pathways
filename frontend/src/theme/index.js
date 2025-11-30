import colors from './colors';
import tokens from './tokens';

// Main theme object
export const theme = {
  colors,
  ...tokens,
  
  // Component-specific styles
  components: {
    sidebar: {
      bg: colors.neutral[800],
      borderColor: colors.neutral[700],
      textColor: 'white',
      hoverBg: colors.neutral[700],
      activeBg: colors.primary[600],
    },
    
    header: {
      bg: 'white',
      borderColor: colors.neutral[200],
      textColor: colors.neutral[900],
    },
    
    button: {
      primary: {
        bg: colors.primary[600],
        hoverBg: colors.primary[700],
        textColor: 'white',
      },
      secondary: {
        bg: 'white',
        borderColor: colors.neutral[300],
        hoverBg: colors.neutral[50],
        textColor: colors.neutral[700],
      },
    },
    
    table: {
      headerBg: colors.neutral[50],
      borderColor: colors.neutral[200],
      hoverBg: colors.neutral[50],
    },
  },
};

export default theme;
