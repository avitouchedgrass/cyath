'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';

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
  // Zoom in towards center to make plate huge and eliminate PNG outer margin
  vec2 uv = (vUv - 0.5) / uZoom + 0.5;

  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    fragColor = vec4(0.0);
    return;
  }

  vec2 center = vec2(0.5, 0.5);
  float dist = length(uv - center);

  // Keep outer ceramic rim stationary; only ripple inner food
  float foodMask = smoothstep(0.38, 0.20, dist);

  // Subtle organic shimmer (islands.study micro-wave)
  float waveX = sin(uv.y * 18.0 + uTime * 1.3) * cos(uv.x * 14.0 + uTime * 1.0) * 0.0035 * foodMask;
  float waveY = cos(uv.x * 16.0 + uTime * 1.2) * sin(uv.y * 16.0 + uTime * 0.9) * 0.0035 * foodMask;

  vec2 displacedUv = clamp(uv + vec2(waveX, waveY), 0.0, 1.0);

  vec4 colCurrent = texture(uTextureCurrent, displacedUv);

  if (uIsScanning > 0.5 && uHasPrev > 0.5) {
    vec4 colPrev = texture(uTexturePrev, displacedUv);
    
    // Determine laser sweep position
    float pos = (uScanDirection > 0.5) ? vUv.x : (1.0 - vUv.y);
    float scanEdge = uScanProgress;

    // Laser beam shine
    float lineDist = abs(pos - scanEdge);
    float beam = (1.0 - smoothstep(0.0, 0.015, lineDist)) * 2.2;
    
    vec4 result = (pos <= scanEdge) ? colCurrent : colPrev;
    
    if (result.a > 0.02) {
      result.rgb += vec3(beam * 1.1);
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
  const texturesMapRef = useRef<{ [key: string]: Texture }>({});
  const glRef = useRef<any>(null);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, dpr });
    const gl = renderer.gl;
    glRef.current = gl;
    gl.clearColor(0, 0, 0, 0);

    const geometry = new Triangle(gl);
    geometry.addAttribute('uv', {
      size: 2,
      data: new Float32Array([
        -1, -1,
        3, -1,
        -1, 3
      ])
    });

    // Transparent placeholder texture
    const transparentCanvas = document.createElement('canvas');
    transparentCanvas.width = 2;
    transparentCanvas.height = 2;
    const ctx = transparentCanvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, 2, 2);

    const defaultTex = new Texture(gl, {
      image: transparentCanvas,
      generateMipmaps: false,
      minFilter: gl.NEAREST,
      magFilter: gl.NEAREST,
      premultiplyAlpha: true
    });

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTextureCurrent: { value: defaultTex },
        uTexturePrev: { value: defaultTex },
        uTime: { value: 0 },
        uHasPrev: { value: 0 },
        uScanProgress: { value: 0 },
        uScanDirection: { value: 0 },
        uIsScanning: { value: 0 },
        uZoom: { value: 1.42 } // Scales up plate to eliminate transparent border whitespace
      }
    });
    uniformsRef.current = program.uniforms;

    const mesh = new Mesh(gl, { geometry, program });
    gl.canvas.style.display = 'block';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    container.appendChild(gl.canvas);

    // Preload all 5 dish textures into GPU memory upfront
    dishImages.forEach((src) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        const tex = new Texture(gl, {
          image: img,
          generateMipmaps: false,
          minFilter: gl.NEAREST,
          magFilter: gl.NEAREST,
          premultiplyAlpha: true
        });
        texturesMapRef.current[src] = tex;
        setLoadedCount((prev) => prev + 1);
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
    let startTime = performance.now();

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
      if (gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  // Update active and previous textures when indices change
  useEffect(() => {
    if (!uniformsRef.current) return;

    const currentSrc = dishImages[currentIndex];
    const currentTex = texturesMapRef.current[currentSrc];
    if (currentTex) {
      uniformsRef.current.uTextureCurrent.value = currentTex;
    }

    if (prevIndex !== null && prevIndex !== undefined) {
      const prevSrc = dishImages[prevIndex];
      const prevTex = texturesMapRef.current[prevSrc];
      if (prevTex) {
        uniformsRef.current.uTexturePrev.value = prevTex;
        uniformsRef.current.uHasPrev.value = 1.0;
      }
    } else {
      uniformsRef.current.uHasPrev.value = 0.0;
    }
  }, [currentIndex, prevIndex, loadedCount, dishImages]);

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
      className={`relative w-full h-full transition-opacity duration-700 ${loadedCount > 0 ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
}
