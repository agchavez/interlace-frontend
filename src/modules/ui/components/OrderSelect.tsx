import { Controller, Control, Path } from "react-hook-form";
import { useEffect, useState } from 'react';
import { Autocomplete, TextField } from "@mui/material";

import type { FieldValues } from "react-hook-form";
import { LocationTypeQuerySearch, LocationType } from '../../../interfaces/maintenance';
import { useGetLocationsQuery } from "../../../store/maintenance/maintenanceApi";

interface OrderSelectProps<
    TField extends FieldValues
    
    > {
  control: Control<TField>;
  name: Path<TField>;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: LocationType | null) => void;
  orderId?: number;
  label?: string;
}

export const OrderSelect = <
TField extends FieldValues
>(
props: OrderSelectProps<TField>
) => {

  // Nose pueden seleccionar pedidos que no esten en estado "COMPLETADOS  "
  const [query, setQuery] = useState<LocationTypeQuerySearch>({
    limit: 10,
    offset: 0,
    search: "",
    id: props.orderId
  });
  
  const {
    data: categorias,
    refetch,
    isFetching,
    isLoading
  } = useGetLocationsQuery(query);
  
  const handleInputChange = (newInputValue: string) => {
      const splitted = newInputValue.split(" - ");
      if (splitted.length > 1){

        setQuery({
          ...query,
          search: splitted[1],
        });
      } else {
        setQuery({
          ...query,
          search: newInputValue,
        });
      }
  };

  useEffect(() => {
    if (query.search){
      refetch();
    }
  }, [query, refetch]);

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
            value={value ? categorias?.results?.find((option : LocationType) => value === option.id) ?? null : null}
            getOptionLabel={(option) => "ORD - " + option.code}
            isOptionEqualToValue={(option, value) => option.id === value.id}
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
                  label={props.label ?? "Pedido"}
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
