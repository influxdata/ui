export default register =>
  register({
    type: 'downsample',
    init: () => ({
      name: 'Example: Demo Data Notebook',
      readOnly: false,
      range: {
        duration: '5m',
        label: 'Past 5m',
        lower: 'now() - 5m',
        seconds: 300,
        type: 'selectable-duration',
        upper: null,
        windowPeriod: 10000,
      },
      refresh: {
        duration: null,
        inactivityTimeout: 0,
        infiniteDuration: false,
        interval: 0,
        status: 'paused',
      },
      pipes: [
        {
          mode: 'preview',
          text:
            'The goal of this example Notebook is to get you working with data in the InfluxDB Cloud developer platform. \n\n#### 5 Ways to Use Notebooks in this Example:\n1. Select `input`\n2. Transform data with a `downsample` example\n3. Write data to a new Bucket once\n4. Output the workflow to repeat on as schedule as a `Task`',
          type: 'markdown',
          title: '👋  Hello world',
          visible: true,
        },
        {
          mode: 'preview',
          text:
            'In the Input/Metric Selector panel, select the demo data bucket `Website Monitoring Bucket` \nThen select `response_time`\n\n// No Website Monitoring Bucket? You can add this demo data for free with one click by going to Load Data in main navigation > Buckets Tab > Clicking Add Demo Data Button. [Learn More](https://docs.influxdata.com/influxdb/cloud/write-data/#add-a-demo-data-bucket)',
          type: 'markdown',
          title: 'Step 1  - Search Inputs',
          visible: true,
        },
        {
          aggregateFunction: {
            name: 'mean',
          },
          bucket: {
            name: 'Website Monitoring Bucket',
          },
          field: 'response_time',
          measurement: '',
          tags: {},
          type: 'metricSelector',
          title: 'Select Input Metric',
          visible: true,
        },
        {
          functions: [
            {
              name: 'mean',
            },
          ],
          panelHeight: 200,
          panelVisibility: 'visible',
          period: '10s',
          properties: {
            axes: {
              x: {
                base: '10',
                bounds: ['', ''],
                label: '',
                prefix: '',
                scale: 'linear',
                suffix: '',
              },
              y: {
                base: '10',
                bounds: ['', ''],
                label: '',
                prefix: '',
                scale: 'linear',
                suffix: '',
              },
            },
            colors: [
              {
                hex: '#31C0F6',
                id: 'd001b766-bf5c-4ae3-a867-9a3774849cc1',
                name: 'Nineteen Eighty Four',
                type: 'scale',
                value: 0,
              },
              {
                hex: '#A500A5',
                id: '547f5c28-4e2a-4c06-af49-a02e6fd11c5f',
                name: 'Nineteen Eighty Four',
                type: 'scale',
                value: 0,
              },
              {
                hex: '#FF7E27',
                id: '3c0dadaf-f8aa-45a4-ba1a-3597b685b76f',
                name: 'Nineteen Eighty Four',
                type: 'scale',
                value: 0,
              },
            ],
            generateXAxisTicks: [],
            generateYAxisTicks: [],
            geom: 'line',
            hoverDimension: 'auto',
            legendOpacity: 1,
            legendOrientationThreshold: 100000000,
            note: '',
            position: 'overlaid',
            queries: [
              {
                builderConfig: {
                  aggregateWindow: {
                    fillValues: false,
                    period: 'auto',
                  },
                  buckets: [],
                  functions: [
                    {
                      name: 'mean',
                    },
                  ],
                  tags: [
                    {
                      aggregateFunctionType: 'filter',
                      key: '_measurement',
                      values: [],
                    },
                  ],
                },
                editMode: 'builder',
                name: '',
                text: '',
              },
            ],
            shape: 'chronograf-v2',
            showNoteWhenEmpty: false,
            staticLegend: {
              heightRatio: 0.2,
              hide: true,
              widthRatio: 1,
            },
            type: 'xy',
            xColumn: null,
            xTickStart: null,
            xTickStep: null,
            xTotalTicks: null,
            yColumn: null,
            yTickStart: null,
            yTickStep: null,
            yTotalTicks: null,
          },
          type: 'visualization',
          title: 'Visualize response_time',
          visible: true,
        },
        {
          mode: 'preview',
          text:
            'One of the most common use cases for InfluxDB is downsampling data to reduce the overall disk usage as data collects over time.\n\nThis is done by aggregating data within windows of time, then storing the aggregate value in a new bucket.',
          type: 'markdown',
          title: "Step 2 - Let's Downsample",
          visible: true,
        },
        {
          activeQuery: 0,
          queries: [
            {
              builderConfig: {
                buckets: [],
                functions: [],
                tags: [],
              },
              editMode: 'advanced',
              text:
                '// __Previous_Result__ uses data from all the panels above it as an input to the Flux function\n__PREVIOUS_RESULT__\n\n  // This Flux function windows and aggregates the data in to 15m averages\n|> aggregateWindow(fn: mean, every: 15m)',
            },
          ],
          type: 'rawFluxEditor',
          title: 'Downsample with Flux',
          visible: true,
        },
        {
          mode: 'preview',
          text:
            "You might want to keep your downsampled data separate from your raw data with a longer retention policy.\n\nSelect a separate bucket or create a new one from the dropdown in the next output cell.\n\nThis generates:\n\n`|> to(bucket: 'YOUR NEW BUCKET')`\n\nBonus: You can switch the notebook mode from Preview to Run to write this data to the new bucket manually.\n",
          type: 'markdown',
          title: 'Step 3 - Select Output',
          visible: true,
        },
        {
          type: 'toBucket',
          bucket: {
            name: '_tasks',
          },
          title: 'Output to New Bucket',
          visible: true,
        },
        {
          mode: 'preview',
          text:
            "Run all the steps in this notebook continuously by clicking Export as Task in your Output cell above\n\nThe Flux code generated by this entire notebook looks like this:\n```\noption v = {\n  timeRangeStart: -15m,\n  timeRangeStop: now(),\n  windowPeriod: 5m\n}\n\noption task = { \n  name: 'Downsample Task',\n  every: 15m,\n  offset: 0s\n}\n\nfrom(bucket: 'Website Monitoring Bucket') \n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop) \n  |> filter(fn: (r) => r['_field'] == 'response_time')\n\n  \n\n  |> aggregateWindow(fn: mean, every: 15m) \n  |> to(bucket: 'Downsampled Website Monitoring')\n  ```\n\n[Learn More about Tasks](https://docs.influxdata.com/influxdb/cloud/process-data/get-started/)",
          type: 'markdown',
          title: 'Step 4 - Repeat as a Task',
          visible: true,
        },
        {
          mode: 'preview',
          text:
            'Invite your team to start collaborating on your data with notebooks 🤝\n\nAdd your team now by going to the /users page\n\nRepeat after me: The team that builds together, stays together\n',
          type: 'markdown',
          title: "🎉   That's it!",
          visible: true,
        },
      ],
    }),
  })
