(() => {
  "use strict";

  const canvas = document.querySelector("[data-webgl]");
  const hero = document.querySelector(".hero");
  if (!(canvas instanceof HTMLCanvasElement) || !hero) return;

  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 680px)");

  const tracePaths = [
    [[0.00, 0.09], [0.34, 0.09], [0.37, 0.12], [0.43, 0.12]],
    [[0.49, 0.00], [0.49, 0.12], [0.51, 0.15], [0.51, 0.20], [0.53, 0.22]],
    [[0.56, 0.00], [0.56, 0.08], [0.58, 0.10], [0.58, 0.18], [0.61, 0.21]],
    [[0.64, 0.00], [0.64, 0.17], [0.62, 0.20], [0.62, 0.27], [0.66, 0.31]],
    [[0.71, 0.00], [0.71, 0.10], [0.69, 0.13], [0.69, 0.22]],
    [[0.83, 0.00], [0.83, 0.08], [0.85, 0.10], [0.91, 0.10], [0.93, 0.08], [1.00, 0.08]],
    [[0.94, 0.00], [0.94, 0.05], [0.96, 0.07], [1.00, 0.07]],
    [[0.00, 0.18], [0.16, 0.18], [0.18, 0.20], [0.32, 0.20], [0.37, 0.25], [0.48, 0.25]],
    [[0.00, 0.27], [0.23, 0.27], [0.26, 0.30], [0.38, 0.30], [0.42, 0.34], [0.50, 0.34]],
    [[0.00, 0.38], [0.17, 0.38], [0.21, 0.42], [0.33, 0.42], [0.37, 0.46], [0.45, 0.46]],
    [[0.44, 0.45], [0.49, 0.45], [0.51, 0.42], [0.51, 0.37], [0.54, 0.34], [0.59, 0.34], [0.62, 0.31], [0.70, 0.31]],
    [[0.44, 0.47], [0.50, 0.47], [0.53, 0.43], [0.53, 0.39], [0.56, 0.36], [0.61, 0.36], [0.64, 0.33], [0.72, 0.33]],
    [[0.42, 0.50], [0.48, 0.50], [0.52, 0.46], [0.56, 0.46], [0.59, 0.42], [0.69, 0.42], [0.72, 0.39], [0.78, 0.39]],
    [[1.00, 0.20], [0.90, 0.20], [0.87, 0.23], [0.77, 0.23], [0.74, 0.26], [0.68, 0.26]],
    [[1.00, 0.31], [0.93, 0.31], [0.90, 0.34], [0.84, 0.34], [0.81, 0.37], [0.72, 0.37]],
    [[1.00, 0.44], [0.91, 0.44], [0.88, 0.47], [0.82, 0.47], [0.79, 0.44], [0.73, 0.44]],
    [[1.00, 0.55], [0.92, 0.55], [0.89, 0.52], [0.82, 0.52], [0.78, 0.56], [0.71, 0.56]],
    [[0.00, 0.59], [0.08, 0.59], [0.12, 0.63], [0.20, 0.63], [0.23, 0.66], [0.36, 0.66], [0.40, 0.63], [0.48, 0.63]],
    [[0.00, 0.66], [0.13, 0.66], [0.16, 0.69], [0.31, 0.69], [0.34, 0.65], [0.43, 0.65]],
    [[0.00, 0.73], [0.10, 0.73], [0.14, 0.77], [0.25, 0.77], [0.29, 0.73], [0.38, 0.73]],
    [[0.00, 0.86], [0.16, 0.86], [0.20, 0.82], [0.34, 0.82], [0.38, 0.78], [0.49, 0.78]],
    [[0.04, 0.00], [0.04, 0.12], [0.06, 0.14], [0.06, 0.21]],
    [[0.11, 0.00], [0.11, 0.17], [0.09, 0.19], [0.09, 0.34]],
    [[0.17, 0.34], [0.17, 0.47], [0.15, 0.49], [0.15, 0.58]],
    [[0.24, 0.36], [0.24, 0.52], [0.22, 0.54], [0.22, 0.72]],
    [[0.31, 0.51], [0.31, 0.62], [0.29, 0.64], [0.29, 0.84]],
    [[0.39, 0.58], [0.39, 0.74], [0.37, 0.76], [0.37, 1.00]],
    [[0.47, 0.69], [0.47, 0.84], [0.45, 0.86], [0.45, 1.00]],
    [[0.57, 0.61], [0.57, 0.73], [0.60, 0.76], [0.60, 1.00]],
    [[0.67, 0.56], [0.67, 0.70], [0.70, 0.73], [0.70, 1.00]],
    [[0.77, 0.62], [0.77, 0.78], [0.80, 0.81], [0.80, 1.00]],
    [[0.87, 0.52], [0.87, 0.70], [0.84, 0.73], [0.84, 0.90]],
    [[0.96, 0.49], [0.96, 0.64], [0.93, 0.67], [0.93, 0.87]],
    [[0.52, 0.77], [0.58, 0.77], [0.61, 0.74], [0.71, 0.74], [0.75, 0.78], [0.86, 0.78]],
    [[0.49, 0.88], [0.59, 0.88], [0.62, 0.84], [0.73, 0.84], [0.77, 0.88], [1.00, 0.88]],
  ];

  const gridPaths = [];
  [0.03, 0.07, 0.12, 0.18, 0.25, 0.32, 0.40, 0.48, 0.56, 0.64, 0.72, 0.79, 0.86, 0.93, 0.97]
    .forEach((x) => gridPaths.push([[x, 0], [x, 1]]));
  [0.10, 0.18, 0.27, 0.37, 0.48, 0.59, 0.68, 0.78, 0.88]
    .forEach((y) => gridPaths.push([[0, y], [1, y]]));

  const dashedSegments = [
    [[0.00, 0.12], [0.42, 0.78]],
    [[0.27, 1.00], [0.79, 0.00]],
    [[0.62, 1.00], [1.00, 0.51]],
    [[0.00, 0.92], [0.43, 0.51]],
    [[0.54, 0.58], [0.96, 0.58]],
    [[0.06, 0.54], [0.36, 0.54]],
  ];

  const nodes = [
    [0.04, 0.12], [0.06, 0.21], [0.09, 0.34], [0.15, 0.49], [0.17, 0.47],
    [0.22, 0.54], [0.23, 0.66], [0.29, 0.64], [0.31, 0.62], [0.34, 0.65],
    [0.37, 0.12], [0.37, 0.25], [0.37, 0.46], [0.37, 0.76], [0.39, 0.74],
    [0.42, 0.34], [0.43, 0.65], [0.45, 0.46], [0.45, 0.86], [0.47, 0.69],
    [0.48, 0.25], [0.48, 0.63], [0.49, 0.45], [0.50, 0.34], [0.51, 0.20],
    [0.53, 0.22], [0.54, 0.34], [0.56, 0.46], [0.57, 0.61], [0.58, 0.18],
    [0.59, 0.34], [0.60, 0.76], [0.61, 0.21], [0.62, 0.31], [0.64, 0.33],
    [0.66, 0.31], [0.67, 0.56], [0.68, 0.26], [0.69, 0.42], [0.70, 0.73],
    [0.71, 0.56], [0.72, 0.33], [0.72, 0.37], [0.72, 0.39], [0.74, 0.26],
    [0.77, 0.23], [0.77, 0.78], [0.78, 0.39], [0.78, 0.56], [0.79, 0.44],
    [0.80, 0.81], [0.82, 0.47], [0.83, 0.08], [0.84, 0.34], [0.84, 0.73],
    [0.85, 0.10], [0.87, 0.23], [0.87, 0.52], [0.88, 0.47], [0.89, 0.52],
    [0.90, 0.20], [0.91, 0.10], [0.91, 0.44], [0.93, 0.31], [0.93, 0.67],
  ];

  const pulseNodes = [
    [0.36, 0.13], [0.52, 0.18], [0.74, 0.08], [0.91, 0.10], [0.68, 0.26],
    [0.54, 0.34], [0.72, 0.39], [0.48, 0.63], [0.37, 0.76], [0.80, 0.81],
  ];

  const accentPaths = [
    [[0.51, 0.42], [0.51, 0.37], [0.54, 0.34]],
    [[0.62, 0.31], [0.70, 0.31]],
    [[0.29, 0.64], [0.29, 0.75]],
    [[0.77, 0.78], [0.80, 0.81]],
  ];

  const lineVertexSource = `
    attribute vec2 a_position;
    attribute float a_phase;
    uniform vec2 u_parallax;
    uniform float u_scroll;
    uniform float u_time;
    uniform float u_pulse;
    varying float v_opacity;

    void main() {
      vec2 position = a_position;
      position += u_parallax * (0.82 + mod(a_phase, 2.0) * 0.07);
      position.y += u_scroll * 0.003;
      gl_Position = vec4(position.x * 2.0 - 1.0, 1.0 - position.y * 2.0, 0.0, 1.0);
      float pulse = 0.34 + 0.66 * (0.5 + 0.5 * sin(u_time * 0.82 + a_phase));
      v_opacity = mix(1.0, pulse, u_pulse);
    }
  `;

  const lineFragmentSource = `
    precision mediump float;
    uniform vec4 u_color;
    varying float v_opacity;

    void main() {
      gl_FragColor = vec4(u_color.rgb, u_color.a * v_opacity);
    }
  `;

  const pointVertexSource = `
    attribute vec2 a_position;
    attribute float a_phase;
    uniform vec2 u_parallax;
    uniform float u_scroll;
    uniform float u_time;
    uniform float u_pulse;
    uniform float u_point_size;
    varying float v_opacity;

    void main() {
      vec2 position = a_position + u_parallax;
      position.y += u_scroll * 0.003;
      gl_Position = vec4(position.x * 2.0 - 1.0, 1.0 - position.y * 2.0, 0.0, 1.0);
      float pulse = 0.32 + 0.68 * (0.5 + 0.5 * sin(u_time * 0.92 + a_phase));
      v_opacity = mix(1.0, pulse, u_pulse);
      gl_PointSize = u_point_size * mix(1.0, 1.22, u_pulse * pulse);
    }
  `;

  const pointFragmentSource = `
    precision mediump float;
    uniform vec4 u_color;
    varying float v_opacity;

    void main() {
      float distanceFromCenter = distance(gl_PointCoord, vec2(0.5));
      float outer = 1.0 - smoothstep(0.43, 0.50, distanceFromCenter);
      float inner = 1.0 - smoothstep(0.28, 0.35, distanceFromCenter);
      float ring = max(outer - inner, 0.0);
      float center = 1.0 - smoothstep(0.055, 0.12, distanceFromCenter);
      float alpha = max(ring, center * 0.72) * v_opacity;
      if (alpha < 0.01) discard;
      gl_FragColor = vec4(u_color.rgb, u_color.a * alpha);
    }
  `;

  let gl;
  let programs;
  let geometries;
  let animationFrame = 0;
  let lastFrameAt = 0;
  let startAt = performance.now();
  let heroVisible = true;
  let contextLost = false;
  let scrollProgress = 0;
  const pointer = { x: 0.5, y: 0.5 };
  const pointerTarget = { x: 0.5, y: 0.5 };

  const setState = (state) => {
    canvas.dataset.webglState = state;
  };

  const compileShader = (type, source) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("shader-create-failed");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error("shader-compile-failed");
    }
    return shader;
  };

  const createProgram = (vertexSource, fragmentSource) => {
    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program) throw new Error("program-create-failed");
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      throw new Error("program-link-failed");
    }
    return program;
  };

  const programInfo = (program, isPoint = false) => ({
    program,
    attributes: {
      position: gl.getAttribLocation(program, "a_position"),
      phase: gl.getAttribLocation(program, "a_phase"),
    },
    uniforms: {
      parallax: gl.getUniformLocation(program, "u_parallax"),
      scroll: gl.getUniformLocation(program, "u_scroll"),
      time: gl.getUniformLocation(program, "u_time"),
      pulse: gl.getUniformLocation(program, "u_pulse"),
      color: gl.getUniformLocation(program, "u_color"),
      pointSize: isPoint ? gl.getUniformLocation(program, "u_point_size") : null,
    },
  });

  const pathGeometry = (paths, phaseOffset = 0) => {
    const values = [];
    paths.forEach((path, pathIndex) => {
      for (let index = 0; index < path.length - 1; index += 1) {
        const phase = phaseOffset + pathIndex * 0.73 + index * 0.21;
        values.push(path[index][0], path[index][1], phase);
        values.push(path[index + 1][0], path[index + 1][1], phase);
      }
    });
    return new Float32Array(values);
  };

  const dashGeometry = (segments) => {
    const values = [];
    segments.forEach(([start, end], segmentIndex) => {
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const length = Math.hypot(dx, dy);
      const steps = Math.max(Math.floor(length / 0.016), 1);
      for (let index = 0; index < steps; index += 2) {
        const from = index / steps;
        const to = Math.min((index + 0.72) / steps, 1);
        const phase = segmentIndex * 0.83 + index * 0.12;
        values.push(start[0] + dx * from, start[1] + dy * from, phase);
        values.push(start[0] + dx * to, start[1] + dy * to, phase);
      }
    });
    return new Float32Array(values);
  };

  const pointGeometry = (points, phaseOffset = 0) => {
    const values = [];
    points.forEach((point, index) => values.push(point[0], point[1], phaseOffset + index * 0.79));
    return new Float32Array(values);
  };

  const createGeometry = (data) => {
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("buffer-create-failed");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return { buffer, count: data.length / 3 };
  };

  const setupContext = () => {
    gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
    if (!gl) return false;

    programs = {
      line: programInfo(createProgram(lineVertexSource, lineFragmentSource)),
      point: programInfo(createProgram(pointVertexSource, pointFragmentSource), true),
    };
    geometries = {
      grid: createGeometry(pathGeometry(gridPaths, 0.2)),
      traces: createGeometry(pathGeometry(tracePaths, 1.1)),
      dashes: createGeometry(dashGeometry(dashedSegments)),
      accents: createGeometry(pathGeometry(accentPaths, 2.4)),
      nodes: createGeometry(pointGeometry(nodes, 0.6)),
      pulseNodes: createGeometry(pointGeometry(pulseNodes, 2.1)),
    };

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    return true;
  };

  const resize = () => {
    if (!gl || contextLost) return;
    const bounds = canvas.getBoundingClientRect();
    const maxDpr = mobileQuery.matches ? 0.9 : 1.25;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const width = Math.max(1, Math.round(bounds.width * dpr));
    const height = Math.max(1, Math.round(bounds.height * dpr));
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  };

  const bindGeometry = (info, geometry) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, geometry.buffer);
    gl.enableVertexAttribArray(info.attributes.position);
    gl.vertexAttribPointer(info.attributes.position, 2, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(info.attributes.phase);
    gl.vertexAttribPointer(info.attributes.phase, 1, gl.FLOAT, false, 12, 8);
  };

  const setCommonUniforms = (info, elapsed, pulse) => {
    const parallaxX = (pointer.x - 0.5) * 0.006;
    const parallaxY = (pointer.y - 0.5) * 0.008;
    gl.uniform2f(info.uniforms.parallax, parallaxX, parallaxY);
    gl.uniform1f(info.uniforms.scroll, scrollProgress);
    gl.uniform1f(info.uniforms.time, elapsed);
    gl.uniform1f(info.uniforms.pulse, pulse);
  };

  const drawLines = (geometry, color, elapsed, pulse = 0) => {
    const info = programs.line;
    gl.useProgram(info.program);
    bindGeometry(info, geometry);
    setCommonUniforms(info, elapsed, pulse);
    gl.uniform4f(info.uniforms.color, ...color);
    gl.drawArrays(gl.LINES, 0, geometry.count);
  };

  const drawPoints = (geometry, color, size, elapsed, pulse = 0) => {
    const info = programs.point;
    gl.useProgram(info.program);
    bindGeometry(info, geometry);
    setCommonUniforms(info, elapsed, pulse);
    gl.uniform4f(info.uniforms.color, ...color);
    const dpr = canvas.width / Math.max(canvas.clientWidth, 1);
    gl.uniform1f(info.uniforms.pointSize, size * dpr);
    gl.drawArrays(gl.POINTS, 0, geometry.count);
  };

  const updateScrollProgress = () => {
    const bounds = hero.getBoundingClientRect();
    const travel = Math.max(hero.offsetHeight * 0.72, 1);
    scrollProgress = Math.min(Math.max(-bounds.top / travel, 0), 1);
  };

  const draw = (now) => {
    if (!gl || !programs || !geometries || contextLost) return;
    resize();
    pointer.x += (pointerTarget.x - pointer.x) * 0.035;
    pointer.y += (pointerTarget.y - pointer.y) * 0.035;
    const elapsed = reduceQuery.matches ? 3.7 : (now - startAt) * 0.001;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.lineWidth(1);
    drawLines(geometries.grid, [0.18, 0.17, 0.15, 0.085], elapsed);
    drawLines(geometries.traces, [0.19, 0.18, 0.16, 0.34], elapsed);
    drawLines(geometries.dashes, [0.22, 0.21, 0.19, 0.22], elapsed);
    drawLines(geometries.accents, [0.88, 0.24, 0.16, 0.16], elapsed, 1);
    drawPoints(geometries.nodes, [0.24, 0.23, 0.20, 0.46], 6.2, elapsed);
    drawPoints(geometries.pulseNodes, [0.90, 0.24, 0.16, 0.34], 5.8, elapsed, 1);
  };

  const stop = (state = "paused") => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (!contextLost) setState(state);
  };

  const render = (now) => {
    animationFrame = 0;
    if (reduceQuery.matches || !heroVisible || document.hidden || contextLost) return;
    const minimumFrameTime = mobileQuery.matches ? 1000 / 18 : 1000 / 24;
    if (now - lastFrameAt >= minimumFrameTime) {
      draw(now);
      lastFrameAt = now;
      setState("running");
    }
    animationFrame = requestAnimationFrame(render);
  };

  const start = () => {
    if (animationFrame || reduceQuery.matches || !heroVisible || document.hidden || contextLost) return;
    animationFrame = requestAnimationFrame(render);
  };

  const syncMotionMode = () => {
    stop(reduceQuery.matches ? "static" : "paused");
    updateScrollProgress();
    if (reduceQuery.matches) {
      pointer.x = 0.5;
      pointer.y = 0.5;
      pointerTarget.x = 0.5;
      pointerTarget.y = 0.5;
      draw(performance.now());
      setState("static");
    } else {
      startAt = performance.now();
      start();
    }
  };

  try {
    if (!setupContext()) {
      setState("unsupported");
      canvas.hidden = true;
      return;
    }
  } catch (_error) {
    setState("unsupported");
    canvas.hidden = true;
    return;
  }

  const resizeObserver = "ResizeObserver" in window
    ? new ResizeObserver(() => {
        resize();
        if (reduceQuery.matches) draw(performance.now());
      })
    : null;
  resizeObserver?.observe(hero);

  const visibilityObserver = "IntersectionObserver" in window
    ? new IntersectionObserver(([entry]) => {
        heroVisible = entry?.isIntersecting ?? true;
        if (heroVisible) {
          if (reduceQuery.matches) {
            draw(performance.now());
            setState("static");
          } else {
            start();
          }
        } else {
          stop("paused");
        }
      }, { threshold: 0.01 })
    : null;
  visibilityObserver?.observe(hero);

  hero.addEventListener("pointermove", (event) => {
    if (reduceQuery.matches) return;
    const bounds = hero.getBoundingClientRect();
    pointerTarget.x = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
    pointerTarget.y = Math.min(Math.max((event.clientY - bounds.top) / bounds.height, 0), 1);
  }, { passive: true });

  hero.addEventListener("pointerleave", () => {
    pointerTarget.x = 0.5;
    pointerTarget.y = 0.5;
  }, { passive: true });

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", () => {
    resize();
    if (reduceQuery.matches) draw(performance.now());
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop("paused");
    else if (reduceQuery.matches) syncMotionMode();
    else start();
  });

  reduceQuery.addEventListener?.("change", syncMotionMode);
  mobileQuery.addEventListener?.("change", () => {
    resize();
    if (reduceQuery.matches) draw(performance.now());
  });

  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    contextLost = true;
    stop("lost");
    setState("lost");
  });

  canvas.addEventListener("webglcontextrestored", () => {
    contextLost = false;
    try {
      if (!setupContext()) throw new Error("context-restore-failed");
      resize();
      syncMotionMode();
    } catch (_error) {
      setState("unsupported");
      canvas.hidden = true;
    }
  });

  updateScrollProgress();
  resize();
  syncMotionMode();
})();
