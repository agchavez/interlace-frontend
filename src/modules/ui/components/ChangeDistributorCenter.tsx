import { Avatar, Dialog, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material'
import PinDropTwoToneIcon from '@mui/icons-material/PinDropTwoTone';
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
        {user?.distributions_centers.map((cd) => (
          <ListItem disableGutters key={cd}>
            <ListItemButton onClick={() => handleListItemClick(cd)}>
              <ListItemAvatar>
                <Avatar sx={(theme) => ({
                
                    color: theme.palette.secondary.light,
                })}>
                  <PinDropTwoToneIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={disctributionCenters.find((d) => d.id === cd)?.name} />
            </ListItemButton>
          </ListItem>
        ))}
         <ListItem disableGutters alignItems='center' key='no_cd'>
          {
             user?.distributions_centers && user?.distributions_centers.length <= 1 && (
              <ListItemText primary="No tiene centros de distribución permitidos" sx={{textAlign: 'center'}} />
            )
          }
        </ListItem>
      </List>
    </Dialog>

    </>
  )
}
