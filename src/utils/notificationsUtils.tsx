// notificationsUtils.ts
import ModeOfTravelTwoToneIcon from '@mui/icons-material/ModeOfTravelTwoTone';
import BookmarkAddedOutlinedIcon from '@mui/icons-material/BookmarkAddedOutlined';
import DoDisturbAltOutlinedIcon from '@mui/icons-material/DoDisturbAltOutlined';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import TodayTwoToneIcon from '@mui/icons-material/TodayTwoTone';
import ConfirmationNumberTwoToneIcon from '@mui/icons-material/ConfirmationNumberTwoTone';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import HourglassBottomTwoToneIcon from '@mui/icons-material/HourglassBottomTwoTone';
import WarningAmberTwoToneIcon from '@mui/icons-material/WarningAmberTwoTone';

export enum tipos {
    new_notification = 'new_notification',
    data_notification = 'data_notification',
    notificacion_leida = 'notificacion_leida',
    notificaciones_leidas = 'notificaciones_leidas',
}

export const iconsActionsNotifi: { [key: string]: { [key: string]: JSX.Element } } = {
    'DOCUMENTOS': {
        'UBICACION': <ModeOfTravelTwoToneIcon style={{ fontSize: '1.5rem' }} color="primary" />,
        'CONFIRMACION': <BookmarkAddedOutlinedIcon style={{ fontSize: '1.5rem' }}  color="primary" />,
        'RECHAZO': <DoDisturbAltOutlinedIcon style={{ fontSize: '1.5rem' }} color="primary" />,
        'ALERTA': <TodayTwoToneIcon style={{ fontSize: '1.5rem' }} color="primary" />,
        'RECORDATORIO': <DescriptionTwoToneIcon style={{ fontSize: '1.5rem' }}color="primary"  />,
    },
    'TOKENS': {
        'APROVAL': <HourglassBottomTwoToneIcon style={{ fontSize: '1.5rem' }} color="warning" />,
        'APROBACION': <HourglassBottomTwoToneIcon style={{ fontSize: '1.5rem' }} color="warning" />,
        'CONFIRMACION': <CheckCircleTwoToneIcon style={{ fontSize: '1.5rem' }} color="success" />,
        'REJECTION': <CancelTwoToneIcon style={{ fontSize: '1.5rem' }} color="error" />,
        'RECHAZO': <CancelTwoToneIcon style={{ fontSize: '1.5rem' }} color="error" />,
        'WARNING': <WarningAmberTwoToneIcon style={{ fontSize: '1.5rem' }} color="warning" />,
        'ADVERTENCIA': <WarningAmberTwoToneIcon style={{ fontSize: '1.5rem' }} color="warning" />,
        'DEFAULT': <ConfirmationNumberTwoToneIcon style={{ fontSize: '1.5rem' }} color="primary" />,
    }
}

export const playSound = () => {
    const audio = new Audio('/public/alert.wav');
    audio.play();
};
