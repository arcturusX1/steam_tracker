import { Routes, Route } from "react-router"
import Layout from "@/components/Layout"
import SearchPage from "@/pages/SearchPage"
import UserPage from "@/pages/UserPage"
import NotFoundPage from "@/pages/NotFoundPage"

export default function App(){
  return(
  <Routes>
    <Route element = {<Layout/>}>
      <Route index element = {<SearchPage/>} />
      <Route path="user/:input" element={<UserPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
  )
  
}
