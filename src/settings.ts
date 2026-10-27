import { App, PluginSettingTab, Setting, SettingDefinitionItem } from "obsidian";
import ScrollOffset from "./main";

export interface ScrollOffsetSettings {
	percentageMode: boolean;
	offset: number;
}

export const DEFAULT_SETTINGS: ScrollOffsetSettings = {
  percentageMode: true,
  offset: 25,
}

// Settings tab
export class ScrollOffsetSettingTab extends PluginSettingTab {
  plugin: ScrollOffset;

  constructor(app: App, plugin: ScrollOffset) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions(): SettingDefinitionItem<string>[] {
    return [
      {
        name: 'Use percentage offset',
        desc: 'Use percentage offset, or use fixed number of distance instead',
        control: {
          type: 'toggle',
          key: 'percentageMode',
        }
      },
      {
        name: 'Distances',
        desc: 'unit in "px", or "%" if using percentage offset, 0 to disable this plugin',
        control: {
          type: 'number',
          key: 'offset',
        }
      },
    ]
  }

  // 覆写默认报错方法，在保存后触发副作用
  async setControlValue(key: string, value: unknown): Promise<void> {
    await super.setControlValue(key, value);

    this.plugin.applyOffset(true);
  }
}