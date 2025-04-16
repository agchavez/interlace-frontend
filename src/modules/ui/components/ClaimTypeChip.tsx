// Import the hook at the top of your file
import { Chip, styled, useTheme } from "@mui/material";
import { useClaimType } from "../../../hooks/useClaimType";

// Update the ClaimTypeChip styled component
const ClaimTypeChip = styled(Chip)(({ claimType, color }: { theme: any, claimType: string | number, color?: string }) => {
    // If a specific color is provided, use it
    if (color) {
        return {
            backgroundColor: color,
            color: "white",
            height: 28
        };
    }

    // Otherwise, use the legacy mapping for backward compatibility
    const colorMap: Record<string, string> = {
        "FALTANTE": "#E57373",
        "SOBRANTE": "#81C784",
        "DAÑOS_CALIDAD_TRANSPORTE": "#64B5F6"
    };

    return {
        backgroundColor: typeof claimType === 'string' ? (colorMap[claimType] || "#9E9E9E") : "#9E9E9E",
        color: "white",
        height: 28
    };
});

// Create a new wrapper component that will handle the fetching
interface ClaimTypeChipWrapperProps {
    claimTypeId: number | string;
    size?: "small" | "medium";
}

export const ClaimTypeChipWrapper: React.FC<ClaimTypeChipWrapperProps> = ({ claimTypeId, size }) => {
    // Use our custom hook to fetch the claim type name
    const { name, isLoading } = useClaimType(claimTypeId);
    const theme = useTheme();

    // Determine color based on type of ID
    let color = "#9E9E9E"; // Default gray color
    
    // For backward compatibility with string claim types
    if (typeof claimTypeId === 'string') {
        const colorMap: Record<string, string> = {
            "FALTANTE": "#E57373",
            "SOBRANTE": "#81C784",
            "DAÑOS_CALIDAD_TRANSPORTE": "#64B5F6"
        };
        color = colorMap[claimTypeId] || "#9E9E9E";
    } else {
        // For newer numeric IDs, you could define a color mapping or use a default color
        // For now, using a blue color for all numeric IDs
        color = "#64B5F6";
    }

    if (isLoading) {
        return <Chip label="Cargando..." size={size} />;
    }

    return (
        <ClaimTypeChip
            theme={theme}
            claimType={claimTypeId}
            sx={{ bgcolor: color }}
            label={name}
            size={size}
        />
    );
};