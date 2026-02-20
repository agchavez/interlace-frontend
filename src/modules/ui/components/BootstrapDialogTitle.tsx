import { DialogTitle, IconButton, Divider } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <>
      <DialogTitle
        sx={{
          m: 0,
          px: 2,
          py: 1,
          position: 'relative',
          backgroundColor: '#f8fafc',
          color: '#0f172a',
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: '0.9375rem',
          pr: onClose ? 5 : 2,
          '& .MuiTypography-root': { color: '#0f172a' },
        }}
        {...other}
      >
        {children}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'text.secondary',
              '&:hover': { color: 'text.primary', backgroundColor: 'rgba(0,0,0,0.05)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : null}
      </DialogTitle>
      <Divider />
    </>
  );
}

export default BootstrapDialogTitle;
