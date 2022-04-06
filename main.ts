import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface ScrollOffsetSettings {
	percentageMode: boolean;
	offset: string;
}

const DEFAULT_SETTINGS: ScrollOffsetSettings = {
	percentageMode: false,
	offset: '0',
}

export default class ScrollOffset extends Plugin {
	settings: ScrollOffsetSettings;

	async onload() {
		// This load current settings.
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ScrollOffsetSettingTab(this.app, this));

		this.addCommand({
			id: 'scroll-offset-launch',
			name: 'Scroll offset launch',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor);
				console.log(view);
			}
		})
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// Settings tab
class ScrollOffsetSettingTab extends PluginSettingTab {
	plugin: ScrollOffset;

	constructor(app: App, plugin: ScrollOffset) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Scroll Offset Settings.'});

		new Setting(containerEl)
			.setName('Use percentage offset')
			.setDesc('Use percentage offset, or use fixed number of distance instead')
			.addToggle(comp => comp
				.setValue(this.plugin.settings.percentageMode)
				.onChange((value) => {
					this.plugin.settings.percentageMode = value;
					this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Distance')
			.setDesc('unit in "px", or "%" if using percentage offset')
			.addText(text => text
				.setValue(this.plugin.settings.offset)
				.onChange((value) => {
					this.plugin.settings.offset = value;
					this.plugin.saveSettings()
				})
			);
	}
}
