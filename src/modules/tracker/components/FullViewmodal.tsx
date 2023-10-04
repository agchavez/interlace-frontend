import * as React from "react";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { Box } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface FullScreenDialogProps {
  open: boolean;
  handleClose?: () => void;
  children?: React.ReactNode;
}

export default function FullViewDialog({
  open = false,
  handleClose,
  children,
}: FullScreenDialogProps) {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <Box
        sx={{
          position: "fixed",
          display: "flex",
          right: 10,
          width: "auto",
          color: "primary.main",
        }}
      >
        <IconButton color="inherit" onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>
      {children}
    </Dialog>
  );
}
