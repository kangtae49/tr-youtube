import {useEffect, useRef} from "react";
import {Terminal as XTerm} from "@xterm/xterm"
import '@xterm/xterm/css/xterm.css';
import { FitAddon } from '@xterm/addon-fit';
import {useTermRefStore, type TermRef} from "@/stores/termRefStore.ts";
import {useSelectedTermIdStore} from "@/stores/selectedTermIdStore.ts";


type Props = {
  termId: string
}
function TerminalView({termId}: Props) {
  const termRefMap = useTermRefStore(state => state.termRefMap);
  const setTermRefMap = useTermRefStore(state => state.setTermRefMap);
  const selectedTermId = useSelectedTermIdStore(state => state.selectedTermId);

  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm>();
  const fitAddonRef = useRef<FitAddon>();

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      fitAddonRef.current?.fit();
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const term = new XTerm({
        fontFamily: 'operator mono,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
        fontSize: 14,
        theme: { background: '#101420' },
        cursorStyle: 'underline',
        cursorBlink: false,
      });
      try{
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        fitAddon.fit();
        term.open(containerRef.current);
        termRef.current = term;
        fitAddonRef.current = fitAddon;

        termRefMap.set(termId, {
          termRef: termRef,
          fitAddonRef: fitAddonRef,
        });
        setTermRefMap(termRefMap);
        term.writeln(termId);
      } catch (e) {
        console.log(e);
      }


    }
    return () => {
      termRef.current?.dispose();
    };
  }, []);



  return (
  <div className={`term-view ${termId === selectedTermId ? "show": "hide"}`} ref={containerRef} style={{ height: '100%', width: '100%' }}>
  </div>
  )
}

export default TerminalView;
