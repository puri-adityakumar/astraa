import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createZustandStorage } from "./storage";
import type {
  ToolSettings,
  KeyboardShortcut,
  ExportFormat,
  ImportFormat,
} from "./types";

interface ToolSettingsState {
  toolSettings: ToolSettings;
  getToolSettings: (toolId: string) => ToolSettings[string] | null;
  updateToolSettings: (
    toolId: string,
    settings: Partial<ToolSettings[string]>,
  ) => void;
  updateToolUsage: (toolId: string) => void;
  getToolUsageCount: (toolId: string) => number;
  getLastUsed: (toolId: string) => Date | null;
  clearToolSettings: (toolId: string) => void;
  exportToolSettings: (toolId: string) => string | null;
  importToolSettings: (toolId: string, data: string) => boolean;
}

const defaultToolConfig = {
  settings: {},
  shortcuts: [] as KeyboardShortcut[],
  exportFormats: [] as ExportFormat[],
  importFormats: [] as ImportFormat[],
  lastUsed: undefined,
  usageCount: 0,
};

export const useToolSettings = create<ToolSettingsState>()(
  persist(
    (set, get) => ({
      toolSettings: {},

      getToolSettings: (toolId) => {
        const { toolSettings } = get();
        return toolSettings[toolId] || null;
      },

      updateToolSettings: (toolId, updates) => {
        set((state) => ({
          toolSettings: {
            ...state.toolSettings,
            [toolId]: {
              ...defaultToolConfig,
              ...state.toolSettings[toolId],
              ...updates,
              lastUsed: new Date(),
            },
          },
        }));
      },

      updateToolUsage: (toolId) => {
        set((state) => {
          const currentSettings =
            state.toolSettings[toolId] || defaultToolConfig;
          return {
            toolSettings: {
              ...state.toolSettings,
              [toolId]: {
                ...currentSettings,
                lastUsed: new Date(),
                usageCount: (currentSettings.usageCount || 0) + 1,
              },
            },
          };
        });
      },

      getToolUsageCount: (toolId) => {
        const { toolSettings } = get();
        return toolSettings[toolId]?.usageCount || 0;
      },

      getLastUsed: (toolId) => {
        const { toolSettings } = get();
        return toolSettings[toolId]?.lastUsed || null;
      },

      clearToolSettings: (toolId) => {
        set((state) => {
          const newSettings = { ...state.toolSettings };
          delete newSettings[toolId];
          return { toolSettings: newSettings };
        });
      },

      exportToolSettings: (toolId) => {
        const { toolSettings } = get();
        const settings = toolSettings[toolId];
        if (!settings) return null;

        try {
          return JSON.stringify(settings, null, 2);
        } catch (error) {
          console.error("Failed to export tool settings:", error);
          return null;
        }
      },

      importToolSettings: (toolId, data) => {
        try {
          const parsedSettings = JSON.parse(data);
          const { updateToolSettings } = get();
          updateToolSettings(toolId, parsedSettings);
          return true;
        } catch (error) {
          console.error("Failed to import tool settings:", error);
          return false;
        }
      },
    }),
    {
      name: "tool-settings",
      storage: createJSONStorage(() => createZustandStorage()),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migrate from version 0 to 1
          return {
            ...persistedState,
            toolSettings: persistedState.toolSettings || {},
          };
        }
        return persistedState;
      },
    },
  ),
);
