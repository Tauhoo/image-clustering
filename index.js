var png = require('png-js')
var scatter = require('ervy/lib/scatter')
var { bg, fg } = require('ervy/lib/utils')
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
function updateClusters(clusters, groups) {
  newClusters = clusters.map((value, index) => ({
    sumColor: 0,
    sumIndex: 0,
    count: 0,
  }))
  groups.forEach(({ color, index, cluster }) => {
    let { sumColor, sumIndex, count } = newClusters[cluster]
    if (cluster === 3) console.log(sumColor, sumIndex, count)
    newClusters[cluster] = {
      sumColor: sumColor + color,
      sumIndex: sumIndex + index,
      count: count + 1,
    }
  })
  return newClusters.map(({ sumColor, sumIndex, count }) => ({
    color: count === 0 ? 0 : Math.floor(sumColor / count),
    index: count === 0 ? 0 : Math.floor(sumIndex / count),
  }))
}
png.decode('./images/smalltest.png', pixels => {
  groups = []
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
  newClusters = updateClusters(clusters, groups)
  colors = ['red', 'green', 'blue', 'yellow']
  scatterData = groups.map(({ color, index, cluster }) => ({
    key: cluster + '',
    value: [index, color],
    style: fg(colors[cluster], '*'),
  }))
  console.log(scatter(scatterData, { legendGap: 100, width: 50, height: 50 }))
  /*
  while (!isClusterEqual(clusters, newClusters)) {
  groups = group(newClusters, pixels)
  clusters = newClusters
  newClusters = updateClusters(clusters, groups)
  }*/
})
