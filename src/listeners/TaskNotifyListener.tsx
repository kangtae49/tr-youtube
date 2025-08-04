import {useEffect} from "react";
import {listen} from "@tauri-apps/api/event";
import {TaskNotify} from "@/bindings";
import {useTaskNotifyMapStore} from "@/stores/taskNotifyMapStore.ts";
import {useTermRefStore} from "@/stores/termRefStore.ts";
import {useSelectedTermIdStore} from "@/stores/selectedTermIdStore.ts";

function TaskNotifyListener() {
  const setTaskNotifyList = useTaskNotifyMapStore((state) => state.setTaskNotifyList);
  const addTaskNotify = useTaskNotifyMapStore((state) => state.addTaskNotify);
  const termRefMap = useTermRefStore(state => state.termRefMap);
  const setSelectedTermId = useSelectedTermIdStore(state => state.setSelectedTermId);

  useEffect(() => {
    const unlisten = listen<TaskNotify>('shell_task', (event) => {
      let taskNotify = event.payload;
      console.log(taskNotify);
      setSelectedTermId(taskNotify.task_id);
      if (taskNotify.task_status === "Begin") {
        setTaskNotifyList(taskNotify.task_id, [taskNotify])
      } else {
        addTaskNotify(taskNotify.task_id, taskNotify);
      }
      // if (["Stdout", "Stderr"].includes(taskNotify.task_status)) {
      const term = termRefMap.get(taskNotify.task_id)?.termRef.current;
      term?.writeln(taskNotify.message);
      // }

    });
    return () => {
      unlisten.then((f) => f());
    };

  }, [])
  return null;
}

export default TaskNotifyListener;
