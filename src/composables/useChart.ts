import { ref, type Ref } from "vue";
import {
  createChart,
  ColorType,
  AreaSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import {
  CHART_COLORS,
  CHART_DIMENSIONS,
  CHART_TIME_CONFIG,
} from "@/constants/chart";
import { useFormatters } from "@/composables/useFormatters";
import type { ChartData, CrosshairParam, ChartDataConfig } from "@/types";

export function useChart() {
  const { formatTime, formatChartTime, getDecimalPlaces } = useFormatters();

  const showTooltip: Ref<boolean> = ref(false);
  const tooltipX: Ref<number> = ref(0);
  const tooltipY: Ref<number> = ref(0);
  const tooltipData: Ref<{ price: string; time: string } | null> = ref(null);

  const convertDataToLightweightFormat = (
    chartData: ChartDataConfig
  ): { priceData: ChartData[] } => {
    if (!chartData?.datasets?.[0]?.data) {
      return { priceData: [] };
    }

    const prices = chartData.datasets[0].data;
    const now = Math.floor(Date.now() / 1000);

    const priceData = prices.map((price: number, index: number) => {
      const timeOffset =
        (prices.length - 1 - index) * CHART_TIME_CONFIG.TIME_STEP;
      const timestamp = now - timeOffset;

      return {
        time: timestamp,
        value: typeof price === "number" ? price : parseFloat(String(price)),
      };
    });

    priceData.sort((a: ChartData, b: ChartData) => a.time - b.time);

    return { priceData };
  };

  const getChartOptions = (
    customOptions: Record<string, unknown> = {}
  ): Record<string, unknown> => {
    return {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: CHART_COLORS.TEXT,
        fontSize: 11,
        fontFamily: "SF Mono, Monaco, monospace",
      },
      grid: {
        vertLines: {
          color: CHART_COLORS.GRID.vertLines,
          style: 0,
          visible: true,
        },
        horzLines: {
          color: CHART_COLORS.GRID.horzLines,
          style: 0,
          visible: true,
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: CHART_COLORS.CROSSHAIR.color,
          width: 1,
          style: 3,
          visible: true,
          labelVisible: false,
        },
        horzLine: {
          color: CHART_COLORS.CROSSHAIR.color,
          width: 1,
          style: 3,
          visible: true,
          labelVisible: true,
          labelBackgroundColor: CHART_COLORS.CROSSHAIR.labelBackground,
        },
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        textColor: CHART_COLORS.TEXT,
        entireTextOnly: false,
        ticksVisible: true,
        scaleMargins: {
          top: CHART_DIMENSIONS.PADDING.TOP,
          bottom: CHART_DIMENSIONS.PADDING.BOTTOM,
        },
        mode: 0,
        autoScale: true,
        invertScale: false,
        alignLabels: true,
        borderColor: CHART_COLORS.GRID.vertLines,
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: true,
        borderVisible: false,
        timeVisible: CHART_TIME_CONFIG.VISIBLE_TIME,
        secondsVisible: CHART_TIME_CONFIG.VISIBLE_SECONDS,
        ticksVisible: true,
        fixLeftEdge: false,
        fixRightEdge: false,
        rightOffset: CHART_DIMENSIONS.SPACING.RIGHT_OFFSET,
        barSpacing: CHART_DIMENSIONS.SPACING.BAR,
        minBarSpacing: CHART_DIMENSIONS.SPACING.MIN_BAR,
        tickMarkFormatter: (time: number) => {
          return formatChartTime(time);
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      ...customOptions,
    };
  };

  const getAreaSeriesOptions = (): Record<string, unknown> => {
    return {
      lineColor: CHART_COLORS.PRIMARY.lineColor,
      topColor: CHART_COLORS.PRIMARY.topColor,
      bottomColor: CHART_COLORS.PRIMARY.bottomColor,
      lineWidth: 2,
      lineStyle: 0,
      lineType: 0,
      priceLineVisible: true,
      priceLineSource: 0,
      priceLineWidth: CHART_COLORS.PRICE_LINE.width,
      priceLineColor: CHART_COLORS.PRICE_LINE.color,
      priceLineStyle: CHART_COLORS.PRICE_LINE.style,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: "#ffffff",
      crosshairMarkerBackgroundColor: CHART_COLORS.PRIMARY.lineColor,
      crosshairMarkerBorderWidth: 2,
      lastValueVisible: true,
    };
  };

  const createCrosshairMoveHandler = (
    _chart: IChartApi,
    areaSeries: ISeriesApi<"Area">,
    chartContainer: HTMLElement,
    chartElement: HTMLElement
  ) => {
    return (param: CrosshairParam) => {
      if (!param.point || !param.time || !chartContainer) {
        showTooltip.value = false;
        return;
      }

      const priceData = param.seriesData.get(areaSeries);

      if (!priceData) {
        showTooltip.value = false;
        return;
      }

      const chartRect = chartElement?.getBoundingClientRect();
      if (!chartRect) return;

      const x = param.point.x;
      const y = param.point.y;

      tooltipX.value = Math.min(x + 15, chartRect.width - 150);
      tooltipY.value = Math.max(y - 15, 10);

      const decimals = getDecimalPlaces((priceData as { value: number }).value);

      tooltipData.value = {
        price: (priceData as { value: number }).value.toFixed(decimals),
        time: formatTime(param.time, false),
      };

      showTooltip.value = true;
    };
  };

  const createResizeObserver = (
    chart: IChartApi,
    element: HTMLElement
  ): ResizeObserver => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (chart && entries.length > 0) {
        const contentRect = entries[0]?.contentRect;
        if (contentRect) {
          chart.applyOptions({
            width: contentRect.width,
            height: contentRect.height,
          });
        }
      }
    });

    resizeObserver.observe(element);
    return resizeObserver;
  };

  const initializeChart = (
    chartElement: HTMLElement,
    data: ChartDataConfig,
    options: Record<string, unknown> = {}
  ): { chart: IChartApi; areaSeries: ISeriesApi<"Area"> } => {
    if (!chartElement || !data) {
      throw new Error("Chart element and data are required");
    }

    try {
      const chart = createChart(chartElement, getChartOptions(options));
      const areaSeries = chart.addSeries(AreaSeries, getAreaSeriesOptions());

      const { priceData } = convertDataToLightweightFormat(data);
      if (priceData.length > 0) {
        areaSeries.setData(
          priceData as unknown as Parameters<typeof areaSeries.setData>[0]
        );
        chart.timeScale().fitContent();
      }

      return { chart, areaSeries };
    } catch (error) {
      console.error("Error initializing chart:", error);
      throw error;
    }
  };

  return {
    showTooltip,
    tooltipX,
    tooltipY,
    tooltipData,
    convertDataToLightweightFormat,
    getChartOptions,
    getAreaSeriesOptions,
    createCrosshairMoveHandler,
    createResizeObserver,
    initializeChart,
  };
}
