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
}

export const PhotosEditor: React.FC<PhotosEditorProps> = ({
  categoryKey,
  label,
  existingDocs,
  watch,
  setValue,
  gridProps
}) => {
  const addField = `${categoryKey}_add` as keyof EditFormData;
  const removeField = `${categoryKey}_remove` as keyof EditFormData;
  const addedFiles = watch(addField) as File[] | undefined;

  const handleRemoveExistingDoc = (docId: number) => {
    const currentRemove = (watch(removeField) as number[]) || [];
    if (!currentRemove.includes(docId)) {
      setValue(removeField, [...currentRemove, docId]);
    }
  };

  return (
    <Grid item {...(gridProps || { xs: 12, md: 6 })}>
      <Box
        sx={{
          minHeight: 300,
          border: "1px solid #ddd",
          borderRadius: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {label}
          </Typography>

          {/* Documentos existentes */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            {existingDocs.length === 0 ? (
              <PlaceholderDocPreview boxWidth={130} boxHeight={150} />
            ) : (
              existingDocs.map((doc) => (
                <ExistingDocPreview
                  key={doc.id}
                  name={doc.name}
                  url={doc.access_url}
                  extension={doc.extension}
                  onRemove={() => handleRemoveExistingDoc(doc.id)}
                  boxWidth={130}
                  boxHeight={150}
                  showDownload={true} // Muestra botón "Ver"
                />
              ))
            )}
          </Box>
        </Box>

        {/* Dropzone abajo */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
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
        </Box>
      </Box>
    </Grid>
  );
};
