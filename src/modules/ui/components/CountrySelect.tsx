// CountrySelect.tsx

import { Controller, Control, Path } from "react-hook-form";
import { useEffect, useState } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import { FieldValues } from "react-hook-form";
import {useGetCountriesQuery} from "../../../store/maintenance/maintenanceApi.ts";
import {CountryQueryParams, CountryType} from "../../../interfaces/maintenance";


interface CountrySelectProps<TField extends FieldValues> {
    control: Control<TField>;
    name: Path<TField>;
    placeholder?: string;
    searchBase?:string;
    disabled?: boolean;
    onChange?: (value: CountryType | null) => void;
    label?: string;
}

export function CountrySelect<TField extends FieldValues>(
    props: CountrySelectProps<TField>
) {
    const [query, setQuery] = useState<CountryQueryParams>({
        limit: 15,
        offset: 0,
        search: props.searchBase || ""
    });

    // Consumimos la query de países
    const { data, refetch, isFetching, isLoading } = useGetCountriesQuery(query);

    // Manejo de búsqueda
    const handleInputChange = (newValue: string) => {
        if (newValue.length > 2) {
            setQuery({ ...query, search: newValue });
        }
    };

    // Cuando query.search cambia, si > 2 chars, llamamos refetch
    useEffect(() => {
        if (query.search && query.search.length > 2) {
            refetch();
        }
    }, [query, refetch]);

    return (
        <Controller
            name={props.name}
            control={props.control}
            rules={{ required: "This field is required" }}
            render={({ field, fieldState: { error } }) => {
                const { value, onChange } = field;

                // value es un "country ID" (número) o null
                // Debemos mapearlo a la option (CountryType) correspondiente
                const currentOption =
                    value && data?.results
                        ? data.results.find((c) => c.id === value) ?? null
                        : null;

                return (
                    <Autocomplete
                        value={currentOption}
                        options={data?.results ?? []}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, val) => option.id === val.id}
                        loading={isLoading || isFetching}
                        disabled={props.disabled}
                        onChange={(_, newValue) => {
                            // newValue es un CountryType | null
                            // Guardamos su .id en react-hook-form
                            onChange(newValue ? newValue.id : null);
                            props.onChange?.(newValue || null);
                        }}
                        onInputChange={(_, newInputValue) => handleInputChange(newInputValue)}
                        renderOption={(propsR, option) => (
                            <Box component="li" {...propsR} sx={{ "& > img": { mr: 1 } }}>
                                {/* Mostramos la bandera si la API da un 'flag' */}
                                <img
                                    loading="lazy"
                                    width="20"
                                    src={`https://flagcdn.com/w20/${option.flag.toLowerCase()}.png`}
                                    srcSet={`https://flagcdn.com/w40/${option.flag.toLowerCase()}.png 2x`}
                                    alt=""
                                />
                                {option.name}
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={props.label || "Country"}
                                placeholder={props.placeholder}
                                error={!!error}
                                helperText={error?.message}
                                size="small"
                            />
                        )}
                    />
                );
            }}
        />
    );
}
