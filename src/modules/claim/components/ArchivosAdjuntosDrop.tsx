import { Box, IconButton, styled, Tooltip, tooltipClasses, TooltipProps, Typography } from "@mui/material";
import { ExistingDocPreview } from "../../tracker/components/ExistingDocPreview";
import PlaceholderDocPreview from "../../ui/components/PlaceholderDocPreview";
import { ImagePreviewDropzone } from "../../ui/components/ImagePreviewDropzone";
import { Claim } from "../../../store/claim/claimApi";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormDataAcceptClaim } from "./AcceptClaimModal";

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
  }));

interface ArchivosAdjuntosProps {
  label: string;
  claim?: Claim;
  setValue: UseFormSetValue<FormDataAcceptClaim>;
  watch: UseFormWatch<FormDataAcceptClaim>;
  fieldName: "observationsFile" | "creditMemoFile" | "claimFile";
  accept: {[key: string]: readonly string[]};
  tooltipTitle?: string;
  dropZoneLabel?: string;
  placeHolderText?: string;
}

export function ArchivosAdjuntos({ accept, fieldName, label, claim, setValue, watch, tooltipTitle, placeHolderText, dropZoneLabel }: ArchivosAdjuntosProps) {
    const getFileProp = () => {
      if (!claim) return null;
      if (fieldName === "claimFile") return claim?.claim_file;
      if (fieldName === "creditMemoFile") return claim?.credit_memo_file;
      if (fieldName === "observationsFile") return claim?.observations_file;
    }
    const fileProp = getFileProp();
    return (
      <Box
          sx={{
              minHeight: 220,
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
                  <HtmlTooltip title={tooltipTitle}>
                      <IconButton size="small" color="primary">
                          <Typography variant="body1">?</Typography>
                      </IconButton>
                  </HtmlTooltip>
              </Typography>
  
              {fileProp ? (
                  <ExistingDocPreview
                      name={fileProp?.name}
                      url={fileProp?.access_url}
                      extension={fileProp?.extension}
                      onRemove={() => setValue(fieldName, null)}
                      boxWidth={140}
                      boxHeight={150}
                  />
              ) : (
                  <PlaceholderDocPreview
                      boxWidth={140}
                      boxHeight={150}
                      text={placeHolderText || "Sin archivo adjunto"}
                  />
              )}
          </Box>
  
          {/* Dropzone abajo */}
          <Box sx={{ mt: 1 }}>
              <ImagePreviewDropzone
                  files={watch(fieldName) ? [watch(fieldName)!] : []}
                  onFilesChange={(files) => setValue(fieldName, files[0] || null)}
                  label={dropZoneLabel || "Subir archivo adjunto"}
                  accept={accept}
                  maxFiles={1}
                  sxDrop={{ height: 80 }}
              />
          </Box>
      </Box>
    );
  }