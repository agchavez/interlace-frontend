import { differenceInMilliseconds } from 'date-fns';
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { openTimeoutModal } from '../../../store/auth';
import { LogoutModal } from './LogoutModal';

export const LogOutTimer = () => {

    const { expiredIn } = useAppSelector(state => state.auth)
    const dispatch = useAppDispatch();
    
    
    useEffect(() => {
      if (!expiredIn) return;
      const currentTime = new Date();
      const expiresInMilliseconds = new Date(expiredIn);
      const dif = differenceInMilliseconds(expiresInMilliseconds, currentTime);
        const interval = setInterval(() => {
            dispatch(openTimeoutModal())
            clearInterval(interval);
        }, dif - 60000);
        return () => clearInterval(interval);

    }, [expiredIn, dispatch])


    return (
        <>
            <LogoutModal />
        </>
    )
}