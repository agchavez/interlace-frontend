// PhotosEditor.tsx
import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { ImagePreviewDropzone } from "../../ui/components/ImagePreviewDropzone";
import { EditFormData } from "./ClaimEditDocumentation";
import { ExistingDocPreview } from "./ExistingDocPreview";
import PlaceholderDocPreview from "../../ui/components/PlaceholderDocPreview";

interface PhotosEditorProps {
  categoryKey: string;
  label: string;
  existingDocs: Array<{
    id: number;
    name: string;
    access_url: string;
    extension: string | null;
  }>;
  watch: UseFormWatch<EditFormData>;
  setValue: UseFormSetValue<EditFormData>;
  gridProps?: any;
  disableDropzone?: boolean; // Prop para deshabilitar el dropzone
}

export const PhotosEditor: React.FC<PhotosEditorProps> = ({
  categoryKey,
  label,
  existingDocs,
  watch,
  setValue,
  gridProps,
  disableDropzone
}) => {
  const addField = `${categoryKey}_add` as keyof EditFormData;
  const removeField = `${categoryKey}_remove` as keyof EditFormData;
  const addedFiles = watch(addField) as File[] | undefined;

  const handleRemoveExistingDoc = (docId: number) => {
    const currentRemove = (watch(removeField) as number[]) || [];
    if (!currentRemove.includes(docId)) {
      setValue(removeField, [...currentRemove, docId]);
    }else{
      // eliminar el id del array
      const newRemove = currentRemove.filter((id) => id !== docId);
      setValue(removeField, newRemove);
    }
  };

  return (
    <Grid item {...(gridProps || { xs: 12 })}>
      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <Box>
          {/* Documentos existentes */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 0 }}>
            {existingDocs.length === 0 ? (
              <PlaceholderDocPreview boxWidth={150} boxHeight={180} />
            ) : (
              existingDocs.map((doc) => (
                <ExistingDocPreview
                  key={doc.id}
                  name={doc.name}
                  url={doc.access_url}
                  extension={doc.extension}
                  onRemove={!disableDropzone ? () => handleRemoveExistingDoc(doc.id) : undefined}
                  boxWidth={150}
                  boxHeight={180}
                  showDownload={true} // Muestra botón "Ver"
                />
              ))
            )}
          </Box>
        </Box>

        {/* Dropzone abajo */}
        {!disableDropzone && <Box>
          <Typography variant="body2" sx={{ mb: 1, mt: 2 }}>
            Agregar archivos
          </Typography>
          <ImagePreviewDropzone
            files={addedFiles || []}
            onFilesChange={(files) => setValue(addField, files)}
            label=""
            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
            maxFiles={5}
            sxDrop={{ height: 100 }}
          />
        </Box>}
      </Box>
    </Grid>
  );
};
