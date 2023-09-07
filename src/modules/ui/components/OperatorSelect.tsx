import { Controller, Control, Path } from "react-hook-form";
import { useState, useEffect } from 'react';
import { Autocomplete, TextField } from "@mui/material";

import type { FieldValues } from "react-hook-form";
import { OperatorQuerySearch, Operator } from '../../../interfaces/maintenance';
import { useGetOperatorByDistributionCenterQuery } from "../../../store/maintenance/maintenanceApi";

interface OperatorSelectProps<
  TField extends FieldValues

> {
  control: Control<TField>;
  name: Path<TField>;
  placeholder?: string;
  //options?: o[];
  invalidId?: number;
  distributionCenterId: number;
  disabled?: boolean;
  onChange?: (value: Operator | null) => void;
  operatorId?: number;
  label?: string;
}

export const OperatorSelect = <
  TField extends FieldValues
>(
  {
    label = "Operador",
    ...props
  }: OperatorSelectProps<TField>
) => {
  const [query, setQuery] = useState<OperatorQuerySearch>({
    limit: 10,
    offset: 0,
    search: "",
    id: props.operatorId,
    distributorCenter: props.distributionCenterId
  });

  const {
    data: categorias,
    refetch,
    isFetching,
    isLoading
  } = useGetOperatorByDistributionCenterQuery(query);

  useEffect(() => {
    refetch();
  }, [query, refetch]);

  const handleInputChange = (newInputValue: string) => {
    if (newInputValue.length > 2) {
      setQuery({
        ...query,
        search: newInputValue
      });
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
            value={value ? categorias?.results?.find((option: Operator) => value === option.id) ?? null : null}
            getOptionDisabled={(option) => option.id === props.invalidId}
            getOptionLabel={(option) => option.first_name + " " + option.last_name}
            disabled={props.disabled}
            onChange={(_, newValue) => {
              if (newValue === null) {
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
                  label={label}
                  variant="outlined"
                  placeholder={props.placeholder}
                  error={!!error}
                  helperText={error ? error.message : null}
                />
              )}
          />
        </>
        )
      }}
    />
  );
};
