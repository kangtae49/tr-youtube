import {SplitPane} from "@rexxars/react-split-pane";
import {useState} from "react";
import YoutubeDownloadView from "@/components/YoutubeDownloadView.tsx";
import {useTermRefStore} from "@/stores/termRefStore.ts";
import TerminalListView from "@/components/TerminalListView.tsx";

function MainView() {
  const [isResizing, setIsResizing] = useState(false);
  const termRefMap = useTermRefStore(state => state.termRefMap);

  const onChangeSplitSize = (_size: number) => {
    // const term = termRefMap.get("terminal0")?.termRef.current;
    // term?.writeln("size")
    const fitAddon = termRefMap.get("terminal0")?.fitAddonRef.current;
    fitAddon?.fit();
  }
  return (
    <div className="main-pane">
      <SplitPane
        className="split-pane"
        split="horizontal"
        primary="second"
        // primary="first"
        minSize={0}
        defaultSize={200}
        onDragStarted={() => setIsResizing(true)}
        onDragFinished={() => setIsResizing(false)}
        onChange={onChangeSplitSize}
      >
        <YoutubeDownloadView />
        <TerminalListView />
        {(isResizing) && <div className="iframe-overlay" />}
      </SplitPane>
    </div>
  )
}

export default MainView;
