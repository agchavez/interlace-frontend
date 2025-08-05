import React from "react";
import { Modal, Box } from "@mui/material";

interface ImagePreviewModalProps {
    image: string;
    onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ image, onClose }) => {
    return (
        <Modal open={!!image} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    maxWidth: "90%",
                    maxHeight: "90%",
                    overflow: "auto",
                    display: "block",
                    width: {xs: "90vw", md: "80vw", lg: "70vw"},
                }}
            >
                <img src={image} alt="Preview" style={{ width: "100%", height: "auto" }} />
            </Box>
        </Modal>
    );
};