import { Controller, Control, Path } from "react-hook-form";
import { useEffect, useState } from 'react';
import { Autocomplete, TextField, createFilterOptions } from "@mui/material";

import type { FieldValues } from "react-hook-form";
import { TrailerQuerySearch, Trailer } from '../../../interfaces/maintenance';
import { useGetTrailerQuery, useRegisterTrailerMutation } from "../../../store/maintenance/maintenanceApi";
import { toast } from "sonner";


const filter = createFilterOptions<Trailer>();

interface TrailerSelectProps<
    TField extends FieldValues
    
    > {
  control: Control<TField>;
  name: Path<TField>;
  placeholder?: string;
  //options?: o[];
  registered?: boolean;
  disabled?: boolean;
  onChange?: (value: Trailer | null) => void;
  trailerId?: number;
}

export const TrailerSelect = <
TField extends FieldValues
>(
props: TrailerSelectProps<TField>
) => {
  const [query, setQuery] = useState<TrailerQuerySearch>({
    limit: 10,
    offset: 0,
    search: "",
    id: props.trailerId
  });
  
  const {
    data: categorias,
    refetch,
    isFetching,
    isLoading
  } = useGetTrailerQuery(query);

  const [
    registerTrailer, { isLoading: isRegistering, isSuccess: isRegisteringSuccess , data: registerTrailerData, reset: resetRegisterTrailer }
  ] = useRegisterTrailerMutation();

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

  useEffect(() => {
    if (isRegisteringSuccess && registerTrailerData){
      toast.success(registerTrailerData.code, {
        description: "Trailer registrado con exito"
      });
      props.onChange?.(registerTrailerData);
      resetRegisterTrailer();
      setQuery({
        ...query,
        id: registerTrailerData.id, 
        search: ""
      })

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegisteringSuccess, registerTrailerData, query]);

  const handleRegister = (newInputValue: string) => {
    if (newInputValue.length > 2) {
      registerTrailer(newInputValue);
    }
  }

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
            value={value ? categorias?.results?.find((option : Trailer) => value === option.id) ?? null : null}
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
              if(resolvedId === 546464 && newValue?.code !== undefined){
                handleRegister(newValue?.code.split(" ")[1]);
                return;
              }
              onChange(resolvedId);
              props.onChange?.(newValue);
            }}
            onInputChange={(_, newInputValue) => handleInputChange(newInputValue)}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              const exist = options.some((option) => params.inputValue.toUpperCase() === option.code);
              if (params.inputValue !== '' && !exist && props.registered && params.inputValue.length > 2) {
                filtered.push({
                  id: 546464,
                  createdAtDate: new Date().toDateString(),
                  createdAtTime: new Date().toTimeString(),
                  code: `Agregar ${params.inputValue}`,
                });
              }
              return filtered;
            }}
            loading={isLoading || isFetching || isRegistering}
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
                  label="Trailer"
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
