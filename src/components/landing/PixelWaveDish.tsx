'use client';

import React, { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle, Texture, OGLRenderingContext } from 'ogl';

interface PixelWaveDishProps {
  currentIndex: number;
  prevIndex?: number | null;
  isScanning: boolean;
  scanDirection: 'horizontal' | 'vertical';
  scanProgress: number;
  dishImages: string[];
  className?: string;
}

const VERT = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform sampler2D uTextureCurrent;
uniform sampler2D uTexturePrev;
uniform float uTime;
uniform float uHasPrev;
uniform float uScanProgress;
uniform float uScanDirection; // 0.0 = vertical (top to bottom), 1.0 = horizontal (left to right)
uniform float uIsScanning;
uniform float uZoom;

in vec2 vUv;
out vec4 fragColor;

void main() {
  // 1.08 ensures 100% of the plate corners and drop-shadows are fully intact without clipping
  vec2 uv = (vUv - 0.5) / uZoom + 0.5;

  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    fragColor = vec4(0.0);
    return;
  }

  vec2 center = vec2(0.5, 0.5);
  float dist = length(uv - center);

  // Outer ceramic plate stays still; only ripple food
  float foodMask = smoothstep(0.42, 0.22, dist);

  // Subtle organic shimmer (islands.study micro-wave)
  float waveX = sin(uv.y * 16.0 + uTime * 1.2) * cos(uv.x * 12.0 + uTime * 0.9) * 0.0035 * foodMask;
  float waveY = cos(uv.x * 14.0 + uTime * 1.1) * sin(uv.y * 14.0 + uTime * 0.8) * 0.0035 * foodMask;

  vec2 displacedUv = clamp(uv + vec2(waveX, waveY), 0.0, 1.0);

  vec4 colCurrent = texture(uTextureCurrent, displacedUv);

  if (uIsScanning > 0.5 && uHasPrev > 0.5) {
    vec4 colPrev = texture(uTexturePrev, displacedUv);
    
    // 1.0 = Horizontal (left to right), 0.0 = Vertical (top to bottom)
    float pos = (uScanDirection > 0.5) ? vUv.x : (1.0 - vUv.y);
    float scanEdge = uScanProgress;

    // Glowing laser beam
    float lineDist = abs(pos - scanEdge);
    float beam = (1.0 - smoothstep(0.0, 0.016, lineDist)) * 2.2;
    
    vec4 result = (pos <= scanEdge) ? colCurrent : colPrev;
    
    if (result.a > 0.02) {
      result.rgb += vec3(beam * 1.0);
    }
    
    fragColor = result;
  } else {
    fragColor = colCurrent;
  }
}
`;

export function PixelWaveDish({
  currentIndex,
  prevIndex,
  isScanning,
  scanDirection,
  scanProgress,
  dishImages,
  className = ""
}: PixelWaveDishProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<any>(null);
  const glRef = useRef<OGLRenderingContext | null>(null);
  const texCurrentRef = useRef<Texture | null>(null);
  const texPrevRef = useRef<Texture | null>(null);
  const imageElementsRef = useRef<{ [key: string]: HTMLImageElement }>({});

  const uploadImageToTexture = (gl: OGLRenderingContext, tex: Texture, img: HTMLImageElement) => {
    gl.bindTexture(gl.TEXTURE_2D, tex.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, dpr });
    const gl = renderer.gl;
    glRef.current = gl;
    gl.clearColor(0, 0, 0, 0);

    const geometry = new Triangle(gl);

    // 2x2 transparent canvas
    const transparentCanvas = document.createElement('canvas');
    transparentCanvas.width = 2;
    transparentCanvas.height = 2;

    const texCurrent = new Texture(gl, {
      image: transparentCanvas,
      generateMipmaps: false,
      minFilter: gl.NEAREST,
      magFilter: gl.NEAREST,
      premultiplyAlpha: true
    });
    const texPrev = new Texture(gl, {
      image: transparentCanvas,
      generateMipmaps: false,
      minFilter: gl.NEAREST,
      magFilter: gl.NEAREST,
      premultiplyAlpha: true
    });
    texCurrentRef.current = texCurrent;
    texPrevRef.current = texPrev;

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTextureCurrent: { value: texCurrent },
        uTexturePrev: { value: texPrev },
        uTime: { value: 0 },
        uHasPrev: { value: 0 },
        uScanProgress: { value: 0 },
        uScanDirection: { value: 0 },
        uIsScanning: { value: 0 },
        uZoom: { value: 1.08 }
      }
    });
    uniformsRef.current = program.uniforms;

    const mesh = new Mesh(gl, { geometry, program });
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    // Preload all HTML images
    dishImages.forEach((src, idx) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        imageElementsRef.current[src] = img;
        if (idx === currentIndex && texCurrentRef.current && glRef.current) {
          uploadImageToTexture(glRef.current, texCurrentRef.current, img);
        }
      };
    });

    const resize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        renderer.setSize(rect.width, rect.height);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    let rafId: number;
    const startTime = performance.now();

    const renderLoop = () => {
      rafId = requestAnimationFrame(renderLoop);
      const elapsed = (performance.now() - startTime) / 1000;
      if (uniformsRef.current) {
        uniformsRef.current.uTime.value = elapsed;
      }
      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  // Update textures on dish index change
  useEffect(() => {
    const gl = glRef.current;
    const texCurrent = texCurrentRef.current;
    const texPrev = texPrevRef.current;
    if (!gl || !texCurrent || !texPrev || !uniformsRef.current) return;

    const currentSrc = dishImages[currentIndex];
    const currentImg = imageElementsRef.current[currentSrc];
    if (currentImg) {
      uploadImageToTexture(gl, texCurrent, currentImg);
    } else {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = currentSrc;
      img.onload = () => {
        imageElementsRef.current[currentSrc] = img;
        if (glRef.current && texCurrentRef.current) {
          uploadImageToTexture(glRef.current, texCurrentRef.current, img);
        }
      };
    }

    if (prevIndex !== null && prevIndex !== undefined) {
      const prevSrc = dishImages[prevIndex];
      const prevImg = imageElementsRef.current[prevSrc];
      if (prevImg) {
        uploadImageToTexture(gl, texPrev, prevImg);
        uniformsRef.current.uHasPrev.value = 1.0;
      } else {
        uniformsRef.current.uHasPrev.value = 0.0;
      }
    } else {
      uniformsRef.current.uHasPrev.value = 0.0;
    }
  }, [currentIndex, prevIndex, dishImages]);

  // Update scan uniforms
  useEffect(() => {
    if (!uniformsRef.current) return;
    uniformsRef.current.uIsScanning.value = isScanning ? 1.0 : 0.0;
    uniformsRef.current.uScanDirection.value = scanDirection === 'horizontal' ? 1.0 : 0.0;
    uniformsRef.current.uScanProgress.value = scanProgress;
  }, [isScanning, scanDirection, scanProgress]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full ${className}`}
    />
  );
}
