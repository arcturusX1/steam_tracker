import { Routes, Route } from "react-router"
import Layout from "@/components/Layout"
import SearchPage from "@/pages/SearchPage"
import UserPage from "@/pages/UserPage"
import GamePage from "@/pages/GamePage"
import NotFoundPage from "@/pages/NotFoundPage"

export default function App(){
  return(
  <Routes>
    <Route element = {<Layout/>}>
      <Route index element = {<SearchPage/>} />
      <Route path="user/:input" element={<UserPage />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="user/:input/games/:appId" element={<GamePage/>}/>
    </Route>
  </Routes>
  )
  
}
