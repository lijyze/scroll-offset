## Obsidian Scroll Offset

This plugin can keep a defined distance before and after cursor, just like `scrolloff` in vim of `cursor surrounding lines` in VS-Code.

### Usage

You can simply config the distance you want in config tab with a fixed pixel or a percentage of height of content

### Notice

This plugin will exam the boundary situation. If the given distance more than half of the contant area, it will be regarded as half of the contant (actually less then half, beacause of the height of cursor).