/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";


const VERT_SRC = `
  attribute vec2 a_pos;
  varying   vec2 v_uv;
  void main() {
    v_uv        = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAG_SRC = `
  precision mediump float;
  uniform sampler2D u_video;
  varying vec2 v_uv;
  void main() {
    // left half of texture = RGB
    vec4 color = texture2D(u_video, vec2(v_uv.x * 0.5, v_uv.y));
    // right half of texture = alpha matte
    vec4 matte = texture2D(u_video, vec2(v_uv.x * 0.5 + 0.5, v_uv.y));
    // BT.601 luma from matte as alpha
    float alpha = dot(matte.rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(color.rgb * alpha, alpha); // premultiplied
  }
`;

export default function VideoCanvas({
  enterSrc,
  idleSrc,
  characterKey,
}: {
  enterSrc: string | null;
  idleSrc: string | null;
  characterKey: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    enterVid: HTMLVideoElement;
    idleVid: HTMLVideoElement;
    phase: "enter" | "idle";
    rvcbId: number;
    alive: boolean;
    gl: WebGLRenderingContext;
    tex: WebGLTexture;
    prog: WebGLProgram;
    uVideo: WebGLUniformLocation;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // init WebGL
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true, 
      antialias: false,
      preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null;
    if (!gl) return; 

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT_SRC));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_SRC));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uVideo = gl.getUniformLocation(prog, "u_video")!;
    gl.uniform1i(uVideo, 0);

    // Texture
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied

    // creates hidden elements for videos
    const makeVid = (src: string | null, loop: boolean): HTMLVideoElement => {
      const v = document.createElement("video");
      v.muted = true;
      v.playsInline = true;
      v.preload = "auto";
      v.crossOrigin = "anonymous";
      v.loop = loop;
      v.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
      document.body.appendChild(v);
      if (src) v.src = src;
      return v;
    };

    const enterV = makeVid(enterSrc, false);
    const idleV = makeVid(idleSrc, true);

    const state = {
      enterVid: enterV,
      idleVid: idleV,
      phase: "enter" as "enter" | "idle",
      rvcbId: 0,
      alive: true,
      gl,
      tex,
      prog,
      uVideo,
    };
    stateRef.current = state;

    // draw frame via WebGL
    const drawFrame = (vid: HTMLVideoElement) => {
      if (!state.alive || vid.readyState < 2 || vid.videoWidth === 0) return;

      const vw = vid.videoWidth; 
      const vh = vid.videoHeight;
      const hw = vw >> 1; 

      if (canvas.width !== hw || canvas.height !== vh) {
        canvas.width = hw;
        canvas.height = vh;
        gl.viewport(0, 0, hw, vh);
      }

      gl.bindTexture(gl.TEXTURE_2D, tex);
      try {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          vid,
        );
      } catch {
        return; 
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    // schedule next frame
    const scheduleFrame = (vid: HTMLVideoElement) => {
      if (!state.alive) return;
      const v = vid as any;
      if (typeof v.requestVideoFrameCallback === "function") {
        state.rvcbId = v.requestVideoFrameCallback(() => {
          drawFrame(vid);
          scheduleFrame(vid);
        });
      } else {
        state.rvcbId = requestAnimationFrame(() => {
          drawFrame(vid);
          scheduleFrame(vid);
        });
      }
    };

    const cancelScheduled = (vid: HTMLVideoElement) => {
      const v = vid as any;
      if (typeof v.cancelVideoFrameCallback === "function") {
        v.cancelVideoFrameCallback(state.rvcbId);
      } else {
        cancelAnimationFrame(state.rvcbId);
      }
    };

    // enter to idle transition
    const onEnterEnded = () => {
      if (!state.alive) return;
      cancelScheduled(enterV);
      state.phase = "idle";
      idleV.currentTime = 0;
      idleV
        .play()
        .then(() => scheduleFrame(idleV))
        .catch(() => {});
    };
    enterV.addEventListener("ended", onEnterEnded);

    // start playback
    const startEnter = () => {
      if (!state.alive) return;
      enterV
        .play()
        .then(() => scheduleFrame(enterV))
        .catch(() => {
          state.phase = "idle";
          startIdle();
        });
    };
    const startIdle = () => {
      if (!state.alive) return;
      state.phase = "idle";
      idleV
        .play()
        .then(() => scheduleFrame(idleV))
        .catch(() => {});
    };

    if (enterSrc) {
      if (enterV.readyState >= 3) {
        startEnter();
      } else {
        enterV.addEventListener("canplay", startEnter, { once: true });
        const t = setTimeout(startEnter, 5000);
        enterV.addEventListener("canplay", () => clearTimeout(t), {
          once: true,
        });
      }
    } else if (idleSrc) {
      if (idleV.readyState >= 3) {
        startIdle();
      } else {
        idleV.addEventListener("canplay", startIdle, { once: true });
        const t = setTimeout(startIdle, 5000);
        idleV.addEventListener("canplay", () => clearTimeout(t), {
          once: true,
        });
      }
    }

    // cleanup 
    return () => {
      state.alive = false;
      cancelScheduled(state.phase === "enter" ? enterV : idleV);
      enterV.removeEventListener("ended", onEnterEnded);
      enterV.pause();
      enterV.src = "";
      enterV.load();
      idleV.pause();
      idleV.src = "";
      idleV.load();
      if (enterV.parentNode) enterV.parentNode.removeChild(enterV);
      if (idleV.parentNode) idleV.parentNode.removeChild(idleV);
      gl.deleteTexture(tex);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
      stateRef.current = null;
    };
  }, [enterSrc, idleSrc, characterKey]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        margin: "auto",
        width: "100%",
        height: "100%",
        objectFit: "contain",
        pointerEvents: "none",
        background: "transparent",
      }}
    />
  );
}
