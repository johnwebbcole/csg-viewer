const glslify = require('glslify')// -sync') // works in client & server
const mat4 = require('gl-mat4')
const path = require('path')

module.exports = function prepareDrawGrid (regl, params = {}) {
  let positions = []
  const defaults = {
    color: [1, 1, 1, 1],
    ticks: 1,
    size: [16, 16],
    fadeOut: true,
    centered: false,
    lineWidth: 2
  }

  let {size, ticks, fadeOut, centered, lineWidth, color} = Object.assign({}, defaults, params)

  fadeOut = false
  const width = size[0]
  const length = size[1]

  if (centered) {
    const halfWidth = width * 0.5
    const halfLength = length * 0.5

    const remWidth = halfWidth % ticks
    const widthStart = -halfWidth + remWidth
    const widthEnd = -widthStart

    const remLength = halfLength % ticks
    let lengthStart = -halfLength + remLength
    const lengthEnd = -lengthStart

    const skipEvery = 0

    for (let i = widthStart, j = 0; i <= widthEnd; i += ticks, j += 1) {
      if (j % skipEvery !== 0) {
        positions.push(lengthStart, i, 0)
        positions.push(lengthEnd, i, 0)
        positions.push(lengthStart, i, 0)
      }
    }
    for (let i = lengthStart, j = 0; i <= lengthEnd; i += ticks, j += 1) {
      if (j % skipEvery !== 0) {
        positions.push(i, widthStart, 0)
        positions.push(i, widthEnd, 0)
        positions.push(i, widthStart, 0)
      }
    }
  } else {
    for (let i = -width * 0.5; i <= width * 0.5; i += ticks) {
      positions.push(-length * 0.5, i, 0)
      positions.push(length * 0.5, i, 0)
      positions.push(-length * 0.5, i, 0)
    }

    for (let i = -length * 0.5; i <= length * 0.5; i += ticks) {
      positions.push(i, -width * 0.5, 0)
      positions.push(i, width * 0.5, 0)
      positions.push(i, -width * 0.5, 0)
    }
  }

  //fadeOut ? glslify(path.join(__dirname, '/shaders/foggy.frag')) : glslify(path.join(__dirname, '/shaders/grid.frag'))
  const frag = glslify(path.join(__dirname, '/shaders/grid.frag'))

  return regl({
    vert: glslify(path.join(__dirname, '/../basic.vert')),
    frag,

    attributes: {
      position: regl.buffer(positions)
    },
    count: positions.length / 3,
    uniforms: {
      model: (context, props) => props && props.model ? props.model : mat4.identity([]),
      _projection: (context, props) => {
        return mat4.ortho([], -300, 300, 350, -350, 0.01, 1000)
      },
      color: (context, props) => props && props.color ? props.color : color,
      fogColor: (context, props) => props && props.fogColor ? props.fogColor : [1, 1, 1, 1]
    },
    lineWidth: (context, props) => Math.min((props && props.lineWidth ? props.lineWidth : lineWidth), regl.limits.lineWidthDims[1]),
    primitive: 'lines',
    cull: {
      enable: true,
      face: 'front'
    },
    polygonOffset: {
      enable: true,
      offset: {
        factor: 1,
        units: Math.random() * 10
      }
    },
    blend: {
      enable: true,
      func: {
        src: 'src alpha',
        dst: 'one minus src alpha'
      }
    }

  })
}
