import { DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

function BootstrapDialogTitleGray(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle
      sx={{
        m: 0,
        p: 0.5,
        backgroundColor: "#1c2536",
        color: "#fff",
      }}
      {...other}
    >
      <div
        style={{
          paddingLeft: "10px",
        }}
      >
        {children}
      </div>

      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 0,
            top: 2,
            color: "#fff",
          }}
        >
          <CloseIcon fontSize="small" sx={{ color: "#fff" }} />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

export default BootstrapDialogTitleGray;
