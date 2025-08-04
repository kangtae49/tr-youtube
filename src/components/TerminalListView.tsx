import {useTaskNotifyMapStore} from "@/stores/taskNotifyMapStore.ts";
import TerminalView from "@/components/TerminalView.tsx";

function TerminalListView() {
  const taskNotifyMap = useTaskNotifyMapStore(state => state.taskNotifyMap);

  return (
    <div className="term-list-view">
      {Object.entries(taskNotifyMap).map( ([k, _v]) => {
        return (
          <TerminalView termId={k} />
        )
      })}
    </div>
  )
}

export default TerminalListView;