import { Controller, Control, Path } from "react-hook-form";
import { useState } from 'react';
import { Autocomplete, TextField } from "@mui/material";

import type { FieldValues } from "react-hook-form";
import { Transporter, TransporterQuerySearch } from '../../../interfaces/maintenance';
import { useGetTransporterQuery } from "../../../store/maintenance/maintenanceApi";

interface TransporterSelectProps<
    TField extends FieldValues
    
    > {
  control: Control<TField>;
  name: Path<TField>;
  placeholder?: string;
  //options?: o[];
  disabled?: boolean;
  onChange?: (value: Transporter | null) => void;
  transporterId?: number;
}

export const TransporterSelect = <
TField extends FieldValues
>(
props: TransporterSelectProps<TField>
) => {
  const [query, setQuery] = useState<TransporterQuerySearch>({
    limit: 10,
    offset: 0,
    search: "",
    id: props.transporterId
  });
  
  const {
    data: categorias,
    refetch,
    isFetching,
    isLoading
  } = useGetTransporterQuery(query);

  // useEffect(() => {
  //   refetch();
  // }, [query, refetch]);

  const handleInputChange = (newInputValue: string) => {
    if (newInputValue.length > 2) {
      setQuery({
        ...query,
        search: newInputValue
      });
      refetch();
    }
  };

  return (
    <Controller
    name={props.name}
    control={props.control}
    rules={{
      required: "Este campo es requerido"
    }}
    render={({ field, fieldState: { error } }) => {
        const { value } = field;
        const { onChange } = field as (typeof field) & { onChange: (value: number | null) => void };
        return (<>
          <Autocomplete
            value={value ? categorias?.results?.find((option : Transporter) => value === option.id) ?? null : null}
            getOptionLabel={(option) => option.code}
            disabled={props.disabled}
            onChange={(_, newValue) => {
              if (newValue === null){
                setQuery({
                  ...query,
                  id: undefined, 
                  search: ""
                })
              }
              const resolvedId = newValue ? newValue.id : null;
              onChange(resolvedId);
              props.onChange?.(newValue);
            }}
            onInputChange={(_, newInputValue) => handleInputChange(newInputValue)}
            loading={isLoading || isFetching}
            id="autocomplete-categoria"
            size="small"
            options={categorias?.results ?? []}
            clearText="Limpiar"
            loadingText="Cargando..."
            noOptionsText="No hay resultados"
            renderInput={
              (params) => (
                <TextField
                  {...params}
                  label="Transporter"
                  variant="outlined"
                  placeholder={props.placeholder}
                  error={!!error}
                  helperText={error ? error.message : null}
                />
              ) }
          />
        </>
      )}}
    />
  );
};
