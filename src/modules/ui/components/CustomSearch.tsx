
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { FC } from 'react';

interface Props {
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    onClick: () => void;
}

export const CustomSearch: FC<Props> = ({ placeholder, onChange, value, onClick }) => {
    return (
        <>
            <Paper
                component="form"
                elevation={0}
                sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
            >
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder={placeholder}
                    onChange={onChange}
                    value={value}
                    inputProps={{ 'aria-label': 'search google maps' }}
                    // Buscar al presionar enter
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            onClick();
                        }
                    }
                    }
                />
                <IconButton 
                    type="button" 
                    sx={{ p: '10px' }} 
                    aria-label="search"
                    onClick={ onClick }
                >
                    <SearchIcon
                        color='primary'
                    />
                </IconButton>
            </Paper>
        </>
    )
}
