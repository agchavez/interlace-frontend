import { alpha } from '@mui/material';

interface Props {
    /** Color principal de la silueta (relleno o trazo). */
    color: string;
    /** Si es outline (slot libre) muestra contorno; si es filled (ocupado) muestra sólido. */
    variant?: 'outline' | 'filled';
    /** Opacidad adicional. */
    opacity?: number;
}

/**
 * Silueta de camión vista desde arriba: caja (semi-remolque) al frente,
 * cabina atrás. Diseñado para llenar verticalmente un slot de parqueo con
 * la cabina hacia abajo (el camión retrocede al muelle que está arriba).
 */
export default function TruckSilhouette({ color, variant = 'filled', opacity = 1 }: Props) {
    const stroke = color;
    const fill = variant === 'filled' ? color : 'transparent';
    const lightFill = variant === 'filled' ? alpha(color, 0.25) : 'transparent';

    return (
        <svg
            viewBox="0 0 100 240"
            preserveAspectRatio="xMidYMid meet"
            width="72%"
            height="92%"
            style={{ opacity, display: 'block' }}
        >
            {/* Caja / semi-remolque (arriba, toca el muelle) */}
            <rect
                x="12"
                y="10"
                width="76"
                height="150"
                rx="4"
                fill={fill}
                stroke={stroke}
                strokeWidth="2.5"
            />
            {/* Líneas de la caja (paneles) */}
            <line x1="12" y1="55" x2="88" y2="55" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.5" />
            <line x1="12" y1="110" x2="88" y2="110" stroke={stroke} strokeWidth="1.2" strokeOpacity="0.5" />

            {/* Conexión cabina-caja (tongue) */}
            <rect x="44" y="160" width="12" height="14" fill={fill} stroke={stroke} strokeWidth="2" />

            {/* Cabina (abajo, hacia el carril) */}
            <rect
                x="18"
                y="174"
                width="64"
                height="58"
                rx="6"
                fill={fill}
                stroke={stroke}
                strokeWidth="2.5"
            />
            {/* Parabrisas */}
            <rect
                x="24"
                y="210"
                width="52"
                height="16"
                rx="2"
                fill={variant === 'filled' ? alpha('#ffffff', 0.55) : lightFill}
                stroke={stroke}
                strokeWidth="1.2"
            />
            {/* Faros */}
            <circle cx="28" cy="228" r="2" fill={variant === 'filled' ? '#ffffff' : stroke} />
            <circle cx="72" cy="228" r="2" fill={variant === 'filled' ? '#ffffff' : stroke} />
        </svg>
    );
}
