import React, { useState } from "react";
import { Modal, Box, IconButton, Typography } from "@mui/material";
import { Document, Page } from "react-pdf";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface PDFPreviewModalProps {
    file: string;
    onClose: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ file, onClose }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const goToPrevPage = () => setPageNumber(prevPage => Math.max(prevPage - 1, 1));
    const goToNextPage = () => setPageNumber(prevPage => Math.min(prevPage + 1, numPages || 1));

    return (
        <Modal open={!!file} onClose={onClose}>
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
                }}
            >
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={pageNumber} />
                </Document>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                    <IconButton onClick={goToPrevPage} disabled={pageNumber <= 1}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography>
                        Página {pageNumber} de {numPages}
                    </Typography>
                    <IconButton onClick={goToNextPage} disabled={pageNumber >= (numPages || 1)}>
                        <ArrowForwardIcon />
                    </IconButton>
                </Box>
            </Box>
        </Modal>
    );
};