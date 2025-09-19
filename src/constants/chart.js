export const CHART_COLORS = {
  PRIMARY: {
    lineColor: "#2296f3",
    topColor: "#2296f3",
    bottomColor: "rgba(41, 98, 255, 0.28)",
  },
  PRICE_LINE: {
    color: "#2296f3",
    width: 1,
    style: 3,
  },
  GRID: {
    vertLines: "rgba(43, 49, 57, 0.2)",
    horzLines: "rgba(43, 49, 57, 0.2)",
  },
  CROSSHAIR: {
    color: "#758696",
    labelBackground: "#363c4e",
  },
  TEXT: "#848e9c",
};

export const CHART_DIMENSIONS = {
  DEFAULT_HEIGHT: 400,
  MOBILE_HEIGHT: 300,
  PADDING: {
    TOP: 0.05,
    BOTTOM: 0.05,
  },
  SPACING: {
    BAR: 6,
    MIN_BAR: 2,
    RIGHT_OFFSET: 10,
  },
};

export const CHART_TIME_CONFIG = {
  TIME_STEP: 300, // 5 minutes between data points
  VISIBLE_SECONDS: false,
  VISIBLE_TIME: true,
};
