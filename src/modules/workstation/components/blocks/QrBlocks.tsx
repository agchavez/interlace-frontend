/**
 * Bloques QR_DOCUMENT y QR_EXTERNAL — QR + etiqueta.
 */
import { Box, Typography } from '@mui/material';
import { PictureAsPdf as PdfIcon, Link as LinkIcon } from '@mui/icons-material';
import QRCode from 'qrcode.react';
import BlockShell from './BlockShell';
import type {
    QrDocumentBlockConfig,
    QrExternalBlockConfig,
    Workstation,
} from '../../interfaces/workstation';

export function QrDocumentBlock({
    config, ws,
}: {
    config: QrDocumentBlockConfig;
    ws?: Workstation;
}) {
    const doc = ws?.documents.find(d => d.id === config.document_id);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = doc ? `${origin}${doc.qr_url}` : '';

    return (
        <BlockShell title={config.title || (doc ? doc.name : 'QR · Documento')}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 0.75 }}>
                {!doc ? (
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                        Elegí un documento en el editor.
                    </Typography>
                ) : (
                    <>
                        <Box sx={{ bgcolor: '#fff', p: 1, borderRadius: 1, border: '2px solid #16a34a' }}>
                            <QRCode value={url} size={120} level="M" includeMargin={false} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PdfIcon sx={{ fontSize: 14, color: '#dc2626' }} />
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#1f2937' }}>
                                {doc.doc_type}
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>
        </BlockShell>
    );
}

export function QrExternalBlock({ config }: { config: QrExternalBlockConfig }) {
    return (
        <BlockShell title={config.title || 'QR · Link externo'}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 0.75 }}>
                {!config.url ? (
                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                        Pegá una URL en el editor.
                    </Typography>
                ) : (
                    <>
                        <Box sx={{ bgcolor: '#fff', p: 1, borderRadius: 1, border: '2px solid #2563eb' }}>
                            <QRCode value={config.url} size={120} level="M" includeMargin={false} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LinkIcon sx={{ fontSize: 14, color: '#2563eb' }} />
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1f2937', textAlign: 'center', lineHeight: 1.1 }}>
                                {config.label || 'Escanear'}
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>
        </BlockShell>
    );
}
