import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      gap={2}
    >
      <CircularProgress size={40} />
      <Typography variant="h6" color="textSecondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner; 