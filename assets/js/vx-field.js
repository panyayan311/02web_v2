(() => {
  "use strict";

  const canvas = document.querySelector("[data-vx-field]");
  const hero = canvas?.closest(".vx-hero");
  if (!canvas || !hero) return;

  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 680px)");
  const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const pointer = { x: .5, y: .5 };
  const pointerTarget = { x: .5, y: .5 };
  let gl;
  let program;
  let locations;
  let geometries;
  let animationFrame = 0;
  let lastFrameAt = 0;
  let startedAt = performance.now();
  let visible = true;
  let contextLost = false;

  const setState = (state) => {
    canvas.dataset.vxFieldState = state;
  };

  const vertexSource = `
    attribute vec2 a_position;
    attribute float a_phase;
    uniform vec2 u_pointer;
    uniform float u_pointer_force;
    uniform float u_time;
    uniform float u_point_size;
    uniform float u_animate;
    varying float v_heat;

    void main() {
      vec2 position = a_position;
      float proximity = exp(-distance(position, u_pointer) * 12.0) * u_pointer_force;
      position += (u_pointer - position) * proximity * 0.035;
      gl_Position = vec4(position.x * 2.0 - 1.0, 1.0 - position.y * 2.0, 0.0, 1.0);
      gl_PointSize = u_point_size * (1.0 + proximity * 0.7);
      float pulse = 0.5 + 0.5 * sin(u_time * 1.35 - a_phase * 8.0);
      v_heat = mix(0.68, pulse, u_animate);
    }
  `;

  const fragmentSource = `
    precision mediump float;
    uniform vec4 u_color;
    uniform float u_is_point;
    varying float v_heat;

    void main() {
      float shape = 1.0;
      if (u_is_point > 0.5) {
        float radius = distance(gl_PointCoord, vec2(0.5));
        float ring = smoothstep(0.49, 0.38, radius) - smoothstep(0.30, 0.20, radius);
        float center = smoothstep(0.12, 0.04, radius) * 0.7;
        shape = max(ring, center);
        if (shape < 0.01) discard;
      }
      gl_FragColor = vec4(u_color.rgb, u_color.a * mix(0.58, 1.0, v_heat) * shape);
    }
  `;

  const compile = (type, source) => {
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

  const createProgram = () => {
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const nextProgram = gl.createProgram();
    if (!nextProgram) throw new Error("program-create-failed");
    gl.attachShader(nextProgram, vertex);
    gl.attachShader(nextProgram, fragment);
    gl.linkProgram(nextProgram);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(nextProgram, gl.LINK_STATUS)) {
      gl.deleteProgram(nextProgram);
      throw new Error("program-link-failed");
    }
    return nextProgram;
  };

  const segmentsFromPaths = (paths) => paths.flatMap((path) => {
    const segments = [];
    for (let index = 1; index < path.length; index += 1) {
      segments.push([path[index - 1][0], path[index - 1][1], path[index][0], path[index][1]]);
    }
    return segments;
  });

  const gridSegments = () => {
    const lines = [];
    for (let x = .04; x < 1; x += .08) lines.push([x, 0, x, 1]);
    for (let y = .05; y < 1; y += .1) lines.push([0, y, 1, y]);
    return lines;
  };

  const inkPaths = [
    [[-.03, .18], [.12, .18], [.17, .23], [.34, .23], [.4, .29]],
    [[.05, .64], [.19, .64], [.24, .59], [.42, .59], [.49, .52], [.63, .52]],
    [[.33, -.03], [.33, .12], [.39, .18], [.57, .18], [.62, .23], [.78, .23]],
    [[.72, .04], [.72, .36], [.67, .41], [.53, .41]],
    [[1.03, .46], [.88, .46], [.82, .52], [.82, .71], [.76, .77], [.6, .77]],
    [[.07, 1.03], [.07, .84], [.13, .78], [.3, .78], [.36, .72]],
    [[.46, 1.03], [.46, .88], [.52, .82], [.69, .82]],
    [[.94, 1.03], [.94, .87], [.88, .81]],
  ];

  const heatPaths = [
    [[-.03, .34], [.15, .34], [.21, .4], [.38, .4], [.44, .46], [.58, .46]],
    [[.28, .06], [.28, .31], [.34, .37], [.51, .37], [.58, .44], [.77, .44]],
    [[.49, .95], [.49, .72], [.55, .66], [.72, .66], [.78, .6], [1.03, .6]],
  ];

  const createGeometry = (segments, points = false) => {
    const values = [];
    if (points) {
      segments.forEach((segment, index) => {
        values.push(segment[0], segment[1], index / Math.max(segments.length - 1, 1));
      });
    } else {
      segments.forEach((segment, index) => {
        const phase = index / Math.max(segments.length - 1, 1);
        values.push(segment[0], segment[1], phase, segment[2], segment[3], phase + .04);
      });
    }
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("buffer-create-failed");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);
    return { buffer, count: values.length / 3 };
  };

  const pathNodes = [...inkPaths, ...heatPaths].flatMap((path) => path.filter((_, index) => index === 0 || index === path.length - 1));

  const setup = () => {
    gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      depth: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
    if (!gl) return false;

    program = createProgram();
    locations = {
      position: gl.getAttribLocation(program, "a_position"),
      phase: gl.getAttribLocation(program, "a_phase"),
      pointer: gl.getUniformLocation(program, "u_pointer"),
      pointerForce: gl.getUniformLocation(program, "u_pointer_force"),
      time: gl.getUniformLocation(program, "u_time"),
      pointSize: gl.getUniformLocation(program, "u_point_size"),
      animate: gl.getUniformLocation(program, "u_animate"),
      color: gl.getUniformLocation(program, "u_color"),
      isPoint: gl.getUniformLocation(program, "u_is_point"),
    };
    geometries = {
      grid: createGeometry(gridSegments()),
      ink: createGeometry(segmentsFromPaths(inkPaths)),
      heat: createGeometry(segmentsFromPaths(heatPaths)),
      nodes: createGeometry(pathNodes, true),
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

  const drawGeometry = (geometry, mode, color, pointSize, animate) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, geometry.buffer);
    gl.enableVertexAttribArray(locations.position);
    gl.vertexAttribPointer(locations.position, 2, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(locations.phase);
    gl.vertexAttribPointer(locations.phase, 1, gl.FLOAT, false, 12, 8);
    gl.uniform4f(locations.color, ...color);
    gl.uniform1f(locations.pointSize, pointSize);
    gl.uniform1f(locations.animate, animate);
    gl.uniform1f(locations.isPoint, mode === gl.POINTS ? 1 : 0);
    gl.drawArrays(mode, 0, geometry.count);
  };

  const draw = (now) => {
    if (!gl || !program || !geometries || contextLost) return;
    resize();
    pointer.x += (pointerTarget.x - pointer.x) * .045;
    pointer.y += (pointerTarget.y - pointer.y) * .045;
    const elapsed = reduceQuery.matches ? 5.2 : (now - startedAt) * .001;
    const pointerForce = finePointerQuery.matches && !reduceQuery.matches ? 1 : 0;
    const dpr = canvas.width / Math.max(canvas.clientWidth, 1);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform2f(locations.pointer, pointer.x, pointer.y);
    gl.uniform1f(locations.pointerForce, pointerForce);
    gl.uniform1f(locations.time, elapsed);
    drawGeometry(geometries.grid, gl.LINES, [.08, .08, .075, .055], 1, 0);
    drawGeometry(geometries.ink, gl.LINES, [.08, .08, .075, .34], 1, 0);
    drawGeometry(geometries.heat, gl.LINES, [1, .235, .16, .62], 1, 1);
    drawGeometry(geometries.nodes, gl.POINTS, [.11, .1, .09, .64], 6.2 * dpr, .35);
  };

  const stop = (state = "paused") => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (!contextLost) setState(state);
  };

  const render = (now) => {
    animationFrame = 0;
    if (reduceQuery.matches || !visible || document.hidden || contextLost) return;
    const minimumFrameTime = mobileQuery.matches ? 1000 / 18 : 1000 / 24;
    if (now - lastFrameAt >= minimumFrameTime) {
      draw(now);
      lastFrameAt = now;
      setState("running");
    }
    animationFrame = window.requestAnimationFrame(render);
  };

  const start = () => {
    if (animationFrame || reduceQuery.matches || !visible || document.hidden || contextLost) return;
    animationFrame = window.requestAnimationFrame(render);
  };

  const syncMotion = () => {
    stop(reduceQuery.matches ? "static" : "paused");
    pointer.x = .5;
    pointer.y = .5;
    pointerTarget.x = .5;
    pointerTarget.y = .5;
    if (reduceQuery.matches) {
      draw(performance.now());
      setState("static");
      return;
    }
    startedAt = performance.now();
    start();
  };

  try {
    if (!setup()) {
      setState("unsupported");
      canvas.hidden = true;
      return;
    }
  } catch (_error) {
    setState("unsupported");
    canvas.hidden = true;
    return;
  }

  const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(() => {
    resize();
    if (reduceQuery.matches) draw(performance.now());
  }) : null;
  resizeObserver?.observe(hero);

  const visibilityObserver = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    if (visible) {
      if (reduceQuery.matches) syncMotion();
      else start();
    } else {
      stop("paused");
    }
  }, { threshold: .01 }) : null;
  visibilityObserver?.observe(hero);

  hero.addEventListener("pointermove", (event) => {
    if (!finePointerQuery.matches || reduceQuery.matches) return;
    const bounds = hero.getBoundingClientRect();
    pointerTarget.x = Math.min(Math.max((event.clientX - bounds.left) / Math.max(bounds.width, 1), 0), 1);
    pointerTarget.y = Math.min(Math.max((event.clientY - bounds.top) / Math.max(bounds.height, 1), 0), 1);
  }, { passive: true });

  hero.addEventListener("pointerleave", () => {
    pointerTarget.x = .5;
    pointerTarget.y = .5;
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop("paused");
    else if (reduceQuery.matches) syncMotion();
    else start();
  });

  window.addEventListener("resize", () => {
    resize();
    if (reduceQuery.matches) draw(performance.now());
  });
  reduceQuery.addEventListener?.("change", syncMotion);
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
      if (!setup()) throw new Error("context-restore-failed");
      resize();
      syncMotion();
    } catch (_error) {
      setState("unsupported");
      canvas.hidden = true;
    }
  });

  resize();
  syncMotion();
})();
