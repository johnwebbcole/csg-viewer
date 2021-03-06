const glslify = require("glslify"); // -sync') // works in client & server
const mat4 = require("gl-mat4");
const path = require("path");

module.exports = function prepareDrawGrid(regl, params = {}) {
  let positions = [];
  const defaults = {
    color: [1, 1, 1, 1],
    ticks: 1,
    size: [16, 16],
    fadeOut: false,
    centered: false,
    lineWidth: 2
  };

  let { size, ticks, fadeOut, centered, lineWidth, color } = Object.assign(
    {},
    defaults,
    params
  );

  const width = size[0];
  const length = size[1];

  if (false) {
    const halfWidth = width * 0.5;
    const halfLength = length * 0.5;
    // const gridLine =
    positions.push(-halfWidth, 0, 0);
    positions.push(halfWidth, 0, 0);
  }

  if (centered) {
    const halfWidth = width * 0.5;
    const halfLength = length * 0.5;

    const remWidth = halfWidth % ticks;
    const widthStart = -halfWidth + remWidth;
    const widthEnd = -widthStart;

    const remLength = halfLength % ticks;
    let lengthStart = -halfLength + remLength;
    const lengthEnd = -lengthStart;

    const skipEvery = 0;

    for (let i = widthStart, j = 0; i <= widthEnd; i += ticks, j += 1) {
      if (j % skipEvery !== 0) {
        positions.push(lengthStart, i, 0);
        positions.push(lengthEnd, i, 0);
        positions.push(lengthStart, i, 0);
      }
    }
    for (let i = lengthStart, j = 0; i <= lengthEnd; i += ticks, j += 1) {
      if (j % skipEvery !== 0) {
        positions.push(i, widthStart, 0);
        positions.push(i, widthEnd, 0);
        positions.push(i, widthStart, 0);
      }
    }
  } else {
    for (let i = -width * 0.5; i <= width * 0.5; i += ticks) {
      positions.push(-length * 0.5, i, 0);
      positions.push(length * 0.5, i, 0);
      positions.push(-length * 0.5, i, 0);
    }

    for (let i = -length * 0.5; i <= length * 0.5; i += ticks) {
      positions.push(i, -width * 0.5, 0);
      positions.push(i, width * 0.5, 0);
      positions.push(i, -width * 0.5, 0);
    }
  }

  return regl({
    vert: glslify(path.join(__dirname, "/../basic.vert")),
    frag: glslify(path.join(__dirname, "/shaders/grid.frag")),

    attributes: {
      position: regl.buffer(positions)
    },
    count: positions.length / 3,
    uniforms: {
      model: (context, props) =>
        props && props.model ? props.model : mat4.identity([]),
      color: (context, props) => (props && props.color ? props.color : color),
      fogColor: (context, props) =>
        props && props.color
          ? [props.color[0], props.color[1], props.color[2], 0]
          : [color[0], color[1], color[2], 0.0],
      fadeOut: (context, props) =>
        props && props.fadeOut !== undefined ? props.fadeOut : fadeOut
    },
    lineWidth: (context, props) =>
      Math.min(
        props && props.lineWidth ? props.lineWidth : lineWidth,
        regl.limits.lineWidthDims[1]
      ),
    primitive: "lines",
    cull: {
      enable: true,
      face: "front"
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
        src: "src alpha",
        dst: "one minus src alpha"
      }
    }
  });
};

/* alternate rendering method

        let count = 80
        let offset = 10
        const datas = Array(80).fill(0)
          .map(function (v, i) {
            const model = mat4.translate(mat4.identity([]), mat4.identity([]), [0, i * offset - (count * 0.5 * offset), 0])
            return {
              color: gridColor, fadeOut, model
            }
          })
        const datas2 = Array(80).fill(0)
          .map(function (v, i) {
            let model
            model = mat4.rotateZ(mat4.identity([]), mat4.identity([]), 1.5708)
            model = mat4.translate(model, model, [0, i * offset - (count * 0.5 * offset), 0])
            return {
              color: gridColor, fadeOut, model
            }
          })

        count = 80
        offset = 1
        const datas3 = Array(80).fill(0)
          .map(function (v, i) {
            const model = mat4.translate(mat4.identity([]), mat4.identity([]), [0, i * offset - (count * 0.5 * offset), 0])
            return {
              color: subGridColor, fadeOut, model
            }
          })
        const datas4 = Array(80).fill(0)
          .map(function (v, i) {
            let model
            model = mat4.rotateZ(mat4.identity([]), mat4.identity([]), 1.5708)
            model = mat4.translate(model, model, [0, i * offset - (count * 0.5 * offset), 0])
            return {
              color: subGridColor, fadeOut, model
            }
          })
        // const model = mat4.translate(mat4.identity([]), mat4.identity([]), [0, 50, 0])
        drawGrid(datas)// {color: gridColor, fadeOut, model})
        drawGrid(datas2)

        drawGrid(datas3)// {color: gridColor, fadeOut, model})
        drawGrid(datas4) */
