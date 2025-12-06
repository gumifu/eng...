"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { SpotifyPlaybackVisualState } from "@/lib/types";

interface FerrofluidVisualizerProps {
  state: SpotifyPlaybackVisualState;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

// Enhanced Visual Preset with physics parameters
type VisualPreset = {
  name: string;
  noiseAmplitude: number;
  rotationSpeed: number;
  pulseIntensity: number;
  color: string;
  wobbleIntensity: number;
  spikeThreshold: number;        // Rosensweig instability threshold
  springStiffness: number;       // Spring physics parameter
  springDamping: number;         // Damping for spring physics
  separationIntensity: number;   // How much fluid separates on attacks
  gravityStrength: number;       // Gravity effect strength
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Smoothstep function for threshold transitions
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

// Ease-out-back for overshoot effect
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function getVisualPreset(energy: number, valence: number): VisualPreset {
  // A) High energy (>= 0.7), high valence (>= 0.7) - Energetic Happy
  if (energy >= 0.7 && valence >= 0.7) {
    return {
      name: "Energetic Happy",
      noiseAmplitude: 0.8 + energy * 0.3,
      rotationSpeed: 0.5 + energy * 1.5,
      pulseIntensity: energy * 0.5,
      color: "#FFD580", // Warm bright yellow/orange
      wobbleIntensity: 0.0,
      spikeThreshold: 0.4, // Moderate threshold
      springStiffness: 0.15, // Snappy but not too tight
      springDamping: 0.08, // Moderate damping
      separationIntensity: 0.6, // Moderate separation
      gravityStrength: 0.3, // Light gravity
    };
  }

  // B) High energy, low valence (< 0.4) - Aggressive Dark
  if (energy >= 0.7 && valence < 0.4) {
    return {
      name: "Aggressive Dark",
      noiseAmplitude: 0.9 + energy * 0.2,
      rotationSpeed: 0.4 + energy * 1.2,
      pulseIntensity: energy * 0.4,
      color: "#8B0000", // Dark red
      wobbleIntensity: 0.3,
      spikeThreshold: 0.3, // Lower threshold = spikes appear easier
      springStiffness: 0.2, // Very snappy
      springDamping: 0.05, // Low damping = more overshoot
      separationIntensity: 0.9, // Strong separation
      gravityStrength: 0.5, // Stronger gravity
    };
  }

  // C) Low energy (< 0.4), high valence - Calm Bright
  if (energy < 0.4 && valence >= 0.7) {
    return {
      name: "Calm Bright",
      noiseAmplitude: 0.1 + energy * 0.2,
      rotationSpeed: 0.05 + energy * 0.2,
      pulseIntensity: energy * 0.1,
      color: "#FFE5B4", // Soft pastel
      wobbleIntensity: 0.0,
      spikeThreshold: 0.7, // High threshold = mostly smooth
      springStiffness: 0.05, // Very loose
      springDamping: 0.12, // High damping = smooth settling
      separationIntensity: 0.2, // Minimal separation
      gravityStrength: 0.1, // Very light gravity
    };
  }

  // D) Low energy, low valence - Minimal Dark
  if (energy < 0.4 && valence < 0.4) {
    return {
      name: "Minimal Dark",
      noiseAmplitude: 0.05 + energy * 0.1,
      rotationSpeed: 0.02 + energy * 0.1,
      pulseIntensity: energy * 0.05,
      color: "#4B5EFF", // Cold blue/purple
      wobbleIntensity: 0.0,
      spikeThreshold: 0.8, // Very high threshold
      springStiffness: 0.03, // Very loose
      springDamping: 0.15, // High damping = sluggish
      separationIntensity: 0.1, // Almost no separation
      gravityStrength: 0.2, // Moderate gravity (sinking feeling)
    };
  }

  // Default: medium energy/valence - Balanced
  return {
    name: "Balanced",
    noiseAmplitude: 0.1 + energy * 0.6,
    rotationSpeed: 0.1 + energy * 0.8,
    pulseIntensity: energy * 0.3,
    color: "#FFFFFF",
    wobbleIntensity: energy * 0.1,
    spikeThreshold: 0.5,
    springStiffness: 0.1,
    springDamping: 0.1,
    separationIntensity: 0.4,
    gravityStrength: 0.3,
  };
}

// Spring-damper physics system
class SpringDamper {
  value: number = 0;
  velocity: number = 0;
  target: number = 0;
  stiffness: number = 0.1;
  damping: number = 0.1;

  update(deltaTime: number) {
    const force = (this.target - this.value) * this.stiffness;
    const dampingForce = this.velocity * this.damping;
    const acceleration = force - dampingForce;

    this.velocity += acceleration * deltaTime;
    this.value += this.velocity * deltaTime;
  }

  setTarget(target: number) {
    this.target = target;
  }

  setStiffness(stiffness: number) {
    this.stiffness = stiffness;
  }

  setDamping(damping: number) {
    this.damping = damping;
  }
}

export default function FerrofluidVisualizer({
  state,
  canvasRef,
}: FerrofluidVisualizerProps) {
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    mesh: THREE.Mesh;
    material: THREE.ShaderMaterial;
    time: number;
    elapsedTime: number;
    currentPreset: VisualPreset;
    lastTrackId: string;
    // Physics state
    spikeFactorSpring: SpringDamper;
    separationSpring: SpringDamper;
    scaleSpring: SpringDamper;
    // Audio analysis state
    lastEnergy: number;
    energyVelocity: number;
    beatPhase: number;
    lastBeatTime: number;
  } | null>(null);
  const animationFrameRef = useRef<number>();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || isInitialized) return;

    const canvas = canvasRef.current;
    const checkDimensions = () => {
      const width = canvas.clientWidth || canvas.width || 800;
      const height = canvas.clientHeight || canvas.height || 600;

      if (width === 0 || height === 0) {
        setTimeout(checkDimensions, 100);
        return;
      }

      initializeScene(canvas, width, height);
    };

    const initializeScene = (canvas: HTMLCanvasElement, width: number, height: number) => {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 3;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const initialPreset = getVisualPreset(state.energy, state.valence);

      // Initialize spring systems
      const spikeFactorSpring = new SpringDamper();
      spikeFactorSpring.setStiffness(initialPreset.springStiffness);
      spikeFactorSpring.setDamping(initialPreset.springDamping);
      spikeFactorSpring.value = 0;
      spikeFactorSpring.target = 0;

      const separationSpring = new SpringDamper();
      separationSpring.setStiffness(0.12);
      separationSpring.setDamping(0.1);
      separationSpring.value = 0;
      separationSpring.target = 0;

      const scaleSpring = new SpringDamper();
      scaleSpring.setStiffness(0.2);
      scaleSpring.setDamping(0.15);
      scaleSpring.value = 1.0;
      scaleSpring.target = 1.0;

      const hexToVec3 = (hex: string): [number, number, number] => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return [r, g, b];
      };

      const initialColor = hexToVec3(initialPreset.color);

      // Enhanced ferrofluid shader with Rosensweig instability and physics
      const vertexShader = `
        uniform float uTime;
        uniform float uTempo;
        uniform float uEnergy;
        uniform float uValence;
        uniform float uProgress;
        uniform float uIsPlaying;
        uniform float uNoiseAmplitude;
        uniform float uWobbleIntensity;
        uniform float uSpikeFactor;        // Spring-controlled spike factor
        uniform float uSeparationFactor;    // Separation/reunion factor
        uniform float uSpikeThreshold;      // Rosensweig threshold
        uniform float uGravityStrength;     // Gravity effect
        uniform float uBassPulse;           // Bass frequency response
        uniform float uMidWobble;           // Mid frequency response
        uniform float uTrebleShimmer;       // Treble frequency response

        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vSpikeFactor;

        // Improved 3D noise
        float hash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);

          float n = i.x + i.y * 57.0 + 113.0 * i.z;
          return mix(
            mix(mix(hash(vec3(n + 0.0)), hash(vec3(n + 1.0)), f.x),
                mix(hash(vec3(n + 57.0)), hash(vec3(n + 58.0)), f.x), f.y),
            mix(mix(hash(vec3(n + 113.0)), hash(vec3(n + 114.0)), f.x),
                mix(hash(vec3(n + 170.0)), hash(vec3(n + 171.0)), f.x), f.y),
            f.z
          );
        }

        float fbm(vec3 p, int octaves) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          for (int i = 0; i < 4; i++) {
            if (i >= octaves) break;
            value += amplitude * noise(p * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vPosition = position;
          vNormal = normal;

          vec3 pos = position;
          float dist = length(pos);

          // Time-based animation speed
          float tempoFactor = uTempo / 120.0;
          float timeSpeed = uTime * tempoFactor * (0.5 + uEnergy * 0.5);

          // Rosensweig Instability: Threshold-based spike formation
          // Below threshold: smooth blob, above threshold: spikes
          // Only active when playing
          float energyLevel = uEnergy;
          float thresholdTransition = smoothstep(uSpikeThreshold - 0.1, uSpikeThreshold + 0.1, energyLevel);

          // Combine threshold with spring-controlled spike factor
          // When not playing (uIsPlaying < 0.5), force spike factor to 0
          float activeSpikeFactor = uIsPlaying > 0.5 ? uSpikeFactor : 0.0;
          float effectiveSpikeFactor = activeSpikeFactor * thresholdTransition;

          // Frequency band responses (only when playing)
          float playingFactor = step(0.5, uIsPlaying);

          // Bass: vertical pulse and overall scale
          float bassEffect = uBassPulse * playingFactor;
          pos.y += bassEffect * 0.3 * normal.y; // Vertical stretch on bass

          // Mid: wobble and sway
          float midEffect = uMidWobble * playingFactor;
          vec3 midWobble = vec3(
            sin(timeSpeed * 2.0 + pos.x * 3.0) * midEffect,
            cos(timeSpeed * 1.7 + pos.y * 3.0) * midEffect,
            sin(timeSpeed * 2.3 + pos.z * 3.0) * midEffect
          ) * 0.15;

          // Treble: surface shimmer
          float trebleEffect = uTrebleShimmer * playingFactor;
          float trebleNoise = fbm(pos * 20.0 + timeSpeed * 5.0, 2) * trebleEffect * 0.05;

          // Separation/Reunion effect (attack/release)
          float separation = uSeparationFactor * playingFactor;
          vec3 separationOffset = normal * separation * 0.4;

          // Gravity effect: downward pull (only when playing)
          float gravity = uGravityStrength * playingFactor;
          vec3 gravityOffset = vec3(0.0, -gravity * 0.2, 0.0);

          // Noise-based spike deformation
          float spikeNoise1 = fbm(pos * 10.0 + timeSpeed * 0.5, 4);
          float spikeNoise2 = fbm(pos * 15.0 + timeSpeed * 0.7, 3);
          float spikeNoise3 = fbm(pos * 20.0 + timeSpeed * 0.9, 2);
          float combinedNoise = (spikeNoise1 + spikeNoise2 * 0.7 + spikeNoise3 * 0.5) / 2.2;

          // Spike displacement with threshold
          float spikeLength = (combinedNoise - 0.3) * uNoiseAmplitude * effectiveSpikeFactor;
          spikeLength = max(0.0, spikeLength);

          vSpikeFactor = spikeLength;

          // Base organic deformation (only when playing)
          vec3 noiseOffset = vec3(
            fbm(pos * 5.0 + timeSpeed * 0.3, 3),
            fbm(pos * 5.0 + vec3(0.0, 100.0, 0.0) + timeSpeed * 0.3, 3),
            fbm(pos * 5.0 + vec3(0.0, 0.0, 100.0) + timeSpeed * 0.3, 3)
          );
          noiseOffset = (noiseOffset - 0.5) * 2.0;

          // Apply all deformations (multiply by playingFactor to disable when not playing)
          pos += normal * noiseOffset * uNoiseAmplitude * 0.3 * (1.0 - effectiveSpikeFactor * 0.5) * playingFactor;
          pos += normal * spikeLength;
          pos += midWobble;
          pos += normal * trebleNoise;
          pos += separationOffset;
          pos += gravityOffset;

          // Wobble for chaotic motion (only when playing)
          if (uWobbleIntensity > 0.0 && uIsPlaying > 0.5) {
            vec3 wobble = vec3(
              sin(timeSpeed * 2.0) * uWobbleIntensity,
              cos(timeSpeed * 1.7) * uWobbleIntensity,
              sin(timeSpeed * 2.3) * uWobbleIntensity
            );
            pos += wobble * 0.1;
          }

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `;

      const fragmentShader = `
        uniform float uTime;
        uniform float uTempo;
        uniform float uEnergy;
        uniform float uValence;
        uniform float uProgress;
        uniform float uIsPlaying;
        uniform vec3 uColor;
        uniform vec3 uCameraPosition;
        uniform float uTrebleShimmer;

        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vSpikeFactor;

        void main() {
          vec3 baseColor = uColor;
          baseColor *= (0.6 + uEnergy * 0.4);

          // Calculate fresnel in fragment shader
          vec3 viewDir = normalize(uCameraPosition - vPosition);
          float fresnel = pow(1.0 - dot(viewDir, normalize(vNormal)), 1.5);

          // Spike highlights
          float spikeHighlight = vSpikeFactor * 0.8;

          // Treble shimmer effect
          float shimmer = 0.0;
          if (uIsPlaying > 0.5 && uTrebleShimmer > 0.1) {
            float tempoFactor = uTempo / 120.0;
            shimmer = sin(vPosition.x * 8.0 + uTime * tempoFactor * 2.0) * 0.2 * uTrebleShimmer;
            shimmer *= fresnel;
          }

          vec3 finalColor = baseColor * (1.0 + fresnel * 0.4 + spikeHighlight + shimmer);
          finalColor = min(finalColor, vec3(1.0));

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `;

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uTempo: { value: state.tempo },
          uEnergy: { value: state.energy },
          uValence: { value: state.valence },
          uProgress: { value: state.progress },
          uIsPlaying: { value: state.isPlaying ? 1.0 : 0.0 },
          uNoiseAmplitude: { value: initialPreset.noiseAmplitude },
          uWobbleIntensity: { value: initialPreset.wobbleIntensity },
          uColor: { value: new THREE.Vector3(...initialColor) },
          uCameraPosition: { value: camera.position },
          uSpikeFactor: { value: 0 },
          uSeparationFactor: { value: 0 },
          uSpikeThreshold: { value: initialPreset.spikeThreshold },
          uGravityStrength: { value: initialPreset.gravityStrength },
          uBassPulse: { value: 0 },
          uMidWobble: { value: 0 },
          uTrebleShimmer: { value: 0 },
        },
      });

      const geometry = new THREE.IcosahedronGeometry(1, 80);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const pointLight1 = new THREE.PointLight(0xffffff, 1.2, 100);
      pointLight1.position.set(3, 3, 3);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xffffff, 0.8, 100);
      pointLight2.position.set(-3, -3, -3);
      scene.add(pointLight2);

      sceneRef.current = {
        scene,
        camera,
        renderer,
        mesh,
        material,
        time: 0,
        elapsedTime: 0,
        currentPreset: initialPreset,
        lastTrackId: state.trackId || "",
        spikeFactorSpring,
        separationSpring,
        scaleSpring,
        lastEnergy: state.energy,
        energyVelocity: 0,
        beatPhase: 0,
        lastBeatTime: 0,
      };

      setIsInitialized(true);
    };

    checkDimensions();

    const handleResize = () => {
      if (!canvasRef.current || !sceneRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;

      if (width > 0 && height > 0) {
        sceneRef.current.camera.aspect = width / height;
        sceneRef.current.camera.updateProjectionMatrix();
        sceneRef.current.renderer.setSize(width, height);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef, isInitialized]);

  useEffect(() => {
    if (!sceneRef.current || !isInitialized) return;

    // Track change: update preset
    const trackChanged = state.trackId !== sceneRef.current.lastTrackId;
    if (trackChanged && state.trackId) {
      sceneRef.current.lastTrackId = state.trackId;
      const newPreset = getVisualPreset(state.energy, state.valence);
      sceneRef.current.currentPreset = newPreset;

      // Update spring parameters
      sceneRef.current.spikeFactorSpring.setStiffness(newPreset.springStiffness);
      sceneRef.current.spikeFactorSpring.setDamping(newPreset.springDamping);

      const hexToVec3 = (hex: string): [number, number, number] => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return [r, g, b];
      };

      const newColor = hexToVec3(newPreset.color);
      sceneRef.current.material.uniforms.uNoiseAmplitude.value = newPreset.noiseAmplitude;
      sceneRef.current.material.uniforms.uWobbleIntensity.value = newPreset.wobbleIntensity;
      sceneRef.current.material.uniforms.uColor.value = new THREE.Vector3(...newColor);
      sceneRef.current.material.uniforms.uSpikeThreshold.value = newPreset.spikeThreshold;
      sceneRef.current.material.uniforms.uGravityStrength.value = newPreset.gravityStrength;
    }

    let frameCount = 0;
    const animate = () => {
      if (!sceneRef.current) return;

      frameCount++;
      const { scene, camera, renderer, material, mesh } = sceneRef.current;
      const deltaTime = 0.016; // ~60fps

      sceneRef.current.time += deltaTime;
      sceneRef.current.elapsedTime += deltaTime;

      const preset = sceneRef.current.currentPreset;

      // Update spring systems
      sceneRef.current.spikeFactorSpring.update(deltaTime);
      sceneRef.current.separationSpring.update(deltaTime);
      sceneRef.current.scaleSpring.update(deltaTime);

      // Calculate energy velocity (attack/release detection)
      const energyDelta = state.energy - sceneRef.current.lastEnergy;
      const energyAccel = (energyDelta - sceneRef.current.energyVelocity) / deltaTime;
      sceneRef.current.energyVelocity = energyDelta / deltaTime;
      sceneRef.current.lastEnergy = state.energy;

      // Check if connected and playing
      const isActive = state.trackId && state.isPlaying;

      // Rosensweig Instability: Set spike target based on energy (only when active)
      const spikeTarget = isActive && state.energy > preset.spikeThreshold ? 1.0 : 0.0;
      sceneRef.current.spikeFactorSpring.setTarget(spikeTarget);

      // Attack/Release: Separation on rapid energy increase (only when active)
      if (isActive) {
        const attackThreshold = 0.3; // Energy increase rate threshold
        const releaseThreshold = -0.2; // Energy decrease rate threshold

        if (sceneRef.current.energyVelocity > attackThreshold) {
          // Attack: separate fluid
          sceneRef.current.separationSpring.setTarget(preset.separationIntensity);
        } else if (sceneRef.current.energyVelocity < releaseThreshold) {
          // Release: reunite fluid
          sceneRef.current.separationSpring.setTarget(0.0);
        }
      } else {
        // Not active: reunite to smooth sphere
        sceneRef.current.separationSpring.setTarget(0.0);
      }

      // Beat detection and tempo sync (only when active)
      let beatPhase = 0;
      let bassPulse = 0;
      let midWobble = 0;
      let trebleShimmer = 0;

      if (isActive && state.tempo > 0) {
        const beatInterval = 60.0 / state.tempo;
        const currentTime = sceneRef.current.elapsedTime;
        beatPhase = (currentTime % beatInterval) / beatInterval;
        sceneRef.current.beatPhase = beatPhase;

        // Beat-triggered spike boost
        const beatPulse = Math.exp(-15.0 * Math.pow(beatPhase - 0.5, 2.0));
        if (beatPulse > 0.8 && currentTime - sceneRef.current.lastBeatTime > beatInterval * 0.8) {
          // Strong beat detected - boost spike factor
          sceneRef.current.spikeFactorSpring.setTarget(1.0);
          sceneRef.current.lastBeatTime = currentTime;
        }

        // Frequency band simulation (using energy and tempo as proxies)
        // Bass: low frequency content (use energy with low-pass filtering)
        bassPulse = state.energy * (0.5 + 0.5 * Math.sin(beatPhase * Math.PI * 2));

        // Mid: moderate frequency (use energy with some variation)
        midWobble = state.energy * 0.7 + Math.sin(sceneRef.current.time * 2.0) * 0.3;

        // Treble: high frequency (use energy with fast oscillation)
        trebleShimmer = state.energy * (0.3 + 0.7 * Math.abs(Math.sin(sceneRef.current.time * 8.0)));

        // Scale pulse on beat (bass-driven)
        const beatPulseScale = Math.exp(-10.0 * Math.pow(beatPhase - 0.5, 2.0));
        const scaleTarget = 1.0 + beatPulseScale * preset.pulseIntensity;
        sceneRef.current.scaleSpring.setTarget(scaleTarget);
      } else {
        // Not active: stop all animations, return to sphere
        sceneRef.current.scaleSpring.setTarget(1.0);
        sceneRef.current.beatPhase = 0;
      }

      // Apply spring-controlled scale
      mesh.scale.setScalar(sceneRef.current.scaleSpring.value);

      // Update uniforms
      material.uniforms.uTime.value = sceneRef.current.time;
      material.uniforms.uTempo.value = state.tempo;
      material.uniforms.uEnergy.value = state.energy;
      material.uniforms.uValence.value = state.valence;
      material.uniforms.uProgress.value = state.progress;
      material.uniforms.uIsPlaying.value = state.isPlaying ? 1.0 : 0.0;
      material.uniforms.uCameraPosition.value = camera.position;
      material.uniforms.uSpikeFactor.value = sceneRef.current.spikeFactorSpring.value;
      material.uniforms.uSeparationFactor.value = sceneRef.current.separationSpring.value;
      material.uniforms.uBassPulse.value = bassPulse;
      material.uniforms.uMidWobble.value = midWobble;
      material.uniforms.uTrebleShimmer.value = trebleShimmer;

      // Rotation (only when active)
      if (isActive && mesh) {
        const normalizedTempo = clamp((state.tempo - 60) / (180 - 60), 0, 1);
        const baseRotationSpeed = 0.1 + normalizedTempo * 1.5;
        const rotationSpeed = baseRotationSpeed * preset.rotationSpeed;
        const finalRotationSpeed = rotationSpeed;

        mesh.rotation.y += finalRotationSpeed * deltaTime;
        mesh.rotation.x += finalRotationSpeed * 0.6 * deltaTime;
        mesh.rotation.z += finalRotationSpeed * 0.3 * deltaTime;
      }
      // When not active, rotation stops (mesh keeps current rotation)

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state, isInitialized]);

  return null;
}
