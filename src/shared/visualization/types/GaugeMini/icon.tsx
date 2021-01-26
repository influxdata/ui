import React from 'react'

// created from:
/*
const theme: Required<GaugeMiniLayerConfig> = {
  ...GAUGE_MINI_THEME_PROGRESS_DARK,
  sidePaddings: 5,
  labelMain: "",
  axesSteps: null as any,
  valueFontSize: 45,
  valueHeight: 45,
  gaugeHeight: 45,
  gaugeColors: [
    { value: 0, type: "min", hex: InfluxColors.Mountain },
    { value: 60, type: "threshold", hex: InfluxColors.Viridian },
    { value: 80, type: "threshold", hex: InfluxColors.Honeydew },
    { value: 100, type: "max", hex: InfluxColors.Honeydew },
  ] as Color[],
  valueRounding: 15,
  gaugeRounding: 15,
  colorSecondary: InfluxColors.Obsidian,
  valueFontColorOutside: InfluxColors.Sidewalk,
};


<div style={{ width: 150 }}>
  <GaugeMini value={20} theme={theme} {...{ width: 150, height: 150 / 3 }} />
  <GaugeMini value={60} theme={theme} {...{ width: 150, height: 150 / 3 }} />
  <GaugeMini value={100} theme={theme} {...{ width: 150, height: 150 / 3 }} />
</div>

value color replaced with classes
  .vis-graphic--fill-b 
  .vis-graphic--fill-a 
  .vis-graphic--fill-c

*/

const icon = (
  <div className="vis-graphic" data-testid="vis-graphic--gauge">
    <svg
      width="100%"
      height="100%"
      version="1.1"
      id="Bar"
      x="0px"
      y="0px"
      viewBox="0 0 150 150"
      preserveAspectRatio="none meet"
    >
      <g transform="translate(0,2)">
        <g transform="translate(5,0)">
          <g className="gauge-mini-bar">
            <g transform="translate(0,0)">
              <defs>
                <clipPath id="rounded-bar-w-140-h-45-r-15">
                  <rect rx="15" width="140" height="45" y="0"></rect>
                </clipPath>
              </defs>
              <rect
                height="45"
                x="0"
                width="140"
                fill="#0f0e15"
                clipPath="url(#rounded-bar-w-140-h-45-r-15)"
                y="0"
              ></rect>
              <rect
                className="value-rect vis-graphic--fill-b"
                rx="15"
                height="45"
                width="28"
                x="0"
                y="0"
              ></rect>
              <g transform="translate(0,22.5)">
                <text
                  x="33"
                  textAnchor="start"
                  fontSize="45"
                  fill="#999dab"
                  alignmentBaseline="central"
                >
                  20
                </text>
              </g>
            </g>
          </g>
          <text
            y="22.5"
            x="-10"
            alignmentBaseline="central"
            textAnchor="end"
            fontSize="11"
            fill="#a4a8b6"
          ></text>
        </g>
        <g transform="translate(5,50)">
          <g className="gauge-mini-bar">
            <g transform="translate(0,0)">
              <defs>
                <clipPath id="rounded-bar-w-140-h-45-r-15">
                  <rect rx="15" width="140" height="45" y="0"></rect>
                </clipPath>
              </defs>
              <rect
                height="45"
                x="0"
                width="140"
                fill="#0f0e15"
                clipPath="url(#rounded-bar-w-140-h-45-r-15)"
                y="0"
              ></rect>
              <rect
                className="value-rect vis-graphic--fill-a"
                rx="15"
                height="45"
                width="84"
                x="0"
                y="0"
              ></rect>
              <g transform="translate(0,22.5)">
                <text
                  x="79"
                  textAnchor="end"
                  fontSize="45"
                  fill="#181820"
                  alignmentBaseline="central"
                >
                  60
                </text>
              </g>
            </g>
          </g>
          <text
            y="22.5"
            x="-10"
            alignmentBaseline="central"
            textAnchor="end"
            fontSize="11"
            fill="#a4a8b6"
          ></text>
        </g>
        <g transform="translate(5,100)">
          <g className="gauge-mini-bar">
            <g transform="translate(0,0)">
              <defs>
                <clipPath id="rounded-bar-w-140-h-45-r-15">
                  <rect rx="15" width="140" height="45" y="0"></rect>
                </clipPath>
              </defs>
              <rect
                height="45"
                x="0"
                width="140"
                fill="#0f0e15"
                clipPath="url(#rounded-bar-w-140-h-45-r-15)"
                y="0"
              ></rect>
              <rect
                className="value-rect vis-graphic--fill-c"
                rx="15"
                height="45"
                width="140"
                x="0"
                y="0"
              ></rect>
              <g transform="translate(0,22.5)">
                <text
                  x="135"
                  textAnchor="end"
                  fontSize="45"
                  fill="#181820"
                  alignmentBaseline="central"
                >
                  100
                </text>
              </g>
            </g>
          </g>
          <text
            y="22.5"
            x="-10"
            alignmentBaseline="central"
            textAnchor="end"
            fontSize="11"
            fill="#a4a8b6"
          ></text>
        </g>
      </g>
    </svg>
  </div>
)

export default icon
