import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { CheckPage } from './Pages/CheckPage';

export const TrackerRouter = () => {
  return (
    <>
    <Routes>
      <Route path="check" element={<CheckPage />} />
    </Routes>

    </>
  )
}

export default TrackerRouter
