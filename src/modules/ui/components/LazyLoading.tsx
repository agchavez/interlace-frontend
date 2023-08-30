import { Backdrop, CircularProgress, Typography } from '@mui/material';
import { Suspense } from 'react';
interface LazyLoadingProps {
  Children: React.LazyExoticComponent<() => JSX.Element>;
}

export function LazyLoading({ Children }: LazyLoadingProps) {
  // Wrapping around the suspense component is mandatory
  return (
    <Suspense fallback={<Backdrop open={true}  style={{zIndex: 99999999, backgroundColor: 'rgba(0,0,0,0.2)'}}>
        <div className='ui__loading-container'>
            <CircularProgress color="primary" />
            <Typography variant="body1" component="h2" fontWeight={200}>
                Cargando...
            </Typography>
        </div></Backdrop>
    }>
      <Children />
    </Suspense>
  );
}