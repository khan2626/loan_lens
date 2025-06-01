
import React from "react"
import Navbar from "./components/Navbar"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Apply from "./components/Apply"
import Dashboard from "./components/Dashboard"


function App() {
  return (
    <BrowserRouter>
    <div className="">
      <Navbar/>
      <Routes>
        <Route path="/apply" element={<Apply/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App
