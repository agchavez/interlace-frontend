import { Alert, Avatar, Dialog, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material'

import { useAppDispatch, useAppSelector } from '../../../store'
import { setOpenChangeDistributionCenter } from '../../../store/ui/uiSlice'
import { changeDistributionCenter } from '../../../store/auth'
import BootstrapDialogTitle from './BootstrapDialogTitle'


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
        {user?.distributions_centers && user?.distributions_centers
          .filter((cd) => disctributionCenters.some((d) => d.id === cd))
          .map((cd) => {
            const dc = disctributionCenters.find((d) => d.id === cd)
            const isActive = user.centro_distribucion === cd
            return(
              <ListItem disableGutters key={cd}>
                <ListItemButton onClick={() => handleListItemClick(cd)} selected={isActive}>
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
                  <ListItemText
                    primary={dc?.name}
                    secondary={isActive ? 'Activo' : undefined}
                  />
                </ListItemButton>
              </ListItem>
            )
          })
        }
        {user?.distributions_centers &&
          user.distributions_centers.filter((cd) => disctributionCenters.some((d) => d.id === cd)).length <= 1 && (
          <ListItem disableGutters alignItems='center' key='no_cd' sx={{ padding: 2 }}>
            <Alert severity="info" sx={{ width: '100%' }}>
              No tiene más centros de distribución disponibles
            </Alert>
          </ListItem>
        )}
      </List>
    </Dialog>

    </>
  )
}
