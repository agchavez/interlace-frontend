import { Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

const FloatLoading = ({ visible = false }) => {
    return (
        <Box position="fixed" right={15} sx={{visibility:visible?"visible":"hidden"}}>
            <CircularProgress
                size={30}
            />
        </Box>
    );
};

export default FloatLoading;
