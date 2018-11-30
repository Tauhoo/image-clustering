var png = require('png-js')
var fs = require('fs')
var PNG = require('pngjs').PNG
var scatter = require('ervy/lib/scatter')
var { bg, fg } = require('ervy/lib/utils')
function isClusterEqual(firstClusters, secondClusters) {
  for (let [index, cluster1] of firstClusters.entries()) {
    cluster2 = secondClusters[index]
    if (cluster1.color !== cluster2.color) return false
  }
  return true
}
function distance(x1, x2) {
  return Math.sqrt(Math.pow(x1 - x2, 2))
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
    clusters.forEach(({ color }) => {
      distanceFromClusters.push(distance(color, pixelColor))
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
  newClusters = clusters.map(() => ({
    sumColor: 0,
    sumIndex: 0,
    count: 0,
  }))
  groups.forEach(({ color, cluster }) => {
    let { sumColor, count } = newClusters[cluster]
    if (cluster === 3) console.log(sumColor, count)
    newClusters[cluster] = {
      sumColor: sumColor + color,
      count: count + 1,
    }
  })
  return newClusters.map(({ sumColor, count }) => ({
    color: count === 0 ? 0 : Math.floor(sumColor / count),
  }))
}

function createPNG(groups, clusterSelect) {
  var png = new PNG({
    width: 10,
    height: 10,
  })
  data = groups.map(({ color, index, cluster }) => [
    color,
    cluster == clusterSelect,
  ])
  for (var y = 0; y < png.height; y++) {
    for (var x = 0; x < png.width; x++) {
      var idx = (png.width * y + x) << 2
      let select = data[idx][1]
      png.data[idx] = select ? 255 : data[idx]
      png.data[idx + 1] = select ? 218 : data[idx + 1]
      png.data[idx + 2] = select ? 185 : data[idx + 2]
      png.data[idx + 3] = select ? 128 : data[idx + 3]
    }
  }
  png.pack().pipe(fs.createWriteStream('newOut.png'))
}

png.decode('./images/smalltest.png', pixels => {
  groups = []
  clusters = [
    {
      color: 200,
    },
    {
      color: 100,
    },
    {
      color: 50,
    },
    {
      color: 250,
    },
  ]
  groups = group(clusters, pixels)
  newClusters = updateClusters(clusters, groups)
  while (!isClusterEqual(clusters, newClusters)) {
    groups = group(newClusters, pixels)
    clusters = newClusters
    newClusters = updateClusters(clusters, groups)
  }
  console.log(newClusters, groups.length)
  createPNG(groups, 0)
})
