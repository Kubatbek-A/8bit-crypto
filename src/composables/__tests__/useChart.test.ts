import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useChart } from "../useChart";
import { createChart } from "lightweight-charts";
import type { ChartDataConfig } from "../../types";

// Mock lightweight-charts
vi.mock("lightweight-charts", () => ({
  createChart: vi.fn(),
  ColorType: {
    Solid: "solid",
  },
  AreaSeries: "AreaSeries",
}));

describe("useChart", () => {
  let chart: ReturnType<typeof useChart>;
  let mockChartInstance: any;
  let mockAreaSeries: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAreaSeries = {
      setData: vi.fn(),
      applyOptions: vi.fn(),
    };

    mockChartInstance = {
      addSeries: vi.fn().mockReturnValue(mockAreaSeries),
      timeScale: vi.fn().mockReturnValue({
        fitContent: vi.fn(),
      }),
      applyOptions: vi.fn(),
    };

    vi.mocked(createChart).mockReturnValue(mockChartInstance);

    chart = useChart();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize chart with correct options", () => {
    const container = document.createElement("div");
    const data: ChartDataConfig = {
      labels: [],
      datasets: [
        {
          data: [100, 105, 110],
          label: "Price",
          borderColor: "red",
          backgroundColor: "red",
          fill: true,
          tension: 0.1,
        },
      ],
    };

    const result = chart.initializeChart(container, data, {});

    expect(createChart).toHaveBeenCalledWith(container, expect.any(Object));
    expect(mockChartInstance.addSeries).toHaveBeenCalledWith(
      "AreaSeries",
      expect.any(Object)
    );
    expect(result.chart).toBe(mockChartInstance);
    expect(result.areaSeries).toBe(mockAreaSeries);
  });

  it("should convert data to lightweight format", () => {
    const data: ChartDataConfig = {
      labels: [],
      datasets: [
        {
          data: [100, 105, 110],
          label: "Price",
          borderColor: "red",
          backgroundColor: "red",
          fill: true,
          tension: 0.1,
        },
      ],
    };

    const result = chart.convertDataToLightweightFormat(data);

    expect(result.priceData).toHaveLength(3);
    expect(result.priceData[0]).toHaveProperty("time");
    expect(result.priceData[0]).toHaveProperty("value", 100);
  });

  it("should handle empty data", () => {
    const data: ChartDataConfig = {
      labels: [],
      datasets: [],
    };

    const result = chart.convertDataToLightweightFormat(data);

    expect(result.priceData).toHaveLength(0);
  });

  it("should get chart options", () => {
    const options = chart.getChartOptions();

    expect(options).toHaveProperty("layout");
    expect(options).toHaveProperty("grid");
    expect(options).toHaveProperty("crosshair");
    expect(options).toHaveProperty("rightPriceScale");
    expect(options).toHaveProperty("timeScale");
  });

  it("should get area series options", () => {
    const options = chart.getAreaSeriesOptions();

    expect(options).toHaveProperty("lineColor");
    expect(options).toHaveProperty("topColor");
    expect(options).toHaveProperty("bottomColor");
    expect(options).toHaveProperty("lineWidth");
  });

  it("should create crosshair move handler", () => {
    const container = document.createElement("div");
    const chartElement = document.createElement("div");

    const handler = chart.createCrosshairMoveHandler(
      mockChartInstance,
      mockAreaSeries,
      container,
      chartElement
    );

    expect(typeof handler).toBe("function");
  });

  it("should create resize observer", () => {
    const element = document.createElement("div");

    // Mock ResizeObserver
    const mockResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    global.ResizeObserver = mockResizeObserver;

    const observer = chart.createResizeObserver(mockChartInstance, element);

    expect(observer).toBeDefined();
    expect(mockResizeObserver).toHaveBeenCalled();
  });

  it("should throw error for invalid inputs", () => {
    expect(() => chart.initializeChart(null as any, {} as any, {})).toThrow(
      "Chart element and data are required"
    );
    expect(() =>
      chart.initializeChart(document.createElement("div"), null as any, {})
    ).toThrow("Chart element and data are required");
  });

  it("should handle tooltip state", () => {
    expect(chart.showTooltip.value).toBe(false);
    expect(chart.tooltipX.value).toBe(0);
    expect(chart.tooltipY.value).toBe(0);
    expect(chart.tooltipData.value).toBe(null);
  });
});
