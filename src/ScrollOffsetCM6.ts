import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { Compartment, Facet } from "@codemirror/state";
import { ScrollOffsetSettings } from "./settings";

// 用 Facet 存储当前 offset，方便 Compartment 动态替换
const scrollOffFacet = Facet.define<ScrollOffsetSettings, ScrollOffsetSettings>({
	combine: (values) => (values.length ? values[0] : { percentageMode: false, offset: 5 }),
});

const scrollOffCompartment = new Compartment();

// ViewPlugin：监听选区变化，主动保持 scrolloff 距离
const scrollOffPlugin = ViewPlugin.fromClass(
	class {
		private view: EditorView;
    private _cachedOffset = 5;
    public actualOffset = 5;
    public mouseActing = false;

		constructor(view: EditorView) {
			this.view = view;
		}

    // 计算拥护配置需要的偏移量
    calcRequiredDistance(windowHeight: number, cursorHeight: number, isPercentage: boolean, distance: number) {
      const limitDistance = Math.floor((windowHeight - cursorHeight) / 2);

      const requiredDistance = isPercentage? windowHeight * distance / 100: distance;

      return Math.max(5, Math.min(requiredDistance, limitDistance));
    }

    getViewportRect(view: EditorView) {
      return view.dom.querySelector(".cm-scroller")?.getBoundingClientRect()|| null;
    }

    getCursorCoords(view: EditorView) {
      const head = view.state.selection.main.head;
      return view.coordsAtPos(head)
    }

    setCacheOffset(offset: number) {
      this._cachedOffset = offset;
    }

    getCacheOffset() {
      return this._cachedOffset;
    }

		update(update: ViewUpdate) {
      const view = update.view;

      const previousSetting = update.startState.facet(scrollOffFacet);
      const currentSetting = update.state.facet(scrollOffFacet);
      const settingChanged = currentSetting !== previousSetting
      const {percentageMode, offset} = currentSetting;

      // 忽略鼠标操作
      if (this.mouseActing) {
        this.mouseActing = false;
        return
      };

			// 只在选区变化时触发（键盘移动光标、鼠标点击、命令移动等）
      // 配置改变
      // 布局完成
			if (!update.selectionSet && !settingChanged && !update.geometryChanged) return;

			// 用 requestMeasure 把布局读取(read)与副作用(write)分开
			view.requestMeasure({
				read: () => {
          // 如果在表格里则直接跳过
          const isCellInTable = !!view.dom.closest('td')
          if (isCellInTable) return;

          // 如果是由改了设置或者绘制完成触发，那么缓存偏移量
          // 如果是由选取改变触发，则计算偏移量
          if (settingChanged || update.geometryChanged) {
            // 获取不到视口或尺寸未就绪（阅读模式 / 隐藏状态）：跳过，等再次触发
            const rect = this.getViewportRect(view);
            if (!rect || rect.height <= 0) return;

            // 获取不到光标位置：跳过，等待再次触发
            const coords = this.getCursorCoords(view);
            if (!coords) return;
            const cursorHeight = coords.bottom - coords.top;

            const requiredOffset = this.calcRequiredDistance(rect.height, cursorHeight, percentageMode, offset)
            if (requiredOffset >= 0) this.setCacheOffset(requiredOffset)
          } else if (update.selectionSet) {
            this.actualOffset = this.mouseActing? 5: this.getCacheOffset();
          }
				},
			});
		}
	},
  {
    eventHandlers: {
      mousedown: function(event: MouseEvent, view: EditorView) {
        this.mouseActing = true;
      },
      mouseup: function(event: MouseEvent, view: EditorView) {
        this.mouseActing = true;
      },
    },
    provide: plugin => EditorView.scrollMargins.of(view => {
      const value = view.plugin(plugin);

      return {
        top: value?.actualOffset,
        bottom: value?.actualOffset,
      }
    })
  }
);

// 组合扩展：compartment + viewPlugin
// 初始 y 为 5，表示插件默认“不启用”，等 settings 加载后由 main.ts 调用 reconfigure
const ScrollOffsetCM6Extension = [
	scrollOffCompartment.of(scrollOffFacet.of({ percentageMode: false, offset: 5 })),
	scrollOffPlugin,
];

function reconfigureOffset(view: EditorView, newSetting: ScrollOffsetSettings) {
  view.dispatch({
    effects: scrollOffCompartment.reconfigure(scrollOffFacet.of(newSetting))
  })
}

export { ScrollOffsetCM6Extension, reconfigureOffset };
