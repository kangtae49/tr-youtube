import {useEffect} from "react";
import {listen} from "@tauri-apps/api/event";

function HttpNotifyListener() {

  useEffect(() => {
    const unlisten = listen<any>('http', (event) => {
      let taskNotify = event.payload;
      if (taskNotify.cmd === "Refresh") {
      }
    });
    return () => {
      unlisten.then((f) => f());
    };

  }, [])
  return null;
}

export default HttpNotifyListener;