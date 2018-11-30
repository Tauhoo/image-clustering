var png = require('png-js')
function isClusterEqual(firstClusters, secondClusters) {
  for (let [index, cluster1] of firstClusters.entries()) {
    cluster2 = secondClusters[index]
    if (cluster1.index !== cluster2.index) return false
    if (cluster1.color !== cluster2.color) return false
  }
  return true
}
function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}
function Nearest([firstDistance, ...distanceFromClusters]) {
  oldDistance = firstDistance
  oldDistanceIndex = 0
  distanceFromClusters.forEach((distance, index) => {
    if (distance >= oldDistance) {
      oldDistance = distance
      oldDistanceIndex = index
    }
  })
  return oldDistanceIndex
}
function group(clusters, pixels) {
  groups = []
  pixels.forEach((pixelColor, pixelIndex) => {
    distanceFromClusters = []
    clusters.forEach(({ color, index }) => {
      distanceFromClusters.push(distance(color, index, pixelColor, pixelIndex))
    })
    groups.push({
      color: pixelColor,
      index: pixelIndex,
      cluster: Nearest(distanceFromClusters),
    })
  })
  return groups
}
png.decode('./images/smalltest.png', pixels => {
  let groups = []
  clusters = [
    {
      color: 200,
      index: 300,
    },
    {
      color: 100,
      index: 200,
    },
    {
      color: 50,
      index: 100,
    },
    {
      color: 250,
      index: 50,
    },
  ]
  groups = group(clusters, pixels)
})
