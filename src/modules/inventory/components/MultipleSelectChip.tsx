import * as React from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,

    },
  },
};

function getStyles(value: string, values: readonly string[], theme: Theme) {
  return {
    fontWeight:
      values.indexOf(value) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

interface MultipleSelectChipOtion {
    text: string;
    value: string;
}

interface MultipleSelectChipProps {
    options: MultipleSelectChipOtion[];
    label: string;
    changeEventAction?: (value:string[]) => void;
    value: string[];
}

export default function MultipleSelectChip({options, label, changeEventAction, value}:MultipleSelectChipProps) {
  const theme = useTheme();
  const [option, setOption] = React.useState<string[]>(value);

  const handleChange = (event: SelectChangeEvent<typeof option>) => {
    const {
      target: { value },
    } = event;
    setOption(
      typeof value === 'string' ? value.split(',') : value,
    );
    if (changeEventAction && typeof value !== "string"){
        changeEventAction(value)
    }
  };

  React.useEffect(()=>{
    setOption(value)
  }, [value])

  return (
    <div>
      <FormControl fullWidth size='small'>
        <InputLabel id="demo-multiple-chip-label">{label}</InputLabel>
        <Select
          labelId="demo-multiple-chip-label"
          id="demo-multiple-chip"
          multiple
          value={option}
          onChange={handleChange}
          input={<OutlinedInput id="select-multiple-chip" label={label} />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => {
                const option = options.find(opt => opt.value === value)
                return(
                <Chip key={value} label={option?.text} />
              )})}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {options.map((opt) => (
            <MenuItem
              key={opt.value}
              value={opt.value}
              style={getStyles(opt.text, option, theme)}
            >
              {opt.text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
