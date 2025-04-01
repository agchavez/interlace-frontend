// ClaimTabs.tsx
import React from "react";
import { Tabs, Tab, Box } from "@mui/material";

export interface ClaimTabsProps {
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const ClaimTabs: React.FC<ClaimTabsProps> = ({ value, onChange }) => {
    return (
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={value} onChange={onChange} aria-label="Tabs de Reclamo">
                <Tab label="Documentación" id="claim-tab-0" aria-controls="claim-tabpanel-0" />
                <Tab label="Productos" id="claim-tab-1" aria-controls="claim-tabpanel-1" />
            </Tabs>
        </Box>
    );
};

export default ClaimTabs;
