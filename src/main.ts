import { Editor, MarkdownView, Plugin } from 'obsidian';
import { reconfigureOffset, ScrollOffsetCM6Extension } from './ScrollOffsetCM6'
import { DEFAULT_SETTINGS, ScrollOffsetSettings, ScrollOffsetSettingTab } from './settings';
import { EditorView } from '@codemirror/view';

interface EditorWithCM extends Editor {
  cm?: EditorView;
}

export default class ScrollOffset extends Plugin {
	private originSettings = {
		percentageMode: false,
		offset: 5
	};
	settings!: ScrollOffsetSettings;

	applyOffset = (enabled: boolean) => {
    this.app.workspace.getLeavesOfType('markdown').forEach((leaf) => {
      const editor = (leaf.view as MarkdownView).editor as EditorWithCM | undefined;
  		const view = editor?.cm;
			
			if (!view) return;

			const settings = enabled? {...this.settings}: {...this.originSettings};
			reconfigureOffset(view, settings)
    });
  };

	async onload() {
		console.log('Loading Scroll Offset.')

		// This load current settings.
		await this.loadSettings();

		this.registerEditorExtension(ScrollOffsetCM6Extension);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ScrollOffsetSettingTab(this.app, this));

		this.applyOffset(true);

		this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        this.applyOffset(true)
      })
    );
	}

	onunload() {
		this.applyOffset(false);
	
		console.log('Scroll Offset unloaded.')
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
}