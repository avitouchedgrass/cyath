'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';

interface PixelWaveDishProps {
  currentImage: string;
  prevImage?: string | null;
  isScanning: boolean;
  scanDirection: 'horizontal' | 'vertical';
  scanProgress: number;
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

in vec2 vUv;
out vec4 fragColor;

void main() {
  vec2 uv = vUv;
  vec2 center = vec2(0.5, 0.5);
  float dist = length(uv - center);

  // Keep the outer ceramic plate completely still (dist > 0.40);
  // Only wave the inner food pixels with subtle micro-displacement
  float foodMask = smoothstep(0.40, 0.22, dist);

  // Islands.study style subtle organic micro-wave
  float waveX = sin(uv.y * 16.0 + uTime * 1.2) * cos(uv.x * 12.0 + uTime * 0.9) * 0.0035 * foodMask;
  float waveY = cos(uv.x * 14.0 + uTime * 1.1) * sin(uv.y * 14.0 + uTime * 0.8) * 0.0035 * foodMask;

  vec2 displacedUv = uv + vec2(waveX, waveY);
  displacedUv = clamp(displacedUv, 0.0, 1.0);

  vec4 colCurrent = texture(uTextureCurrent, displacedUv);

  if (uIsScanning > 0.5 && uHasPrev > 0.5) {
    vec4 colPrev = texture(uTexturePrev, displacedUv);
    
    // Determine scanline split: 1.0 = Horizontal (left to right), 0.0 = Vertical (top to bottom)
    float pos = (uScanDirection > 0.5) ? uv.x : (1.0 - uv.y);
    float scanEdge = uScanProgress;

    // Laser beam glow intensity right at the scan edge
    float lineDist = abs(pos - scanEdge);
    float beam = (1.0 - smoothstep(0.0, 0.015, lineDist)) * 1.8;
    
    vec4 result = (pos <= scanEdge) ? colCurrent : colPrev;
    
    // Add glowing white laser line across the scanning edge
    if (result.a > 0.05) {
      result.rgb += vec3(beam * 0.95);
    }
    
    fragColor = result;
  } else {
    fragColor = colCurrent;
  }
}
`;

export function PixelWaveDish({
  currentImage,
  prevImage,
  isScanning,
  scanDirection,
  scanProgress,
  className = ""
}: PixelWaveDishProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<any>(null);
  const texturesRef = useRef<{ current: Texture | null; prev: Texture | null }>({ current: null, prev: null });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: false, dpr });
    const gl = renderer.gl;
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

    // Create transparent placeholder canvas (Zero white box flash)
    const transparentCanvas = document.createElement('canvas');
    transparentCanvas.width = 2;
    transparentCanvas.height = 2;
    const ctx = transparentCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 2, 2);
    }

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
    texturesRef.current = { current: texCurrent, prev: texPrev };

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
        uIsScanning: { value: 0 }
      }
    });
    uniformsRef.current = program.uniforms;

    const mesh = new Mesh(gl, { geometry, program });
    gl.canvas.style.display = 'block';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    container.appendChild(gl.canvas);

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

  // Update current texture image on change & trigger WebGL buffer upload
  useEffect(() => {
    if (!texturesRef.current.current) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImage;
    img.onload = () => {
      if (texturesRef.current.current) {
        texturesRef.current.current.image = img;
        texturesRef.current.current.needsUpdate = true; // Key for ogl to re-upload texture!
        setLoaded(true);
      }
    };
  }, [currentImage]);

  // Update previous texture image on scan
  useEffect(() => {
    if (!texturesRef.current.prev) return;
    if (prevImage) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = prevImage;
      img.onload = () => {
        if (texturesRef.current.prev && uniformsRef.current) {
          texturesRef.current.prev.image = img;
          texturesRef.current.prev.needsUpdate = true;
          uniformsRef.current.uHasPrev.value = 1.0;
        }
      };
    } else if (uniformsRef.current) {
      uniformsRef.current.uHasPrev.value = 0.0;
    }
  }, [prevImage]);

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
      className={`relative w-full h-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
}
