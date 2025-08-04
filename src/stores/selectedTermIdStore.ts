import { create } from "zustand"

export interface SelectedTermIdStore {
  selectedTermId: string | undefined,
  setSelectedTermId: (selectedTermId: string | undefined) => void
}

export const useSelectedTermIdStore = create<SelectedTermIdStore>((set) => ({
  selectedTermId: undefined,
  setSelectedTermId: (selectedTermId: string | undefined) => set(() => ({ selectedTermId }))
}))

