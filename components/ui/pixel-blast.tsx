"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer, EffectPass, RenderPass, Effect } from "postprocessing";
import {
  createLiquidEffect,
  createTouchTexture,
  FRAGMENT_SRC,
  MAX_CLICKS,
  SHAPE_MAP,
  VERTEX_SRC,
  type PixelBlastVariant,
} from "@/lib/animations/pixel-blast-engine";
import "./pixel-blast.css";

type PixelBlastProps = {
  variant?: PixelBlastVariant;
  pixelSize?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  antialias?: boolean;
  patternScale?: number;
  patternDensity?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleIntensityScale?: number;
  rippleThickness?: number;
  rippleSpeed?: number;
  liquidWobbleSpeed?: number;
  autoPauseOffscreen?: boolean;
  speed?: number;
  transparent?: boolean;
  edgeFade?: number;
  noiseAmount?: number;
};

const PixelBlast: React.FC<PixelBlastProps> = ({
  variant = "square",
  pixelSize = 3,
  color = "#B19EEF",
  className,
  style,
  antialias = true,
  patternScale = 2,
  patternDensity = 1,
  liquid = false,
  liquidStrength = 0.1,
  liquidRadius = 1,
  pixelSizeJitter = 0,
  enableRipples = true,
  rippleIntensityScale = 1,
  rippleThickness = 0.1,
  rippleSpeed = 0.3,
  liquidWobbleSpeed = 4.5,
  autoPauseOffscreen = true,
  speed = 0.5,
  transparent = true,
  edgeFade = 0.5,
  noiseAmount = 0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const visibilityRef = useRef({ visible: true });
  const speedRef = useRef(speed);

  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    material: THREE.ShaderMaterial;
    clock: THREE.Clock;
    clickIx: number;
    uniforms: {
      uResolution: { value: THREE.Vector2 };
      uTime: { value: number };
      uColor: { value: THREE.Color };
      uClickPos: { value: THREE.Vector2[] };
      uClickTimes: { value: Float32Array };
      uShapeType: { value: number };
      uPixelSize: { value: number };
      uScale: { value: number };
      uDensity: { value: number };
      uPixelJitter: { value: number };
      uEnableRipples: { value: number };
      uRippleSpeed: { value: number };
      uRippleThickness: { value: number };
      uRippleIntensity: { value: number };
      uEdgeFade: { value: number };
    };
    resizeObserver: ResizeObserver | undefined;
    raf: number | undefined;
    quad: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | undefined;
    timeOffset: number | undefined;
    composer: EffectComposer | undefined;
    touch: ReturnType<typeof createTouchTexture> | undefined;
    liquidEffect: Effect | undefined;
  } | null>(null);

  const prevConfigRef = useRef<{ antialias: boolean; liquid: boolean; noiseAmount: number } | null>(
    null,
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    speedRef.current = speed;

    const needsReinitKeys = ["antialias", "liquid", "noiseAmount"] as const;
    const cfg = { antialias, liquid, noiseAmount };
    let mustReinit = false;

    if (!threeRef.current) mustReinit = true;
    else if (prevConfigRef.current) {
      for (const k of needsReinitKeys)
        if (prevConfigRef.current[k] !== cfg[k]) {
          mustReinit = true;
          break;
        }
    }

    if (mustReinit) {
      if (threeRef.current) {
        const t = threeRef.current;
        t.resizeObserver?.disconnect();
        cancelAnimationFrame(t.raf!);
        t.quad?.geometry.dispose();
        t.material.dispose();
        t.composer?.dispose();
        t.renderer.dispose();
        if (t.renderer.domElement.parentElement === container)
          container.removeChild(t.renderer.domElement);
        threeRef.current = null;
      }

      const canvas = document.createElement("canvas");
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias,
        alpha: true,
        powerPreference: "high-performance",
      });

      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);

      if (transparent) renderer.setClearAlpha(0);
      else renderer.setClearColor(0x000000, 1);

      const uniforms = {
        uResolution: { value: new THREE.Vector2(0, 0) },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uClickPos: {
          value: Array.from({ length: MAX_CLICKS }, () => new THREE.Vector2(-1, -1)),
        },
        uClickTimes: { value: new Float32Array(MAX_CLICKS) },
        uShapeType: { value: SHAPE_MAP[variant] ?? 0 },
        uPixelSize: { value: pixelSize * renderer.getPixelRatio() },
        uScale: { value: patternScale },
        uDensity: { value: patternDensity },
        uPixelJitter: { value: pixelSizeJitter },
        uEnableRipples: { value: enableRipples ? 1 : 0 },
        uRippleSpeed: { value: rippleSpeed },
        uRippleThickness: { value: rippleThickness },
        uRippleIntensity: { value: rippleIntensityScale },
        uEdgeFade: { value: edgeFade },
      };

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SRC,
        fragmentShader: FRAGMENT_SRC,
        uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        glslVersion: THREE.GLSL3,
      });

      const quadGeom = new THREE.PlaneGeometry(2, 2);
      const quad = new THREE.Mesh(quadGeom, material);
      scene.add(quad);

      const clock = new THREE.Clock();

      const setSize = () => {
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        renderer.setSize(w, h, false);
        uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
        if (threeRef.current?.composer)
          threeRef.current.composer.setSize(renderer.domElement.width, renderer.domElement.height);
        uniforms.uPixelSize.value = pixelSize * renderer.getPixelRatio();
      };

      setSize();

      const ro = new ResizeObserver(setSize);
      ro.observe(container);

      const randomFloat = () => {
        if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
          const u32 = new Uint32Array(1);
          window.crypto.getRandomValues(u32);
          return (u32[0] ?? 0) / 0xffffffff;
        }
        return Math.random();
      };

      const timeOffset = randomFloat() * 1000;

      let composer: EffectComposer | undefined;
      let touch: ReturnType<typeof createTouchTexture> | undefined;
      let liquidEffect: Effect | undefined;

      if (liquid) {
        touch = createTouchTexture();
        touch.radiusScale = liquidRadius;
        composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        liquidEffect = createLiquidEffect(touch.texture, {
          strength: liquidStrength,
          freq: liquidWobbleSpeed,
        });
        const effectPass = new EffectPass(camera, liquidEffect);
        effectPass.renderToScreen = true;
        composer.addPass(renderPass);
        composer.addPass(effectPass);
      }

      if (noiseAmount > 0) {
        if (!composer) {
          composer = new EffectComposer(renderer);
          composer.addPass(new RenderPass(scene, camera));
        }

        const noiseEffect = new Effect(
          "NoiseEffect",
          `uniform float uTime; uniform float uAmount;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);}
          void mainUv(inout vec2 uv){}
          void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){
            float n=hash(floor(uv*vec2(1920.0,1080.0))+floor(uTime*60.0));
            float g=(n-0.5)*uAmount;
            outputColor=inputColor+vec4(vec3(g),0.0);
          }`,
          {
            uniforms: new Map<string, THREE.Uniform>([
              ["uTime", new THREE.Uniform(0)],
              ["uAmount", new THREE.Uniform(noiseAmount)],
            ]),
          },
        );

        const noisePass = new EffectPass(camera, noiseEffect);
        noisePass.renderToScreen = true;
        if (composer && composer.passes.length > 0)
          composer.passes.forEach(
            (p) => ((p as unknown as { renderToScreen: boolean }).renderToScreen = false),
          );
        composer.addPass(noisePass);
      }

      if (composer) composer.setSize(renderer.domElement.width, renderer.domElement.height);

      const mapToPixels = (e: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        const scaleX = renderer.domElement.width / rect.width;
        const scaleY = renderer.domElement.height / rect.height;
        const fx = (e.clientX - rect.left) * scaleX;
        const fy = (rect.height - (e.clientY - rect.top)) * scaleY;
        return { fx, fy, w: renderer.domElement.width, h: renderer.domElement.height };
      };

      const onPointerDown = (e: PointerEvent) => {
        const { fx, fy } = mapToPixels(e);
        const ix = threeRef.current?.clickIx ?? 0;
        const clickPos = uniforms.uClickPos.value[ix];
        if (clickPos) clickPos.set(fx, fy);
        uniforms.uClickTimes.value[ix] = uniforms.uTime.value;
        if (threeRef.current) threeRef.current.clickIx = (ix + 1) % MAX_CLICKS;
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!touch) return;
        const { fx, fy, w, h } = mapToPixels(e);
        touch.addTouch({ x: fx / w, y: fy / h });
      };

      renderer.domElement.addEventListener("pointerdown", onPointerDown, { passive: true });
      renderer.domElement.addEventListener("pointermove", onPointerMove, { passive: true });

      let raf = 0;

      const animate = () => {
        if (autoPauseOffscreen && !visibilityRef.current.visible) {
          raf = requestAnimationFrame(animate);
          return;
        }

        uniforms.uTime.value = timeOffset + clock.getElapsedTime() * speedRef.current;

        if (liquidEffect)
          (liquidEffect as unknown as { uniforms: Map<string, THREE.Uniform> }).uniforms.get(
            "uTime",
          )!.value = uniforms.uTime.value;

        if (composer) {
          if (touch) touch.update();
          composer.passes.forEach((p) => {
            const effs = (p as unknown as { effects?: Effect[] }).effects;
            if (effs)
              effs.forEach((eff) => {
                const u = (
                  eff as unknown as { uniforms?: Map<string, THREE.Uniform> }
                ).uniforms?.get("uTime");
                if (u) u.value = uniforms.uTime.value;
              });
          });
          composer.render();
        } else {
          renderer.render(scene, camera);
        }

        raf = requestAnimationFrame(animate);
      };

      raf = requestAnimationFrame(animate);

      threeRef.current = {
        renderer,
        scene,
        camera,
        material,
        clock,
        clickIx: 0,
        uniforms,
        resizeObserver: ro,
        raf,
        quad,
        timeOffset,
        composer,
        touch,
        liquidEffect,
      };
    } else {
      const t = threeRef.current!;
      t.uniforms.uShapeType.value = SHAPE_MAP[variant] ?? 0;
      t.uniforms.uPixelSize.value = pixelSize * t.renderer.getPixelRatio();
      t.uniforms.uColor.value.set(color);
      t.uniforms.uScale.value = patternScale;
      t.uniforms.uDensity.value = patternDensity;
      t.uniforms.uPixelJitter.value = pixelSizeJitter;
      t.uniforms.uEnableRipples.value = enableRipples ? 1 : 0;
      t.uniforms.uRippleIntensity.value = rippleIntensityScale;
      t.uniforms.uRippleThickness.value = rippleThickness;
      t.uniforms.uRippleSpeed.value = rippleSpeed;
      t.uniforms.uEdgeFade.value = edgeFade;

      if (transparent) t.renderer.setClearAlpha(0);
      else t.renderer.setClearColor(0x000000, 1);

      if (t.liquidEffect) {
        const uStrength = (
          t.liquidEffect as unknown as { uniforms: Map<string, THREE.Uniform> }
        ).uniforms.get("uStrength");
        if (uStrength) uStrength.value = liquidStrength;
        const uFreq = (
          t.liquidEffect as unknown as { uniforms: Map<string, THREE.Uniform> }
        ).uniforms.get("uFreq");
        if (uFreq) uFreq.value = liquidWobbleSpeed;
      }

      if (t.touch) t.touch.radiusScale = liquidRadius;
    }

    prevConfigRef.current = cfg;

    return () => {
      if (threeRef.current && mustReinit) return;
      if (!threeRef.current) return;
      const t = threeRef.current;
      t.resizeObserver?.disconnect();
      cancelAnimationFrame(t.raf!);
      t.quad?.geometry.dispose();
      t.material.dispose();
      t.composer?.dispose();
      t.renderer.dispose();
      if (t.renderer.domElement.parentElement === container)
        container.removeChild(t.renderer.domElement);
      threeRef.current = null;
    };
  }, [
    antialias,
    liquid,
    noiseAmount,
    pixelSize,
    patternScale,
    patternDensity,
    enableRipples,
    rippleIntensityScale,
    rippleThickness,
    rippleSpeed,
    pixelSizeJitter,
    edgeFade,
    transparent,
    liquidStrength,
    liquidRadius,
    liquidWobbleSpeed,
    autoPauseOffscreen,
    variant,
    color,
    speed,
  ]);

  return (
    <div
      ref={containerRef}
      className={`pixel-blast-container ${className ?? ""}`}
      style={style}
      aria-label="PixelBlast interactive background"
    />
  );
};

export default PixelBlast;
