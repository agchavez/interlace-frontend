import { Controller, Control, Path } from "react-hook-form";
import { useState } from 'react';
import { Autocomplete, TextField } from "@mui/material";

import type { FieldValues } from "react-hook-form";
import { ProductQuerySearch, Product } from '../../../interfaces/tracking';
import { useGetProductQuery } from "../../../store/maintenance/maintenanceApi";

interface ProductSelectProps<
    TField extends FieldValues
    
    > {
  control: Control<TField>;
  name: Path<TField>;
  placeholder?: string;
  //options?: o[];
  disabled?: boolean;
  onChange?: (value: Product | null) => void;
  ProductId?: number;
  isOutput?:boolean;
}

export const ProductSelect = <
TField extends FieldValues
>(
props: ProductSelectProps<TField>
) => {
  const [query, setQuery] = useState<ProductQuerySearch>({
    limit: 10,
    offset: 0,
    search: "",
    id: props.ProductId,
    is_output: props.isOutput,
  });
  
  const {
    data: categorias,
    refetch,
    isFetching,
    isLoading
  } = useGetProductQuery(query);

  // useEffect(() => {
  //   refetch();
  // }, [query, refetch]);

  const handleInputChange = (newInputValue: string) => {
    if (newInputValue.length > 2) {
      const splitted = newInputValue.split(" - ");
      if (splitted.length > 1){
      setQuery({
        ...query,
        search: splitted[0],
      });
      refetch();
    }
    else{
      setQuery({
        ...query,
        search: newInputValue,
      });
      refetch();
    }
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
            value={value ? categorias?.results?.find((option : Product) => value === option.id) ?? null : null}
            getOptionLabel={(option) => option.sap_code + " - " + option.name}
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
                  label="Producto"
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
