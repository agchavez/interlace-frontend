import { Controller, Control, Path, useFormContext } from "react-hook-form";
import { useEffect, useState } from 'react';
import { Autocomplete, TextField, createFilterOptions } from "@mui/material";

import type { FieldValues } from "react-hook-form";
import { ClaimTypeQuerySearch, ClaimType } from '../../../store/claim/claimApi';
import { useGetClaimTypesQuery, useRegisterClaimTypeMutation } from "../../../store/claim/claimApi";
import { toast } from "sonner";

const filter = createFilterOptions<ClaimType>();

interface ClaimTypeSelectProps<
    TField extends FieldValues
    > {
  control: Control<TField>;
  name: Path<TField>;
  placeholder?: string;
  disabled?: boolean;
  local?: boolean; // Para indicar si se usa localmente o no
  onChange?: (value: ClaimType | null) => void;
  claimTypeId?: number;
}

export const ClaimTypeSelect = <
TField extends FieldValues
>(
props: ClaimTypeSelectProps<TField>
) => {
  const [query, setQuery] = useState<ClaimTypeQuerySearch>({
    limit: 10,
    offset: 0,
    search: "",
    id: props.claimTypeId
  });
  
  const {
    data: claimTypes,
    refetch,
    isFetching,
    isLoading
  } = useGetClaimTypesQuery(query);

  const [
    registerClaimType, { isLoading: isRegistering, isSuccess: isRegisteringSuccess, data: registerClaimTypeData, reset: resetRegisterClaimType }
  ] = useRegisterClaimTypeMutation();

  // Try to get setValue from useFormContext, but don't crash if not available
  const formContext = useFormContext<TField>();
  // Use the setValue from the form context if available
  const formSetValue = formContext?.setValue;

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
    if (isRegisteringSuccess && registerClaimTypeData){
      // Auto-select the newly created claim type by setting the form value if available
      if (formSetValue) {
        formSetValue(props.name, registerClaimTypeData.id as unknown as any, { 
          shouldValidate: true, 
          shouldDirty: true,
          shouldTouch: true
        });
      }
      
      toast.success(registerClaimTypeData.name, {
        description: "Tipo de reclamo registrado con éxito"
      });
      
      // Still call the onChange prop for any parent component
      props.onChange?.(registerClaimTypeData);
      
      resetRegisterClaimType();
      setQuery({
        ...query,
        id: registerClaimTypeData.id, 
        search: ""
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegisteringSuccess, registerClaimTypeData, query]);

  const handleRegister = (newInputValue: string) => {
    if (newInputValue.length > 2) {
      registerClaimType({ 
        name: newInputValue,
        description: "" 
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
            value={value ? claimTypes?.results?.find((option: ClaimType) => value === option.id) ?? null : null}
            getOptionLabel={(option) => option.name}
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
              if(resolvedId === 546464 && newValue?.name !== undefined){
                handleRegister(newValue?.name.split(" ")[1]);
                return;
              }
              onChange(resolvedId);
              props.onChange?.(newValue);
            }}
            onInputChange={(_, newInputValue) => handleInputChange(newInputValue)}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              const exist = options.some((option) => params.inputValue.toUpperCase() === option.name.toUpperCase());
              if (params.inputValue !== '' && !exist && props.local && params.inputValue.length > 2) {
                filtered.push({
                  id: 546464,
                  name: `Agregar ${params.inputValue}`,
                  description: "",
                });
              }
              return filtered;
            }}
            loading={isLoading || isFetching || isRegistering}
            id="autocomplete-claim-type"
            size="small"
            options={claimTypes?.results ?? []}
            clearText="Limpiar"
            loadingText="Cargando..."
            noOptionsText="No hay resultados"
            renderInput={
              (params) => (
                <TextField
                  {...params}
                  label="Tipo de Reclamo"
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

export default ClaimTypeSelect;