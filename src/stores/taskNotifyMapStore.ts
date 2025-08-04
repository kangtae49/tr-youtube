import { create } from "zustand"
import { TaskNotify } from "@/bindings"

type TaskNotifyMap = {
  [key: string]: TaskNotify[];
};
export interface TaskNotifyMapStore {
  taskNotifyMap: TaskNotifyMap
  getTaskNotifyList: (key: string) => TaskNotify []
  setTaskNotifyList: (key: string, taskNotifyList: TaskNotify []) => void
  addTaskNotify: (key: string, taskNotify: TaskNotify) => void
}

export const useTaskNotifyMapStore =
  create<TaskNotifyMapStore>((set, get) => ({
    taskNotifyMap: {},
    getTaskNotifyList: (key: string) => {
      const map = get().taskNotifyMap;
      return map[key] ?? [];
    },
    setTaskNotifyList: (key: string, taskNotifyList: TaskNotify[]) => {
      set((state) => ({
        taskNotifyMap: {
          ...state.taskNotifyMap,
          [key]: taskNotifyList,
        },
      }));
    },
    addTaskNotify: (key: string, taskNotify: TaskNotify) => {
      set((state) => {
        const currentList = state.taskNotifyMap[key] ?? [];
        return {
          taskNotifyMap: {
            ...state.taskNotifyMap,
            [key]: [...currentList, taskNotify],
          },
        };
      });
    },
  }))
