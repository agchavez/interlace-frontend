import { Alert, Avatar, Dialog, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material'

import { useAppDispatch, useAppSelector } from '../../../store'
import { setOpenChangeDistributionCenter } from '../../../store/ui/uiSlice'
import { changeDistributionCenter } from '../../../store/auth'
import BootstrapDialogTitle from './BoostrapDialog'


export const ChangeDistributorCenter = () => {
    const {user} = useAppSelector(state => state.auth)
    const {disctributionCenters} = useAppSelector(state => state.maintenance);
    const dispatch = useAppDispatch()
    const { openChangeDistributionCenter } = useAppSelector(state => state.ui)
    const handleClose = () => {
        dispatch(setOpenChangeDistributionCenter(false))
    }

    const handleListItemClick = (id: number) => {
        dispatch(changeDistributionCenter(id))
    }
  return (
    <>
    <Dialog onClose={handleClose} open={openChangeDistributionCenter} maxWidth="xs" fullWidth>
      <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
        Cambiar Centro de Distribución
        </BootstrapDialogTitle>
      <List sx={{ p: 0, m: 0 }}>
        {user?.distributions_centers && user?.distributions_centers.length > 1 && user?.distributions_centers.map((cd) => {
          const dc = disctributionCenters.find((d) => d.id === cd)
          return(
            <ListItem disableGutters key={cd}>
              <ListItemButton onClick={() => handleListItemClick(cd)}>
                <ListItemAvatar>
                    <Avatar
                        variant="rounded"
                        alt={dc?.country_code || "hn"}
                        src={dc?.country_code ? 
                              `https://flagcdn.com/h240/${dc?.country_code.toLowerCase()}.png`:
                              `https://flagcdn.com/h240/hn.png`}
                        sx={{ width: 35, height: 35 }}
                    />
                </ListItemAvatar>
                <ListItemText primary={disctributionCenters.find((d) => d.id === cd)?.name} />
              </ListItemButton>
            </ListItem>
          )
        })}
         <ListItem disableGutters alignItems='center' key='no_cd' sx={{ padding: 2 }}>
          {
             user?.distributions_centers && user?.distributions_centers.length <= 1 && (
              <Alert severity="error" sx={{ width: '100%' }}>
                No tiene más centros de distribución asociados
              </Alert>
            )
          }
        </ListItem>
      </List>
    </Dialog>

    </>
  )
}
