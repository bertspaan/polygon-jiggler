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
