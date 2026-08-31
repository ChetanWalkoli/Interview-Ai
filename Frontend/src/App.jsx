import { RouterProvider } from "react-router"
import { router } from "./App.routes.jsx"

function App() {

  return (
    <>
    <RouterProvider router={router} />
    </>
  )
}

export default App

