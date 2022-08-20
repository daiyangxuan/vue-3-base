import type { ITooltipComp, ITooltipParams } from "ag-grid-community";

// 暂时只支持 无 和 左下
export enum Positon {
  // 无
  "none",
  // 左下
  "bottomLeft",
}

export type CusToolTipConfig = {
  maxWidth: number;
  positon: Positon;
  useFormatted: boolean;
};

export class CustomTooltip implements ITooltipComp {
  eGui: any;
  init(params: ITooltipParams & CusToolTipConfig) {
    const eGui = (this.eGui = document.createElement("div"));
    const data = params.api!.getDisplayedRowAtIndex(params.rowIndex!)!.data;
    const value = params.useFormatted
      ? params.valueFormatted
      : data[params.value];
    const maxWidth = data[params.maxWidth];
    if (
      Array.isArray(data[params.value])
        ? data[params.value].length
        : data[params.value]
    ) {
      eGui.classList.add("custom-tooltip");
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      eGui.innerHTML = `
    <div class="no-arrow-tooltip arrow-${params.positon}" style="max-width: ${maxWidth}px;">
      <div class="tooltip-arrow"><span class="tooltip-arrow-content"></span></div>
      <div class="tooltip-inner" role="tooltip"><span class="no-light-html">${value}</span></div>
    </div>
    `;
    }
  }

  getGui() {
    return this.eGui;
  }
}

export const showTooltip = (
  key: string,
  config: Partial<CusToolTipConfig> = {}
) => ({
  filter: "agSetColumnFilter",
  filterParams: {
    showTooltips: true,
  },
  tooltipComponent: CustomTooltip,
  tooltipField: key,
  tooltipComponentParams: {
    value: key,
    positon: "bottomLeft",
    maxWidth: 200,
    useFormatted: false,
    ...config,
  },
});
