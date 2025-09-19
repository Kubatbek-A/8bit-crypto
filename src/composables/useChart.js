import { ref } from "vue";
import { createChart, ColorType, AreaSeries } from "lightweight-charts";
import {
  CHART_COLORS,
  CHART_DIMENSIONS,
  CHART_TIME_CONFIG,
} from "../constants/chart.js";
import { useFormatters } from "./useFormatters.js";

export function useChart() {
  const {
    formatTime,
    formatChartTime,
    getDecimalPlaces,
    getConsistentTimezone,
  } = useFormatters();

  const showTooltip = ref(false);
  const tooltipX = ref(0);
  const tooltipY = ref(0);
  const tooltipData = ref(null);

  const convertDataToLightweightFormat = (chartData) => {
    if (!chartData?.datasets?.[0]?.data) {
      return { priceData: [] };
    }

    const prices = chartData.datasets[0].data;
    const now = Math.floor(Date.now() / 1000);

    const priceData = prices.map((price, index) => {
      const timeOffset =
        (prices.length - 1 - index) * CHART_TIME_CONFIG.TIME_STEP;
      const timestamp = now - timeOffset;

      return {
        time: timestamp,
        value: parseFloat(price),
      };
    });

    priceData.sort((a, b) => a.time - b.time);

    return { priceData };
  };

  const getChartOptions = (customOptions = {}) => {
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
        tickMarkFormatter: (time) => {
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

  const getAreaSeriesOptions = () => {
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
    chart,
    areaSeries,
    chartContainer,
    chartElement
  ) => {
    return (param) => {
      if (!param.point || !param.time || !chartContainer) {
        showTooltip.value = false;
        return;
      }

      const priceData = param.seriesData.get(areaSeries);

      if (!priceData) {
        showTooltip.value = false;
        return;
      }

      const chartRect = chartElement.getBoundingClientRect();

      const x = param.point.x;
      const y = param.point.y;

      tooltipX.value = Math.min(x + 15, chartRect.width - 150);
      tooltipY.value = Math.max(y - 15, 10);

      const decimals = getDecimalPlaces(priceData.value);

      tooltipData.value = {
        price: priceData.value.toFixed(decimals),
        time: formatTime(param.time, false),
      };

      showTooltip.value = true;
    };
  };

  /**
   * Create resize observer for chart
   * @param {Object} chart - Chart instance
   * @param {Object} element - Element to observe
   * @returns {ResizeObserver} Resize observer instance
   */
  const createResizeObserver = (chart, element) => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (chart && entries.length > 0) {
        const { width, height } = entries[0].contentRect;
        chart.applyOptions({ width, height });
      }
    });

    resizeObserver.observe(element);
    return resizeObserver;
  };

  /**
   * Initialize chart with data
   * @param {HTMLElement} chartElement - Chart container element
   * @param {Object} data - Chart data
   * @param {Object} [options={}] - Chart options
   * @returns {Object} Chart and series instances
   */
  const initializeChart = (chartElement, data, options = {}) => {
    if (!chartElement || !data) {
      throw new Error("Chart element and data are required");
    }

    try {
      const chart = createChart(chartElement, getChartOptions(options));
      const areaSeries = chart.addSeries(AreaSeries, getAreaSeriesOptions());

      const { priceData } = convertDataToLightweightFormat(data);
      if (priceData.length > 0) {
        areaSeries.setData(priceData);
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
