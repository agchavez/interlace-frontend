import { Controller, Control, Path } from "react-hook-form";
import { useEffect, useState } from 'react';
import { Autocomplete, TextField } from "@mui/material";

import type { FieldValues } from "react-hook-form";
import { useGetOrderQuery } from "../../../store/order";
import { Order } from "../../../interfaces/orders";
import { OrderQueryParams } from '../../../interfaces/tracking';

interface OrderSelectProps<
    TField extends FieldValues
    
    > {
  control: Control<TField>;
  name: Path<TField>;
  placeholder?: string;
  disabled?: boolean;
  ignoreCompleted: boolean;
  onChange?: (value: Order | null) => void;
  orderId?: number;
  label?: string;
}

export const OrderSelect = <
TField extends FieldValues
>(
props: OrderSelectProps<TField>
) => {

  // Nose pueden seleccionar pedidos que no esten en estado "COMPLETADOS  "
  const [query, setQuery] = useState<OrderQueryParams>({
    limit: 10,
    offset: 0,
    search: "",
    id: props.orderId,
    status_choice: props.ignoreCompleted ? ["IN_PROCESS", "PENDING"] : undefined,
  });
  
  const {
    data: categorias,
    refetch,
    isFetching,
    isLoading
  } = useGetOrderQuery(query);
  
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
            value={value ? categorias?.results?.find((option : Order) => value === option.id) ?? null : null}
            getOptionLabel={(option) => "ORD - " + option.id}
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
