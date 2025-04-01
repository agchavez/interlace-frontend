// ClaimCard.tsx
import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Divider,
    Grid,
    Paper,
    IconButton,
    Collapse,
    Tooltip
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import {
    KeyboardArrowDown, KeyboardArrowUp, Description
} from "@mui/icons-material";

import { Claim } from "../../../store/claim/claimApi";
import {format} from "date-fns";

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(1),
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    marginBottom: theme.spacing(2),
    overflow: "visible"
}));

const StatusChip = styled(Chip)(({ status }: { status: string }) => {
    const colorMap: Record<string, string> = {
        "PENDIENTE": "#FFA726",
        "EN_REVISION": "#2196F3",
        "RECHAZADO": "#F44336",
        "APROBADO": "#66BB6A"
    };

    return {
        backgroundColor: colorMap[status] || "#9E9E9E",
        color: "white",
        fontWeight: 600,
        height: 28
    };
});

const ClaimTypeChip = styled(Chip)(({ claimType }: { theme: any, claimType: string }) => {
    const colorMap: Record<string, string> = {
        "FALTANTE": "#E57373",
        "SOBRANTE": "#81C784",
        "DAÑOS_CALIDAD_TRANSPORTE": "#64B5F6"
    };

    return {
        backgroundColor: colorMap[claimType] || "#9E9E9E",
        color: "white",
        height: 28
    };
});

interface ClaimCardProps {
    claim: Claim;
}

const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
        "PENDIENTE": "Pendiente",
        "EN_REVISION": "En Revisión",
        "RECHAZADO": "Rechazado",
        "APROBADO": "Aprobado"
    };
    return statusMap[status] || status;
};

const getClaimTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
        "FALTANTE": "Faltante",
        "SOBRANTE": "Sobrante",
        "DAÑOS_CALIDAD_TRANSPORTE": "Daños por Calidad/Transporte"
    };
    return typeMap[type] || type;
};

const ClaimCard: React.FC<ClaimCardProps> = ({ claim }) => {
    const [expanded, setExpanded] = useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <StyledCard>
            {/* Cabecera con información principal */}
            <CardContent sx={{ pb: 1 }}>
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} md={7}>
                        <Box display="flex" alignItems="center" mb={1}>
                            
                            <Box>
                                <Typography variant="h6" component="div">
                                    Reclamo Tracker TRK-{claim.tracker}
                                </Typography>
                                <Box display="flex" gap={1} mt={0.5}>
                                    <ClaimTypeChip
                                        theme={useTheme()}
                                        claimType={claim.claim_type}
                                        label={getClaimTypeLabel(claim.claim_type)}
                                        size="small"
                                    />
                                    <StatusChip
                                        status={claim.status}
                                        label={getStatusLabel(claim.status)}
                                        size="small"
                                    />
                                        <Chip
                                            icon={<Description fontSize="small" />}
                                            label={`TRK-${claim.tracker}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    
                                </Box>
                            </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <strong>Descripción:</strong> {claim.description || "Sin descripción"}
                        </Typography>

                        <Box mt={1}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Creado:</strong> {format(new Date(claim.created_at), "dd/MM/yyyy HH:mm")}
                            </Typography>
                        </Box>
                        <Box mt={1}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Asignado:</strong> {claim.assigned_to || "Sin asignar"}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Sección de información de estado */}
                    <Grid item xs={12} md={5}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                backgroundColor: claim.status === 'RECHAZADO'
                                    ? 'rgba(244, 67, 54, 0.08)'
                                    : claim.status === 'APROBADO'
                                        ? 'rgba(102, 187, 106, 0.08)'
                                        : 'rgba(33, 150, 243, 0.08)',
                                borderRadius: 1
                            }}
                        >
                            <Typography variant="subtitle2" gutterBottom>
                                Estado del Reclamo
                            </Typography>

                            <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                                {claim.status === 'PENDIENTE' && "El reclamo está pendiente de revisión"}
                                {claim.status === 'EN_REVISION' && "El reclamo está siendo revisado actualmente"}
                                {claim.status === 'RECHAZADO' && "El reclamo ha sido rechazado"}
                                {claim.status === 'APROBADO' && "El reclamo ha sido aprobado"}
                            </Typography>

                            {claim.assigned_to && (
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Asignado a:</strong> ID: {claim.assigned_to}
                                </Typography>
                            )}

                            {claim.observations && (
                                <Tooltip title="Ver observaciones completas">
                                    <IconButton
                                        onClick={handleExpandClick}
                                        aria-expanded={expanded}
                                        aria-label="mostrar observaciones"
                                        size="small"
                                        sx={{ ml: 'auto', display: 'block' }}
                                    >
                                        {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* Observaciones expandibles */}
                {claim.observations && (
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Box mt={2} mb={1} p={2} bgcolor="rgba(0,0,0,0.02)" borderRadius={1}>
                            <Typography variant="subtitle2" gutterBottom>
                                Observaciones del Revisor
                            </Typography>
                            <Typography variant="body2">
                                {claim.observations}
                            </Typography>
                        </Box>
                    </Collapse>
                )}
            </CardContent>

            <Divider />
        </StyledCard>
    );
};

export default ClaimCard;