import { Box, Typography } from '@mui/material';

export default function WorkstationPage() {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={600}>Estacion de Trabajo</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
                Esta funcionalidad estara disponible proximamente.
            </Typography>
        </Box>
    );
}
