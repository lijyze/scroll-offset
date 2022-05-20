# Obsidian Scroll Offset

This plugin can keep a defined distance before and after cursor, just like `scrolloff` in vim of `cursor surrounding lines` in VS-Code.

## Usage

1. Define a distance you like in setting tab.
2. Enjoy it!

You can set the distance to either a fixed distance with unit in `px` or a relative distance to the height of the content area.

## Notice

This plugin will exam the boundary situation. If the given distance more than half of the content area, it will be regarded as half of the content (actually less then half, beacause of the height of cursor).

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Donating

<a href="https://www.buymeacoffee.com/lijyze" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 160px !important;" ></a>
