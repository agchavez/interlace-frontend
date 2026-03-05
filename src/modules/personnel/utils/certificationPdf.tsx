/**
 * PDF individual de certificación (frontend).
 * El export masivo/listado se genera en el backend.
 */
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import type { Certification } from '../../../interfaces/personnel';

// Deshabilitar la separación de palabras (evita "CERTIFI-\nCACIÓN")
Font.registerHyphenationCallback(word => [word]);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function qrToDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { width: 128, margin: 1, color: { dark: '#1a1a2e', light: '#ffffff' } });
}

/** Descarga una imagen como base64 (para embed en react-pdf). */
async function imageToDataUrl(url: string, token?: string): Promise<string | null> {
  try {
    const headers: Record<string, string> = {};
    // Las URLs de Azure Blob Storage ya incluyen autenticación SAS en los parámetros de la URL.
    // Enviar Authorization header causa un preflight CORS innecesario y puede fallar.
    const isExternalStorage = url.includes('blob.core.windows.net');
    if (token && !isExternalStorage) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('read error'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function fmtDate(d?: string | null): string {
  if (!d) return '—';
  try {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const dt = new Date(d);
    return `${String(dt.getUTCDate()).padStart(2, '0')} ${months[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
  } catch {
    return d;
  }
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ── Constantes ────────────────────────────────────────────────────────────────

const BRAND_RED  = '#1976d2';
const BRAND_DARK = '#1a1a2e';
const BRAND_LIGHT = '#E3F2FD';
const TEXT_MUTED = '#757575';

const STATUS_LABELS: Record<string, string> = {
  PENDING:       'Pendiente',
  IN_PROGRESS:   'En Progreso',
  COMPLETED:     'Completado',
  NOT_COMPLETED: 'No Completó',
};

function statusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':     return '#2e7d32';
    case 'IN_PROGRESS':   return '#1565c0';
    case 'NOT_COMPLETED': return '#c62828';
    default:              return '#757575';
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: '#ffffff', padding: 0 },
  topStripe: { backgroundColor: BRAND_RED, height: 7 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 36, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  logoImg: { objectFit: 'contain', width: 90, height: 34 },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  headerTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: BRAND_DARK, textAlign: 'center' },
  headerSubtitle: { fontSize: 8, color: TEXT_MUTED, textAlign: 'center', marginTop: 2 },
  // QR con logo en el centro
  qrWrap: { width: 72, height: 72 },
  qrImg: { width: 72, height: 72 },
  qrLogo: { position: 'absolute', width: 18, height: 18, top: 27, left: 27, objectFit: 'contain' },
  // Body
  body: { paddingHorizontal: 36, paddingTop: 18, paddingBottom: 16 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 14 },
  statusText: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  sectionTitle: {
    fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: BRAND_RED,
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 5, borderBottomWidth: 1, borderBottomColor: BRAND_RED, paddingBottom: 2,
  },
  row: { flexDirection: 'row', marginBottom: 8, gap: 10 },
  field: { flex: 1, backgroundColor: '#fafafa', borderRadius: 3, padding: 7, borderLeftWidth: 3, borderLeftColor: BRAND_RED },
  fieldLabel: { fontSize: 7, color: TEXT_MUTED, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  fieldValue: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: BRAND_DARK },
  // Firma
  sigSection: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  sigContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 20 },
  sigBox: { flex: 1, alignItems: 'center' },
  sigImg: { height: 54, maxWidth: 200, objectFit: 'contain', marginBottom: 3 },
  sigLine: { borderTopWidth: 1, borderTopColor: BRAND_DARK, width: '100%', marginBottom: 3 },
  sigName: { fontSize: 8.5, color: BRAND_DARK, textAlign: 'center' },
  sigLabel: { fontSize: 7, color: TEXT_MUTED, textAlign: 'center' },
  // Footer
  footer: {
    backgroundColor: BRAND_LIGHT, paddingHorizontal: 36, paddingVertical: 7,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto',
  },
  footerText: { fontSize: 7, color: TEXT_MUTED },
  bottomStripe: { backgroundColor: BRAND_RED, height: 5 },
});

// ── Componente de página ───────────────────────────────────────────────────────

interface CertPageProps {
  cert: Certification;
  qrDataUrl: string;
  signatureDataUrl: string | null;
  logoDataUrl: string | null;
}

const CertPage: React.FC<CertPageProps> = ({ cert, qrDataUrl, signatureDataUrl, logoDataUrl }) => (
  <Page size="A4" style={S.page}>
    <View style={S.topStripe} />

    {/* Header */}
    <View style={S.header}>
      {logoDataUrl
        ? <Image style={S.logoImg} src={logoDataUrl} />
        : <View style={{ width: 90, height: 34 }} />
      }
      <View style={S.headerCenter}>
        <Text style={S.headerTitle}>Constancia de Capacitación y Certificación</Text>
        <Text style={S.headerSubtitle}>Sistema de Gestión de Personal</Text>
      </View>
      {/* QR con logo superpuesto en el centro */}
      <View style={S.qrWrap}>
        <Image style={S.qrImg} src={qrDataUrl} />
        {logoDataUrl && <Image style={S.qrLogo} src={logoDataUrl} />}
      </View>
    </View>

    {/* Body */}
    <View style={S.body}>
      <View style={[S.statusBadge, { backgroundColor: statusColor(cert.status) }]}>
        <Text style={S.statusText}>{STATUS_LABELS[cert.status] ?? cert.status}</Text>
      </View>

      <Text style={S.sectionTitle}>Participante</Text>
      <View style={S.row}>
        <View style={S.field}>
          <Text style={S.fieldLabel}>Nombre</Text>
          <Text style={S.fieldValue}>{cert.personnel_name || '—'}</Text>
        </View>
        <View style={[S.field, { flex: 0.4 }]}>
          <Text style={S.fieldLabel}>Código</Text>
          <Text style={S.fieldValue}>{cert.personnel_code || '—'}</Text>
        </View>
      </View>

      <Text style={[S.sectionTitle, { marginTop: 8 }]}>Certificación / Entrenamiento</Text>
      <View style={S.row}>
        <View style={S.field}>
          <Text style={S.fieldLabel}>Tipo de Certificación</Text>
          <Text style={S.fieldValue}>{cert.certification_type_name || '—'}</Text>
        </View>
        {cert.certification_number ? (
          <View style={[S.field, { flex: 0.45 }]}>
            <Text style={S.fieldLabel}>N° Certificación</Text>
            <Text style={S.fieldValue}>{cert.certification_number}</Text>
          </View>
        ) : null}
      </View>
      <View style={S.row}>
        <View style={S.field}>
          <Text style={S.fieldLabel}>Instructor / Autoridad</Text>
          <Text style={S.fieldValue}>{cert.issuing_authority || '—'}</Text>
        </View>
      </View>
      <View style={S.row}>
        <View style={S.field}>
          <Text style={S.fieldLabel}>Fecha Inicio / Emisión</Text>
          <Text style={S.fieldValue}>{fmtDate(cert.issue_date)}</Text>
        </View>
        <View style={S.field}>
          <Text style={S.fieldLabel}>Fecha Vencimiento</Text>
          <Text style={S.fieldValue}>{fmtDate(cert.expiration_date)}</Text>
        </View>
        <View style={[S.field, { flex: 0.35 }]}>
          <Text style={S.fieldLabel}>Válido</Text>
          <Text style={S.fieldValue}>{cert.is_valid ? 'Sí' : 'No'}</Text>
        </View>
      </View>

      {cert.notes ? (
        <View style={S.row}>
          <View style={[S.field, { borderLeftColor: '#9e9e9e' }]}>
            <Text style={S.fieldLabel}>Notas</Text>
            <Text style={{ fontSize: 8.5, color: BRAND_DARK }}>{cert.notes}</Text>
          </View>
        </View>
      ) : null}

      {/* Firma — solo si está COMPLETADO */}
      {cert.status === 'COMPLETED' && (
        <View style={S.sigSection}>
          <Text style={[S.sectionTitle, { marginBottom: 8 }]}>Firma del Participante</Text>
          <View style={S.sigContainer}>
            <View style={S.sigBox}>
              {signatureDataUrl
                ? <Image style={S.sigImg} src={signatureDataUrl} />
                : <View style={{ height: 54 }} />
              }
              <View style={S.sigLine} />
              <Text style={S.sigName}>{cert.personnel_name}</Text>
              <Text style={S.sigLabel}>Firma del Participante</Text>
            </View>
            {cert.completed_at && (
              <View style={[S.field, { flex: 0, minWidth: 130 }]}>
                <Text style={S.fieldLabel}>Fecha de Completado</Text>
                <Text style={S.fieldValue}>{fmtDate(cert.completed_at)}</Text>
                {cert.completed_by_name && (
                  <>
                    <Text style={[S.fieldLabel, { marginTop: 5 }]}>Registrado por</Text>
                    <Text style={[S.fieldValue, { fontSize: 8 }]}>{cert.completed_by_name}</Text>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      )}
    </View>

    {/* Footer */}
    <View style={S.footer}>
      <Text style={S.footerText}>ID: {cert.id}</Text>
      <Text style={S.footerText}>Generado: {fmtDate(new Date().toISOString())}</Text>
    </View>
    <View style={S.bottomStripe} />
  </Page>
);

// ── Documento exportado ───────────────────────────────────────────────────────

export const CertificatePdfDocument: React.FC<{
  cert: Certification;
  qrDataUrl: string;
  signatureDataUrl: string | null;
  logoDataUrl: string | null;
}> = ({ cert, qrDataUrl, signatureDataUrl, logoDataUrl }) => (
  <Document title={`Certificación - ${cert.personnel_name}`} author="Sistema de Gestión de Personal">
    <CertPage cert={cert} qrDataUrl={qrDataUrl} signatureDataUrl={signatureDataUrl} logoDataUrl={logoDataUrl} />
  </Document>
);

// ── Helper de descarga ────────────────────────────────────────────────────────

/**
 * Genera y descarga el PDF de una certificación individual.
 * Prefetcha la firma (con token si es necesario) y el logo para el QR.
 */
export async function downloadCertificatePdf(cert: Certification, token?: string): Promise<void> {
  const baseUrl = import.meta.env.VITE_JS_FRONTEND_URL || window.location.origin;
  const detailUrl = `${baseUrl}/personnel/certifications/${cert.id}`;

  const [qrDataUrl, signatureDataUrl, logoDataUrl] = await Promise.all([
    qrToDataUrl(detailUrl),
    cert.signature_url ? imageToDataUrl(cert.signature_url, token) : Promise.resolve(null),
    imageToDataUrl(`${window.location.origin}/logo-qr.png`),
  ]);

  const blob = await pdf(
    <CertificatePdfDocument
      cert={cert}
      qrDataUrl={qrDataUrl}
      signatureDataUrl={signatureDataUrl}
      logoDataUrl={logoDataUrl}
    />
  ).toBlob();

  triggerDownload(blob, `certificacion-${cert.personnel_code || cert.id}-${cert.id}.pdf`);
}
