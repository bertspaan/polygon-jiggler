const IMAGE_URL = '510d47e0-bf3e-a3d9-e040-e00a18064a99.jpg'

//
//
// const url = '510d47e0-bf3e-a3d9-e040-e00a18064a99.jpg'
//
// const polygonCanvas = document.getElementById('polygon-canvas')
// const polygonCtx = polygonCanvas.getContext('2d')
//
// const imageElement = document.getElementById('image')
//
// const img = new Image
//
// let imageCanvas
//
// let workerRunning = false
//
// let polygon = []
// let drawing = true
//
// let worker
//
// function startJiggling () {
//   worker = new Worker('worker.js')
//
//   worker.addEventListener('error', (event) => {
//     console.error(event.message)
//   })
//
//   worker.addEventListener('message', (event) => {
//     if (event && event.data) {
//       const results = event.data
//
//       polygon = event.data.polygon
//       const scores = event.data.scores
//       draw(polygon, scores)
//     } else {
//       workerRunning = false
//     }
//   })
//
//   const imageData = imageCanvas.getContext('2d').getImageData(0, 0, imageCanvas.width, imageCanvas.height)
//   const buffer = imageData.data.buffer
//
//   worker.postMessage({
//     stepCount: 1000,
//     buffer,
//     dimensions: [imageData.width, imageData.height],
//     polygon
//   }, [buffer])
//
//   workerRunning = true
//   // window.requestAnimationFrame(step)
// }
//
// // function step (timestamp) {
// //   draw(polygon)
// //
// //   if (running) {
// //     window.requestAnimationFrame(step)
// //   }
// // }
//
// img.addEventListener('load', () => {
//   polygonCanvas.height = img.height
//   polygonCanvas.width = img.width
//
//   polygonCanvas.style.height = img.height + 'px'
//   polygonCanvas.style.width = img.width + 'px'
//
//   imageElement.src = url
//
//   imageCanvas = document.createElement('canvas')
//   imageCanvas.width = img.width
//   imageCanvas.height = img.height
//   imageCanvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height)
// })
//
// img.src = url
//
// function getLineColor (value, alpha=0.9) {
//   const r = Math.round(255 * value)
//   const g = Math.round(255 * (1 - value))
//   const b = 0
//   return `rgba(${r}, ${g}, ${b}, ${alpha})`
// }
//
// function draw (polygon, scores) {
//   polygonCtx.clearRect(0, 0, polygonCanvas.width, polygonCanvas.height)
//
//   polygonCtx.beginPath()
//
//   const lineWidth = 5
//
//   polygonCtx.lineWidth = lineWidth
//   polygonCtx.fillStyle = 'red'
//
//   if (polygon.length > 1) {
//     polygon.slice(1)
//       .forEach((point, index) => {
//         if (scores && scores[index]) {
//           polygonCtx.strokeStyle = getLineColor(scores[index])
//         } else {
//           polygonCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
//         }
//
//         polygonCtx.beginPath()
//
//         const pointA = polygon[index]
//         const pointB = polygon[index + 1]
//
//         polygonCtx.moveTo(pointA[0], pointA[1])
//         polygonCtx.lineTo(pointB[0], pointB[1])
//         polygonCtx.stroke()
//       })
//   }
//
//   polygonCtx.lineWidth = 0
//   polygonCtx.fillStyle = 'black'
//
//   polygon.forEach((point) => {
//     polygonCtx.beginPath()
//     polygonCtx.arc(point[0], point[1], lineWidth * 2, 0, 2 * Math.PI)
//     polygonCtx.fill()
//   })
//
//   polygonCtx.stroke()
// }
//
// function distance (pointA, pointB) {
//   const dX = pointA[0] - pointB[0]
//   const dY = pointA[1] - pointB[1]
//   return Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2))
// }
//
// const distanceThreshold = 20
//
// polygonCanvas.addEventListener('click', (event) => {
//   if (!drawing) {
//     return
//   }
//
//   const point = [event.layerX, event.offsetY]
//
//   if (polygon.length >= 3 && distance(polygon[0], point) < distanceThreshold) {
//     polygon.push(polygon[0])
//     drawing = false
//   } else {
//     polygon.push(point)
//   }
//
//   draw(polygon)
// })
//
// document.getElementById('reset').addEventListener('click', () => {
//   drawing = true
//   polygon = []
//   draw(polygon)
// })
//
// document.getElementById('again').addEventListener('click', () => {
//   startJiggling()
// })


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
  const edgeScores = Array(polygon.length - 1).fill(null)
    .map((u, i) => i)
    .map((index) => ([
      polygon[index],
      polygon[index + 1]
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

const searchSize = 10
const resolution = 5

function searchStep (polygon, getPixel, fn, resolution) {
  const currentEdgeScores = evaluatePolygon(polygon, getPixel, fn, resolution)

  const newPolygon = polygon.slice()
  const moveIndex = getRandomIndex(newPolygon.length - 1)
  const movePoint = newPolygon[moveIndex]

  newPolygon[moveIndex] = [
    movePoint[0] + searchSize * Math.random() - 0.5 * searchSize,
    movePoint[1] + searchSize * Math.random() - 0.5 * searchSize
  ]

  if (moveIndex === 0) {
    polygon[polygon.length - 1] = polygon[0]
  }

  const newEdgeScores = evaluatePolygon(newPolygon, getPixel, pixelBrightness, resolution)

  if (computeAverage(newEdgeScores) < computeAverage(currentEdgeScores)) {
    return {
      polygon: newPolygon,
      edgeScores: newEdgeScores
    }
  }
}

const maxFailCount = 300
const maxSteps = 5000
const framerate = 30

function startJiggling(vnode) {
  console.log('Start jiggling!')

  const getPixel = getBlurredPixel(vnode, 25)
  const fn = pixelBrightness

  let lastMessageTimestamp = 0

  let failCount = 0
  let successCount = 0

  let step = 0
  function jiggle () {
    step += 1

    const results = searchStep(vnode.state.data.polygon, getPixel, fn, 5)

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
    }
  }

  jiggle()
}

function getBlurredPixel (vnode, blurSize = 5) {
  return function (x, y) {
    const x1 = Math.max(0, Math.round(x - blurSize / 2))
    const y1 = Math.max(0, Math.round(y - blurSize / 2))

    const x2 = Math.min(vnode.state.data.dimensions.width, Math.round(x + blurSize / 2))
    const y2 = Math.min(vnode.state.data.dimensions.height, Math.round(y + blurSize / 2))

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
  if (index >= 0 && index < vnode.state.data.polygon.length - 1) {
    const pointA = vnode.state.data.polygon[index]
    const pointB = vnode.state.data.polygon[index + 1]
    const getPixel = getBlurredPixel(vnode, 25)

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
    jiggling: false,
    drawing: false
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
          startJiggling(vnode)
        }
      }, 'Run!'),
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
              stroke: getLineColor(vnode.state.data.edgeScores[index]),
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
