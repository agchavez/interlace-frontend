import { Controller, Control, Path, FieldValues } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { FormHelperText } from "@mui/material";

interface AutoCompleteBaseProps<
    O extends { id: string; label: string },
    TField extends FieldValues
> {
    control: Control<TField>;
    name: Path<TField>;
    options: O[];
    disabled?: boolean;
    placeholder?: string;
    onChange?: (value: string | null) => void;
}

export const AutoCompleteBase = <
    O extends { id: string; label: string },
    TField extends FieldValues
>(
    props: AutoCompleteBaseProps<O, TField>
) => {
    const { options, name } = props;
    const control = props.control;
    return (
        <Controller
            name={name}
            control={control}
            
            rules={{
                required: "Este campo es requerido",
            }}
            render={({ field, fieldState: { error } }) => {
                const {  value, ref } = field;
                const { onChange } = field as (typeof field) & { onChange: (value: string | null) => void };
                
                
                return (
                    <>
                        <Autocomplete
                            value={
                                value
                                    ? options.find((option) => {
                                        return value === option.id;
                                    }) ?? null
                                    : null
                            }
                            getOptionLabel={(option) => {
                                return option.label;
                            }}
                            disabled={props.disabled}
                            onChange={(_, newValue) => {
                                const resolvedId = newValue ? newValue.id : null;
                                onChange(resolvedId);
                                props.onChange?.(resolvedId);
                            }}
                            id="base__autocomplete"
                            size="small"
                            options={options}
                            noOptionsText="No hay opciones"
                            openText="Abrir"
                            closeText="Cerrar"
                            clearText="Limpiar"
                            loadingText="Cargando..."

                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={props.placeholder}
                                    inputRef={ref}
                                    key={params.id}
                                    error={!!error}
                                />
                            )}

                            renderOption={(props, option) => {
                                return (
                                    <li {...props} key={option.id}>
                                        <span>{option.label}</span>
                                    </li>
                                );

                            }}
                        />
                        {error ? (
                            <FormHelperText error={error ? true : false}>
                                {error.message}
                            </FormHelperText>
                        ) : null}
                    </>
                );
            }}
        />
    );
};