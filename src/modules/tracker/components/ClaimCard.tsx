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
    Avatar,
    alpha,
    Stack,
    ButtonBase
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
    KeyboardArrowDown,
    KeyboardArrowUp,
    Description,
    AccessTime,
    Person,
    Notes,
    CheckCircleOutlined,
    ErrorOutlined,
    HourglassEmptyOutlined
} from "@mui/icons-material";

import { Claim } from "../../../store/claim/claimApi";
import { format } from "date-fns";
import { ClaimTypeChipWrapper } from "../../ui/components/ClaimTypeChip";

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
    marginBottom: theme.spacing(2),
    overflow: "visible",
    border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
    transition: 'all 0.2s ease',
    backgroundImage: 'linear-gradient(to right bottom, #ffffff, #fbfbfc)',
    '&:hover': {
        boxShadow: '0 10px 28px rgba(0,0,0,0.08)',
        transform: 'translateY(-2px)'
    }
}));

const StatusChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'statusColor',
})(({ theme, statusColor }: { theme?: any, statusColor: string }) => ({
    backgroundColor: alpha(statusColor, 0.12),
    color: statusColor,
    fontWeight: 600,
    height: 28,
    border: `1px solid ${alpha(statusColor, 0.2)}`,
    '& .MuiChip-label': {
        padding: '0 10px',
    }
}));

const StatusAvatar = styled(Avatar, {
    shouldForwardProp: (prop) => prop !== 'statusColor',
})(({ statusColor }: { statusColor: string }) => ({
    backgroundColor: alpha(statusColor, 0.12),
    color: statusColor,
    width: 56,
    height: 56
}));

interface ClaimCardProps {
    claim: Claim;
}

const getStatusInfo = (status: string): { label: string, color: string, icon: JSX.Element } => {
    const statusMap: Record<string, { label: string, color: string, icon: JSX.Element }> = {
        "PENDIENTE": { 
            label: "Pendiente", 
            color: "#F9A825", 
            icon: <HourglassEmptyOutlined sx={{ fontSize: 30 }} /> 
        },
        "EN_REVISION": { 
            label: "En Revisión", 
            color: "#1E88E5", 
            icon: <HourglassEmptyOutlined sx={{ fontSize: 30 }} /> 
        },
        "RECHAZADO": { 
            label: "Rechazado", 
            color: "#E53935", 
            icon: <ErrorOutlined sx={{ fontSize: 30 }} /> 
        },
        "APROBADO": { 
            label: "Aprobado", 
            color: "#43A047", 
            icon: <CheckCircleOutlined sx={{ fontSize: 30 }} /> 
        }
    };
    
    return statusMap[status] || { label: status, color: "#9E9E9E", icon: <HourglassEmptyOutlined sx={{ fontSize: 30 }} /> };
};

const ClaimCard: React.FC<ClaimCardProps> = ({ claim }) => {
    const [expanded, setExpanded] = useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const statusInfo = getStatusInfo(claim.status);
    const isApproved = claim.status === "APROBADO";

    return (
        <StyledCard>
            <CardContent sx={{ py: 3, px: 3 }}>
                {/* Top Section with Status */}
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <StatusAvatar statusColor={statusInfo.color}>
                            {statusInfo.icon}
                        </StatusAvatar>
                    </Grid>

                    <Grid item xs>
                        {/* Main Info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="h6" component="h2" sx={{ 
                                fontWeight: 600, 
                                color: '#37474F',
                                letterSpacing: '-0.02em',
                            }}>
                                Reclamo ID {claim.id}
                                <Box 
                                    component="span" 
                                    sx={{ 
                                        ml: 1, 
                                        fontSize: '0.9rem',
                                        opacity: 0.7,
                                        fontWeight: 400,
                                    }}
                                >
                                    (TRK-{claim.tracker})
                                </Box>
                            </Typography>
                            
                            <StatusChip 
                                statusColor={statusInfo.color}
                                label={statusInfo.label}
                                size="small"
                            />
                        </Box>

                        {/* Tag Group */}
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <ClaimTypeChipWrapper
                                claimTypeId={claim.claim_type}
                                size="small"
                            />
                            {claim.claim_number && (
                                <Chip
                                    label={`Reclamo: ${claim.claim_number}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ borderColor: alpha('#000', 0.1) }}
                                />
                            )}
                        </Stack>

                        {/* Creation Date */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                Creado el {format(new Date(claim.created_at), "dd/MM/yyyy")} a las {format(new Date(claim.created_at), "HH:mm")}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Description Section - Shows conditionally */}
                {claim.observations && (
                    <Box sx={{ mt: 3, mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                            Observaciones
                        </Typography>
                        <Paper 
                            variant="outlined" 
                            sx={{ 
                                p: 2.5,
                                borderColor: alpha('#000', 0.08),
                                borderRadius: 2,
                                boxShadow: `inset 0 0 20px ${alpha('#f0f0f0', 0.8)}`,
                                bgcolor: alpha('#f9f9f9', 0.4)
                            }}
                        >
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: '#424242',
                                    lineHeight: 1.7,
                                    letterSpacing: '0.01em',
                                }}
                            >
                                "{claim.observations}"
                            </Typography>
                        </Paper>
                    </Box>
                )}

                {/* Status Info Cards Section */}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {/* Asignado a... */}
                    {claim.assigned_to_name && (
                        <Grid item xs={12} md={6} lg={4}>
                            <Box sx={{ 
                                p: 2, 
                                height: '100%',
                                borderLeft: `3px solid ${alpha('#607D8B', 0.6)}`,
                                bgcolor: alpha('#607D8B', 0.04),
                                borderRadius: '0 8px 8px 0',
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Person fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Responsable
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {claim.assigned_to_name}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    )}

                    {/* Info de Aprobación: Número de Claim */}
                    {isApproved && claim.claim_number && (
                        <Grid item xs={12} sm={6} md={6} lg={4}>
                            <Box sx={(theme) => ({  
                                p: 2,
                                height: '100%', 
                                borderLeft: `3px solid ${alpha('#1c2536', 0.6)}`,
                                bgcolor: alpha(theme.palette.secondary.main, 0.04),
                                borderRadius: '0 8px 8px 0'
                            })}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <CheckCircleOutlined sx={{ color: 'secondary.main' }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Número de Claim
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500} color="secondary.dark">
                                            {claim.claim_number}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    )}

                    {/* Info de Aprobación: Documento de Descarte */}
                    {isApproved && claim.discard_doc && (
                        <Grid item xs={12} sm={6} md={6} lg={4}>
                            <Box sx={(theme) => ({ 
                                p: 2,
                                height: '100%', 
                                borderLeft: `3px solid ${alpha('#1c2536', 0.6)}`,
                                bgcolor: alpha(theme.palette.secondary.main, 0.04),
                                borderRadius: '0 8px 8px 0'
                            })}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Description sx={{ color: 'secondary.main' }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Doc. Descarte
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500} color="secondary.dark">
                                            {claim.discard_doc}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    )}

                    {/* Motivo de rechazo */}
                    {claim.reject_reason && (
                        <Grid item xs={12} md={6} lg={4}>
                            <Box sx={{ 
                                p: 2,
                                height: '100%', 
                                borderLeft: `3px solid ${alpha('#F44336', 0.6)}`,
                                bgcolor: alpha('#F44336', 0.04),
                                borderRadius: '0 8px 8px 0'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <ErrorOutlined sx={{ color: alpha('#F44336', 0.7) }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Motivo de rechazo
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500} color="error.dark">
                                            {claim.reject_reason}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    )}

                    {/* Observaciones de aprobación */}
                    {claim.approve_observations && (
                        <Grid item xs={12} md={6} lg={4}>
                            <Box sx={{ 
                                p: 2, 
                                borderLeft: `3px solid ${alpha('#4CAF50', 0.6)}`,
                                bgcolor: alpha('#4CAF50', 0.04),
                                borderRadius: '0 8px 8px 0'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <CheckCircleOutlined sx={{ 
                                        color: alpha('#4CAF50', 0.7),
                                        mt: 0.5 
                                    }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Observaciones de aprobación
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: '#1B5E20', 
                                                whiteSpace: 'pre-line',
                                                mt: 0.5
                                            }}
                                        >
                                            {claim.approve_observations}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    )}
                </Grid>

            </CardContent>
        </StyledCard>
    );
};

export default ClaimCard;