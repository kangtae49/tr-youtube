import {Outlet} from "react-router-dom";
import TaskNotifyListener from "@/listeners/TaskNotifyListener.tsx";

function AppLayout () {
  return (
    <>
      <TaskNotifyListener />
      <Outlet />
    </>
  )
}

export default AppLayout
