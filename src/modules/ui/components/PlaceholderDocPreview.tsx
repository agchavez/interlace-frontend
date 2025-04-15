// PlaceholderDocPreview.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";

interface PlaceholderDocPreviewProps {
    boxWidth?: number | string;
    boxHeight?: number | string;
    text?: string; // por si quieres mostrar "Sin documento", etc.
}

const PlaceholderDocPreview: React.FC<PlaceholderDocPreviewProps> = ({
                                                                         boxWidth = 100,
                                                                         boxHeight = 120,
                                                                         text = "Sin documento"
                                                                     }) => {
    return (
        <Box
            sx={{
                width: boxWidth,
                height: boxHeight,
                border: "1px solid #ccc",
                borderRadius: 1,
                backgroundColor: "#f4f4f4",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 1,
            }}
        >
            <BrokenImageIcon sx={{ fontSize: 30, color: "#999" }} />
            <Typography variant="caption" sx={{ color: "#999", mt: 0.5 }}>
                {text}
            </Typography>
        </Box>
    );
};

export default PlaceholderDocPreview;
