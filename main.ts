import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import generateScrollOffsetCM6Plugin from './ScrollOffsetCM6';

interface ScrollOffsetSettings {
	percentageMode: boolean;
	offset: string;
}

const DEFAULT_SETTINGS: ScrollOffsetSettings = {
	percentageMode: false,
	offset: '0',
}

export default class ScrollOffset extends Plugin {
	private clickSwitch = false;
	settings: ScrollOffsetSettings;

	// prevent click scroll
	mouseDownHandler = () => {
		this.clickSwitch = true;
	}

	// CM% scroll handler
	cursorActiveHandler = (cm: CodeMirror.Editor) => {
		if (this.clickSwitch) {
			this.clickSwitch = false;
			return;
		}

		this.scrollLaunch(cm);
	}

	calcRequiredOffset = (container: HTMLElement, cursorHeight: number) => {
		const {settings} = this;
		const maxOffset = (container.offsetHeight - cursorHeight) / 2;

		let requiredOffset: number = settings.percentageMode
			? container.offsetHeight * +settings.offset / 100
			: +settings.offset;
	
		requiredOffset = Math.min(requiredOffset, maxOffset);

		return requiredOffset
	}

	scrollLaunch = (cm: CodeMirror.Editor) => {
		const cursor = cm.charCoords(cm.getCursor());
		const cursorHeight = cursor.bottom - cursor.top + 5;
		const container = cm.getWrapperElement();
		const requiredOffset = this.calcRequiredOffset(container, cursorHeight);

		// First argument `null` means the cursor
		cm.scrollIntoView(null, requiredOffset)
	}

	enableScrollOffset = () => {
		// this works with CM5
		this.registerCodeMirror(cm => {
			cm.on('mousedown', this.mouseDownHandler)
			cm.on('cursorActivity', this.cursorActiveHandler);
		})

		// this works with CM6
		this.registerEditorExtension(generateScrollOffsetCM6Plugin(this.calcRequiredOffset));
	}

	disableScrollOffset = () => {
		this.app.workspace.iterateCodeMirrors(cm => {
			cm.off('mousedown', this.mouseDownHandler)
			cm.off('cursorActivity', this.cursorActiveHandler);
		})
	}

	async onload() {
		// This load current settings.
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ScrollOffsetSettingTab(this.app, this));

		this.enableScrollOffset();
	}

	onunload() {
		this.disableScrollOffset();
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
			.setDesc('unit in "px", or "%" if using percentage offset, 0 to disable this plugin')
			.addText(text => text
				.setValue(this.plugin.settings.offset)
				.onChange((value) => {
					this.plugin.settings.offset = value;
					this.plugin.saveSettings()
				})
			);
	}
}
