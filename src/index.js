const IMAGE_URL = '510d47e0-bf3e-a3d9-e040-e00a18064a99.jpg'
const LINE_SAMPLE_RESOLUTION = 5
const SEARCH_SIZE = 20

const maxFailCount = 300
const maxSteps = 1000
const framerate = 30

function pixelBrightness (pixel) {
  const r = pixel[0]
  const g = pixel[1]
  const b = pixel[2]

  // https://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

function distance (pointA, pointB) {
  const dX = pointA[0] - pointB[0]
  const dY = pointA[1] - pointB[1]
  return Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2))
}

function getLineColor (value, alpha=0.9) {
  const r = Math.round(255 * value)
  const g = Math.round(255 * (1 - value))
  const b = 0
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function evaluateEdge (pointA, pointB, getPixel, fn, resolution) {
  const length = distance(pointA, pointB)

  if (length === 0) {
    return 0
  }

  const minumumSamples = Math.floor(length / resolution)

  const usedResolution = length / (minumumSamples + 1)
  const samples = Math.round(length / usedResolution)

  const dX = pointB[0] - pointA[0]
  const dY = pointB[1] - pointA[1]

  const average = Array(samples + 1).fill(null)
    .map((u, i) => i)
    .map((i) => ([
      pointA[0] + dX / samples * i,
      pointA[1] + dY / samples * i
    ]))
    .map((point) => getPixel(point[0], point[1]))
    .map(fn)
    .reduce((total, score) => total + score) / (samples + 1)

  return average
}

function evaluatePolygon (polygon, getPixel, fn, resolution) {
  const edgeScores = Array(polygon.length).fill(null)
    .map((u, i) => i)
    .map((index) => ([
      polygon[index],
      polygon[(index + 1) % polygon.length]
    ]))
    .map((edge) => evaluateEdge(edge[0], edge[1], getPixel, fn, resolution))

  return edgeScores
}

function getRandomIndex (length) {
  return Math.floor(Math.random() * ((length - 1) + 1))
}

function computeAverage (arr) {
  return arr.reduce((total, score) => total + score) / arr.length
}

function searchStep (polygon, dimensions, getPixel, fn, searchSize, resolution) {
  const currentEdgeScores = evaluatePolygon(polygon, getPixel, fn, resolution)

  const newPolygon = polygon.slice()
  const moveIndex = getRandomIndex(newPolygon.length)
  const movePoint = newPolygon[moveIndex]

  newPolygon[moveIndex] = [
    Math.min(Math.max(0, movePoint[0] + searchSize * Math.random() - 0.5 * searchSize), dimensions.width - 1),
    Math.min(Math.max(0, movePoint[1] + searchSize * Math.random() - 0.5 * searchSize), dimensions.height - 1)
  ]

  const newEdgeScores = evaluatePolygon(newPolygon, getPixel, pixelBrightness, resolution)

  if (computeAverage(newEdgeScores) < computeAverage(currentEdgeScores)) {
    return {
      polygon: newPolygon,
      edgeScores: newEdgeScores
    }
  }
}

function startJiggling(vnode) {
  console.log('Start jiggling!')

  const getPixel = getBlurredPixel(vnode)
  const fn = pixelBrightness

  let lastMessageTimestamp = 0

  let failCount = 0
  let successCount = 0

  let step = 0
  function jiggle () {
    step += 1

    const results = searchStep(vnode.state.data.polygon, vnode.state.data.dimensions, getPixel, fn, SEARCH_SIZE, LINE_SAMPLE_RESOLUTION)

    if (results) {
      failCount = 0

      vnode.state.data.polygon = results.polygon
      vnode.state.data.edgeScores = results.edgeScores
      successCount += 1
    } else {
      failCount += 1
    }

    const timestamp = new Date().getTime()
    if (timestamp - lastMessageTimestamp > (1000 / framerate)) {
      m.redraw()
      lastMessageTimestamp = timestamp
    }

    if (step < maxSteps && failCount < maxFailCount) {
      setTimeout(jiggle, 1)
    } else {
      console.log('Done!')
      m.redraw()
    }
  }

  jiggle()
}

function getBlurredPixel (vnode) {
  const blurRadius = vnode.state.data.blurRadius

  return function (x, y) {
    const x1 = Math.max(0, Math.round(x - blurRadius / 2))
    const y1 = Math.max(0, Math.round(y - blurRadius / 2))

    const x2 = Math.min(vnode.state.data.dimensions.width - 1, Math.round(x + blurRadius / 2))
    const y2 = Math.min(vnode.state.data.dimensions.height - 1, Math.round(y + blurRadius / 2))
    // console.log(x1, y1, x2 - x1, y2 - y1)
    const imageData = vnode.state.data.imageContext.getImageData(x1, y1, x2 - x1, y2 - y1)

    const blurredPixelCount = imageData.data.length / 4
    const average = Array(blurredPixelCount).fill(null)
      .map((index) => ([
        imageData.data[index * 4],
        imageData.data[index * 4 + 1],
        imageData.data[index * 4 + 2]
      ]))
      .reduce((total, color) => total.map((n, i) => n + color[i]), [0, 0, 0])
      .map((n) => n / blurredPixelCount)

    return average
  }
}

function updateEdgeScore(vnode, index) {
  index = (index + vnode.state.data.polygon.length) % vnode.state.data.polygon.length
  if (index >= 0 && index < vnode.state.data.polygon.length ) {
    const pointA = vnode.state.data.polygon[index]
    const pointB = vnode.state.data.polygon[(index + 1) % vnode.state.data.polygon.length]
    const getPixel = getBlurredPixel(vnode)

    const edgeScore = evaluateEdge(pointA, pointB, getPixel, pixelBrightness, 5)
    vnode.state.data.edgeScores[index] = edgeScore
  }
}

const App = {
  data: {
    polygon: [],
    edgeScores: [],
    dimensions: {
      width: 0,
      height: 0
    },
    draggingIndex: -1,
    draggingMoved: false,
    blurRadius: 25
  },
  view: (vnode) => ([
    m('header', [
      m('h1', 'Polygon Jiggler')
    ]),
    m('main', [
      m('button', {
        onclick: (event) => {
          vnode.state.data.polygon = []
          vnode.state.data.edgeScores = []
        }
      }, 'Reset'),
      m('button', {
        onclick: (event) => {
          startJiggling(vnode, vnode.state.data.blurRadius)
        }
      }, 'Run!'),
      m('input', {
        type: 'range',
        min: 1,
        oninput: (event) => {
          vnode.state.data.blurRadius = parseInt(event.target.value)
          vnode.state.data.polygon.forEach((point, index) => {
            updateEdgeScore(vnode, index)
          })
        }
      }),
      m('div', {id: 'canvas-container'}, [
        m('img', {
          id: 'image',
          src: IMAGE_URL,
          onload: (event) => {
            const img = event.target

            vnode.state.data.dimensions = {
              width: img.width,
              height: img.height
            }

            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const context = canvas.getContext('2d')
            context.drawImage(img, 0, 0)
            vnode.state.data.imageContext = context
          }
        }),
        m('svg', {
          id: 'polygon',
          style: {
            width: vnode.state.data.dimensions.width,
            height: vnode.state.data.dimensions.height
          },
          onmousemove: (event) => {
            if (vnode.state.data.draggingIndex === -1) {
              event.redraw = false
              return
            }

            vnode.state.data.draggingMoved = true

            const point = [
              event.offsetX,
              event.offsetY
            ]

            vnode.state.data.polygon[vnode.state.data.draggingIndex] = point

            updateEdgeScore(vnode, vnode.state.data.draggingIndex - 1)
            updateEdgeScore(vnode, vnode.state.data.draggingIndex)
          },
          onmousedown: (event) => {
            const point = [
              event.offsetX,
              event.offsetY
            ]

            vnode.state.data.polygon.push(point)
            updateEdgeScore(vnode, vnode.state.data.polygon.length - 1)
            updateEdgeScore(vnode, vnode.state.data.polygon.length - 2)
          }
        }, [
          m('g', {
            id: 'polygon-edges'
          }, vnode.state.data.polygon
            .map((point, index) => m('line', {
              x1: vnode.state.data.polygon[(index - 1 + vnode.state.data.polygon.length) % vnode.state.data.polygon.length][0],
              y1: vnode.state.data.polygon[(index - 1 + vnode.state.data.polygon.length) % vnode.state.data.polygon.length][1],
              x2: point[0],
              y2: point[1],
              stroke: getLineColor(vnode.state.data.edgeScores[(index - 1 + vnode.state.data.polygon.length) % vnode.state.data.polygon.length]),
              onmousedown: (event) => {
                const point = [
                  event.offsetX,
                  event.offsetY
                ]

                vnode.state.data.polygon.splice(index, 0, point)

                vnode.state.data.edgeScores.splice(index - 1, 0, 0)
                updateEdgeScore(vnode, index - 1)
                updateEdgeScore(vnode, index)

                vnode.state.data.draggingIndex = index
                event.stopPropagation()
              }
            })
          )),
          m('g', {
            id: 'polygon-vertices'
          }, vnode.state.data.polygon
            .map((point, index) => m('circle', {
              cx: point[0],
              cy: point[1],
              r: 6,
              onmousedown: (event) => {
                vnode.state.data.draggingIndex = index
                event.stopPropagation()
              },
              onmouseup: (event) => {
                if (!vnode.state.data.draggingMoved && vnode.state.data.draggingIndex === index) {
                  vnode.state.data.polygon.splice(index, 1)
                  updateEdgeScore(vnode, index - 1)
                }

                vnode.state.data.draggingIndex = -1
                vnode.state.data.draggingMoved = false
                event.stopPropagation()
              }
            }))
          )
        ])
      ])
    ])
  ])
}

m.mount(document.body, App)
