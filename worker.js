// const framerate = 60
//
// function distance (pointA, pointB) {
//   const dX = pointA[0] - pointB[0]
//   const dY = pointA[1] - pointB[1]
//   return Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2))
// }
//
// function pixelBrightness (pixel) {
//   const r = pixel[0]
//   const g = pixel[1]
//   const b = pixel[2]
//
//   // https://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
//   return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
// }
//
// function computeAverage (arr) {
//   return arr.reduce((total, score) => total + score) / arr.length
// }
//
// function evaluateSegment (segment, getPixel, fn, resolution) {
//   const length = distance(segment[0], segment[1])
//   const minumumSamples = Math.floor(length / resolution)
//
//   const usedResolution = length / (minumumSamples + 1)
//   const samples = Math.round(length / usedResolution)
//
//   const dX = segment[1][0] - segment[0][0]
//   const dY = segment[1][1] - segment[0][1]
//
//   const average = Array(samples + 1).fill(null)
//     .map((u, i) => i)
//     .map((i) => ([
//       segment[0][0] + dX / samples * i,
//       segment[0][1] + dY / samples * i
//     ]))
//     .map((point) => getPixel(point[0], point[1]))
//     .map(fn)
//     .reduce((total, score) => total + score) / (samples + 1)
//
//   return average
// }
//
// function evaluatePolygon (polygon, getPixel, fn, resolution) {
//   const segmentScores = Array(polygon.length - 1).fill(null)
//     .map((u, i) => i)
//     .map((index) => ([
//       polygon[index],
//       polygon[index + 1]
//     ]))
//     .map((segment) => evaluateSegment(segment, getPixel, fn, resolution))
//
//   return segmentScores
// }
//
// function getRandomIndex (length) {
//   return Math.floor(Math.random() * ((length - 1) + 1))
// }
//
// const searchSize = 5
// const resolution = 5
//
// function searchStep (polygon, getPixel) {
//   const currentScores = evaluatePolygon(polygon, getPixel, pixelBrightness, resolution)
//
//   const newPolygon = polygon.slice()
//   const moveIndex = getRandomIndex(newPolygon.length - 1)
//   const movePoint = newPolygon[moveIndex]
//
//   newPolygon[moveIndex] = [
//     movePoint[0] + searchSize * Math.random() - 0.5 * searchSize,
//     movePoint[1] + searchSize * Math.random() - 0.5 * searchSize
//   ]
//
//   if (moveIndex === 0) {
//     polygon[polygon.length - 1] = polygon[0]
//   }
//
//   const newScores = evaluatePolygon(newPolygon, getPixel, pixelBrightness, resolution)
//
//   if (computeAverage(newScores) < computeAverage(currentScores)) {
//     return {
//       polygon: newPolygon,
//       scores: newScores
//     }
//   }
// }
//
// const maxFailCount = 300
//
// function jiggle (polygon, getPixel, maxSteps) {
//   console.log('Start jiggling!')
//
//   let scores
//   let lastMessageTimestamp = 0
//
//   let failCount = 0
//   let successCount = 0
//   for (let step = 0; step < maxSteps; step++) {
//     const results = searchStep(polygon, getPixel)
//
//     if (results) {
//       failCount = 0
//       polygon = results.polygon
//       scores = results.scores
//       successCount += 1
//     } else {
//       failCount += 1
//     }
//
//     if (failCount > maxFailCount) {
//       break
//     }
//
//     const timestamp = new Date().getTime()
//     if (timestamp - lastMessageTimestamp > (1000 / framerate)) {
//       self.postMessage({
//         polygon,
//         scores
//       })
//       lastMessageTimestamp = timestamp
//     }
//   }
//
//   console.log('  Success:', successCount, '  Failed:', failCount)
//   // return polygon + scores per segment
//   return {
//     polygon,
//     scores
//   }
// }
//
// function getPixelFromArray (pixels, width, height) {
//   return function (x, y) {
//     // Or interpolate color value?
//
//     const index = (Math.round(y) * (width - 1) + Math.round(x)) * 4
//     return pixels.slice(index, index + 4)
//   }
// }
//
// self.addEventListener('message', (event) => {
//   const message = event.data
//
//   let polygon = message.polygon
//   const dimensions = message.dimensions
//   const stepCount = message.stepCount
//   const pixels = new Uint8ClampedArray(message.buffer)
//
//   const getPixel = getPixelFromArray(pixels, dimensions[0], dimensions[1])
//   const results = jiggle(polygon, getPixel, stepCount)
//
//   self.postMessage(results)
//   self.postMessage(false)
//
//   self.close()
// })
