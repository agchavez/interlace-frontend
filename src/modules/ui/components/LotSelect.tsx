import { Controller, Control, Path } from "react-hook-form";
import { useEffect, useState } from 'react';
import { Autocomplete, TextField, createFilterOptions } from "@mui/material";

import type { FieldValues } from "react-hook-form";
import { LotTypeQuerySearch, LotType } from '../../../interfaces/maintenance';
import { useGetLotQuery, usePostLotMutation } from "../../../store/maintenance/maintenanceApi";
import { toast } from "sonner";
import { errorApiHandler } from '../../../utils/error';


const filter = createFilterOptions<LotType>();

interface LotSelectProps<
    TField extends FieldValues
    
    > {
  control: Control<TField>;
  name: Path<TField>;
  placeholder?: string;
  //options?: o[];
  registered?: boolean;
  disabled?: boolean;
  onChange?: (value: LotType | null) => void;
  lotId?: number;
}

export const LotSelect = <
TField extends FieldValues
>(
props: LotSelectProps<TField>
) => {
  const [query, setQuery] = useState<LotTypeQuerySearch>({
    limit: 10,
    offset: 0,
    search: "",
    id: props.lotId
  });
  
  
  const {
    data: categorias,
    refetch,
    isFetching,
    isLoading
  } = useGetLotQuery(query);

  const [
    registerLotType, { isLoading: isRegistering, isSuccess: isRegisteringSuccess , data: registerLotTypeData, reset: resetRegisterLotType, error }
  ] = usePostLotMutation();

  useEffect(() => {
    refetch();
  }, [query, refetch]);

  const handleInputChange = (newInputValue: string) => {
    if (newInputValue.length >= 1) {
      setQuery({
        ...query,
        search: newInputValue
      });
    }
  };

  useEffect(() => {
    if (error){
      errorApiHandler(error, "Error al registrar el lote")
      resetRegisterLotType();
      return
    }
    else if (isRegisteringSuccess && registerLotTypeData){
      toast.success(registerLotTypeData.code, {
        description: "Lote registrado con exito"
      });
      props.onChange?.(registerLotTypeData);
      resetRegisterLotType();
      setQuery({
        ...query,
        id: registerLotTypeData.id, 
        search: ""
      })

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegisteringSuccess, registerLotTypeData, query, error]);

  const handleRegister = (newInputValue: string) => {
    if (newInputValue.length >= 1) {
      registerLotType({
        code: newInputValue
      });
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
            value={value ? categorias?.results?.find((option : LotType) => value === option.id) ?? null : null}
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
              if (params.inputValue !== '' && !exist && props.registered && params.inputValue.length > 1) {
                filtered.push({
                  id: 546464,
                  code: `Agregar ${params.inputValue}`,
                  created_at: new Date(),
                  distributor_center: 1,
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
                  label="Lote"
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
