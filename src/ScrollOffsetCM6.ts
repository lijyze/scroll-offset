import {ViewPlugin, ViewUpdate, EditorView, PluginField} from '@codemirror/view';
import { Prec } from '@codemirror/state'

const eventHandlers = {
  mousedown(event: MouseEvent, view: EditorView) {
    this.switch = false;
  },
  keydown(event: KeyboardEvent, view: EditorView) {
    this.switch = true;
  },
}

function generateScrollOffsetCM6Plugin(calcRequiredOffset: (container: HTMLElement, cursorHeight: number) => number) {
  return Prec.highest(ViewPlugin.fromClass(class {
    switch = true;
    margin = {
      top: 0,
      bottom: 0,
    }
  
    constructor(_view: EditorView) {}
  
    update(_update: ViewUpdate) {
      if (_update.selectionSet) return ;

      const view = _update.view;

      view.requestMeasure({
        read: () => {
          return {
            cursor: view.coordsAtPos(view.state.selection.main.head),
          }
        },
        write: ({cursor}) => {
          if (cursor) return ;

          if (this.switch) {
            /**
             * Can't use `lineHeight` because of multiple line paragraph
             * But cursorHeight is less then lineHeight about 5px
             * So add this 5px;
             */
            const cursorHeight = cursor.bottom - cursor.top + 5
            const requiredOffset = calcRequiredOffset(view.dom, cursorHeight)

            this.margin.top = requiredOffset;
            this.margin.bottom = requiredOffset
          } else {
            this.margin.top = 0
            this.margin.bottom = 0
          }
        },
      })
    }
  }, 
  {
    eventHandlers,
    provide: [
      PluginField.scrollMargins.from(value => value.margin)
    ],
  }))
}

export default generateScrollOffsetCM6Plugin