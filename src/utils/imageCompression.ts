import imageCompression from 'browser-image-compression';

/**
 * Configuración optimizada para compresión de imágenes en centros de distribución
 * con conexiones limitadas.
 *
 * IMPORTANTE: El backend NO volverá a comprimir estas imágenes para evitar
 * doble compresión y pérdida de calidad.
 */
export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,              // Máximo 800KB por imagen (reducción significativa)
  maxWidthOrHeight: 1920,       // Mantener resolución máxima de 1920px
  useWebWorker: true,           // Usar Web Worker para no bloquear UI
  fileType: 'image/jpeg',       // Convertir a JPEG para mejor compresión
  initialQuality: 0.75,         // Calidad 75% (balance entre tamaño y calidad)
};

/**
 * Comprime una imagen manteniendo buena calidad visual
 * @param file - Archivo de imagen a comprimir
 * @returns Promise con el archivo comprimido
 */
export async function compressImage(file: File): Promise<File> {
  try {
    // Solo comprimir archivos de imagen
    if (!file.type.startsWith('image/')) {
      return file;
    }

    // Si la imagen ya es pequeña (menos de 800KB), no comprimir
    if (file.size <= 800 * 1024) {
      console.log(`Imagen ${file.name} ya es pequeña (${(file.size / 1024).toFixed(2)}KB), no se comprime`);
      return file;
    }

    console.log(`Comprimiendo ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);

    const compressedFile = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS);

    const originalSizeMB = file.size / 1024 / 1024;
    const compressedSizeMB = compressedFile.size / 1024 / 1024;
    const reduction = ((1 - compressedSizeMB / originalSizeMB) * 100).toFixed(1);

    console.log(
      `✓ ${file.name} comprimido: ${originalSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB (${reduction}% reducción)`
    );

    return compressedFile;
  } catch (error) {
    console.error('Error al comprimir imagen:', error);
    // Si falla la compresión, devolver el archivo original
    return file;
  }
}

/**
 * Comprime múltiples imágenes en paralelo
 * @param files - Array de archivos a comprimir
 * @returns Promise con array de archivos comprimidos
 */
export async function compressImages(files: File[]): Promise<File[]> {
  try {
    const compressionPromises = files.map(file => compressImage(file));
    return await Promise.all(compressionPromises);
  } catch (error) {
    console.error('Error al comprimir imágenes:', error);
    // Si falla, devolver archivos originales
    return files;
  }
}
