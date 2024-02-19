import { Box, Chip, Grid, IconButton, Typography } from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

interface ChipFilterCategoryProps {
  label: string;
  items: ChipFilterItem[];
}

interface ChipFilterItem {
  id: string;
  label: string;
  deleteAction?: (id: string) => unknown;
}

const ChipFilterCategory = ({ label, items }: ChipFilterCategoryProps) => {
  return (
    <Grid item>
      <Box sx={{ borderStyle: "dashed", borderRadius: 3, borderWidth: 1 }}>
        <Grid
          container
          alignContent="center"
          alignItems="center"
          p={0.3}
          spacing={1}
        >
          <Grid item>
            <Typography>{label}</Typography>
          </Grid>
          {items.map((item) => {
            return (
              <Grid item key={item.id}>
                <Chip
                  label={item.label}
                  onDelete={item.deleteAction}
                  variant="outlined"
                  color="secondary"
                  deleteIcon={
                    <IconButton sx={{ m: 0 }}>
                      <HighlightOffIcon />
                    </IconButton>
                  }
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Grid>
  );
};

export default ChipFilterCategory;
