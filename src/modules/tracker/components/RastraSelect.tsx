import { Controller, Control, Path } from "react-hook-form";
import { Autocomplete, TextField } from "@mui/material";

import type { FieldValues } from "react-hook-form";
import { Rastra } from "../../../interfaces/tracking";

// Solo nos interesa el campo categoriaId los demas no son necesarios para este componente
interface CategoriaSelectProps<
    TField extends FieldValues
    
    > {
  control: Control<TField>;
  name: Path<TField>;
  placeholder?: string;
  //options?: o[];
  onChange?: (value: number | null) => void;
  rastras:Rastra[]
}

export const RastraSelect = <
    TField extends FieldValues
    >(
    props: CategoriaSelectProps<TField>
) => {

  const handleInputChange = (newInputValue: string) => {
    return newInputValue
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
            value={value ? props.rastras?.find((option : Rastra) => value === option.id) ?? null : null}
            getOptionLabel={(option) => option.placa}
            onChange={(_, newValue) => {
              const resolvedId = newValue ? newValue.id : null;
              onChange(resolvedId);
              props.onChange?.(resolvedId);
            }}
            onInputChange={(_, newInputValue) => handleInputChange(newInputValue)}
            id="autocomplete-categoria"
            size="small"
            options={props.rastras ?? []}
            clearText="Limpiar"
            loadingText="Cargando..."
            noOptionsText="No hay resultados"
            renderInput={
              (params) => (
                <TextField
                  {...params}
                  label="Rastra"
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
