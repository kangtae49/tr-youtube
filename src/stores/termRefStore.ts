import { create } from "zustand"
import {Terminal as XTerm} from "@xterm/xterm"
import {MutableRefObject} from "react";
import {FitAddon} from "@xterm/addon-fit";

export type TermRef = {
  termRef: MutableRefObject<XTerm | undefined>,
  fitAddonRef: MutableRefObject<FitAddon | undefined>,
}

export interface TermRefStore {
  termRefMap: Map<string, TermRef>,
  setTermRefMap: (termRef: Map<string, TermRef>) => void
}

export const useTermRefStore = create<TermRefStore>((set) => ({
  termRefMap: new Map(),
  setTermRefMap: (termRefMap: Map<string, TermRef>) => set(() => ({ termRefMap }))
}))

