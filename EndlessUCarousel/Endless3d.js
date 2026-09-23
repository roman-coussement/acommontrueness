var __dai_window=typeof window!=="undefined"?window:undefined;var __dai_navigator=typeof __dai_window!=="undefined"?navigator:undefined;

// http-url:https://framerusercontent.com/modules/amkmn6YYZYf0LCajqm0f/d71QX2WCSAUKVh4IY1SV/Endless_3D_Carousel.js
import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { addPropertyControls, ControlType, useIsStaticRenderer } from "./_framer-runtime.js";
function EndlessUCarousel(incomingProps) {
  const props = { ...incomingProps, ...incomingProps.interaction || {}, ...incomingProps.carousel || {}, ...incomingProps.layout || {}, ...incomingProps.styleGroup || {} };
  const mountRef = useRef(null);
  const isStatic = useIsStaticRenderer();
  const propsRef = useRef(props);
  propsRef.current = props;
  const needsUpdate = useRef(true);
  const interactionState = useRef({ isDragging: false, lastX: 0, targetRotation: (props.initialRotation || 0) * (Math.PI / 180), currentRotation: (props.initialRotation || 0) * (Math.PI / 180), initialRotTracker: props.initialRotation });
  useEffect(() => {
    needsUpdate.current = true;
  }, [props]);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount)
      return;
    let width = mount.clientWidth;
    let height = mount.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(propsRef.current.fov, width / height, 0.1, 1e3);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(__dai_window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    const carouselGroup = new THREE.Group();
    scene.add(carouselGroup);
    const materials = [];
    const meshes = [];
    const videoElements = [];
    let currentGeometry = null;
    const textureLoader = new THREE.TextureLoader();
    carouselGroup.rotation.y = interactionState.current.currentRotation;
    const buildCarousel = () => {
      const p = propsRef.current;
      carouselGroup.clear();
      if (currentGeometry)
        currentGeometry.dispose();
      materials.forEach((m) => {
        if (m.map)
          m.map.dispose();
        m.dispose();
      });
      materials.length = 0;
      meshes.length = 0;
      videoElements.forEach((v) => {
        v.pause();
        v.removeAttribute("src");
        v.load();
      });
      videoElements.length = 0;
      scene.background = p.transparentBg ? null : new THREE.Color(p.backgroundColor);
      if (p.fog) {
        scene.fog = new THREE.Fog(p.fogColor, p.fogNear, p.fogFar);
      } else {
        scene.fog = null;
      }
      camera.fov = p.fov;
      camera.position.set(p.cameraX, p.cameraY, p.cameraZ);
      camera.rotation.set(0, p.cameraPanY * (Math.PI / 180), 0);
      camera.updateProjectionMatrix();
      const w = p.itemWidth;
      const h = p.itemHeight;
      const r = p.radius;
      const c = Math.max(3, p.count || 12);
      currentGeometry = new THREE.PlaneGeometry(w, h, 32, 1);
      const pos = currentGeometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const theta = x / r;
        pos.setX(i, Math.sin(theta) * r);
        pos.setZ(i, Math.cos(theta) * r - r);
      }
      currentGeometry.computeVertexNormals();
      const mediaList = p.media && p.media.length > 0 ? p.media : [{ mediaType: "image", image: "" }];
      for (let i = 0; i < c; i++) {
        const item = mediaList[i % mediaList.length];
        const material = new THREE.MeshBasicMaterial({ color: 16777215, side: THREE.DoubleSide });
        const isVideo = item && item.mediaType === "video" && item.video;
        const isImage = item && item.mediaType === "image" && item.image;
        if (isVideo) {
          const videoEl = document.createElement("video");
          videoEl.src = item.video;
          videoEl.crossOrigin = "anonymous";
          videoEl.loop = true;
          videoEl.muted = true;
          videoEl.playsInline = true;
          videoEl.play().catch(() => {
          });
          videoElements.push(videoEl);
          const texture = new THREE.VideoTexture(videoEl);
          if (THREE.SRGBColorSpace)
            texture.colorSpace = THREE.SRGBColorSpace;
          else
            texture.encoding = 3001;
          material.map = texture;
          material.needsUpdate = true;
          needsUpdate.current = true;
        } else if (isImage) {
          textureLoader.load(item.image, (texture) => {
            if (THREE.SRGBColorSpace)
              texture.colorSpace = THREE.SRGBColorSpace;
            else
              texture.encoding = 3001;
            material.map = texture;
            material.needsUpdate = true;
            needsUpdate.current = true;
          });
        } else {
          const canvas = document.createElement("canvas");
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = i % 2 === 0 ? "#111" : "#222";
          ctx.fillRect(0, 0, 512, 512);
          const tex = new THREE.CanvasTexture(canvas);
          if (THREE.SRGBColorSpace)
            tex.colorSpace = THREE.SRGBColorSpace;
          material.map = tex;
        }
        materials.push(material);
        const mesh = new THREE.Mesh(currentGeometry, material);
        const angle = i / c * Math.PI * 2;
        mesh.position.set(Math.sin(angle) * r, 0, Math.cos(angle) * r);
        mesh.rotation.y = angle;
        carouselGroup.add(mesh);
        meshes.push(mesh);
      }
    };
    buildCarousel();
    const state = interactionState.current;
    const handlePointerDown = (e) => {
      state.isDragging = true;
      state.lastX = e.clientX;
      mount.style.cursor = "grabbing";
      mount.setPointerCapture(e.pointerId);
      needsUpdate.current = true;
    };
    const handlePointerMove = (e) => {
      if (!state.isDragging)
        return;
      const deltaX = e.clientX - state.lastX;
      state.lastX = e.clientX;
      state.targetRotation -= deltaX * 5e-3;
      needsUpdate.current = true;
    };
    const handlePointerUp = (e) => {
      state.isDragging = false;
      mount.style.cursor = "grab";
      mount.releasePointerCapture(e.pointerId);
      needsUpdate.current = true;
    };
    mount.addEventListener("pointerdown", handlePointerDown);
    mount.addEventListener("pointermove", handlePointerMove);
    mount.addEventListener("pointerup", handlePointerUp);
    mount.addEventListener("pointercancel", handlePointerUp);
    let isVisible = false;
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible)
        needsUpdate.current = true;
    });
    observer.observe(mount);
    const resizeObserver = new ResizeObserver(() => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      needsUpdate.current = true;
    });
    resizeObserver.observe(mount);
    let reqId;
    let lastTime = performance.now();
    const getRebuildProps = (p) => JSON.stringify({ count: p.count, r: p.radius, w: p.itemWidth, h: p.itemHeight, media: p.media, fog: p.fog, fogC: p.fogColor, fogN: p.fogNear, fogF: p.fogFar, bg: p.backgroundColor, tr: p.transparentBg, cx: p.cameraX, cy: p.cameraY, cz: p.cameraZ, cp: p.cameraPanY, f: p.fov });
    let lastPropsStr = getRebuildProps(propsRef.current);
    const animate = (time) => {
      reqId = requestAnimationFrame(animate);
      let delta = (time - lastTime) / 1e3;
      delta = Math.min(delta, 0.1);
      lastTime = time;
      const isLive = !isStatic;
      const p = propsRef.current;
      const isPlaying = isLive ? p.autoPlay : p.livePreview;
      if (p.initialRotation !== state.initialRotTracker) {
        state.initialRotTracker = p.initialRotation;
        state.targetRotation = p.initialRotation * (Math.PI / 180);
      }
      const newPropsStr = getRebuildProps(p);
      if (newPropsStr !== lastPropsStr) {
        lastPropsStr = newPropsStr;
        buildCarousel();
        needsUpdate.current = true;
      }
      if (isPlaying && !state.isDragging) {
        state.targetRotation += p.speed * delta;
      }
      const diff = state.targetRotation - state.currentRotation;
      const dampingFactor = Math.max(1, p.damping || 10);
      if (Math.abs(diff) > 1e-4 || state.isDragging || isPlaying) {
        state.currentRotation += diff * dampingFactor * delta;
        carouselGroup.rotation.y = state.currentRotation;
        needsUpdate.current = true;
      } else {
        state.currentRotation = state.targetRotation;
        carouselGroup.rotation.y = state.currentRotation;
      }
      if (isLive && !isVisible)
        return;
      const hasVideoPlaying = videoElements.length > 0;
      if (!needsUpdate.current && !hasVideoPlaying)
        return;
      needsUpdate.current = false;
      renderer.render(scene, camera);
    };
    reqId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(reqId);
      observer.disconnect();
      resizeObserver.disconnect();
      mount.removeEventListener("pointerdown", handlePointerDown);
      mount.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("pointerup", handlePointerUp);
      mount.removeEventListener("pointercancel", handlePointerUp);
      if (currentGeometry)
        currentGeometry.dispose();
      materials.forEach((m) => {
        if (m.map)
          m.map.dispose();
        m.dispose();
      });
      videoElements.forEach((v) => {
        v.pause();
        v.removeAttribute("src");
        v.load();
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);
  return /* @__PURE__ */ _jsx("div", { ref: mountRef, style: { width: "100%", height: "100%", position: "relative", overflow: "hidden", touchAction: "none", cursor: "grab" } });
}
EndlessUCarousel.defaultProps = { media: [], interaction: { livePreview: true, autoPlay: true, speed: 0.25, damping: 10 }, carousel: { count: 14, radius: 12, itemWidth: 4.5, itemHeight: 6.5, initialRotation: 0 }, layout: { cameraX: 4.5, cameraY: 0, cameraZ: 7, cameraPanY: 28, fov: 65 }, styleGroup: { transparentBg: false, backgroundColor: "#000000", fog: true, fogColor: "#000000", fogNear: 5, fogFar: 28 } };
addPropertyControls(EndlessUCarousel, { media: { title: "Media", type: ControlType.Array, description: "Upload images or videos. Will dynamically repeat to fill the radius if there are fewer files than the Item Count.", control: { type: ControlType.Object, controls: { mediaType: { title: "Type", type: ControlType.Enum, options: ["image", "video"], optionTitles: ["Image", "Video"], defaultValue: "image" }, image: { title: "Image", type: ControlType.Image, hidden(props) {
  return props.mediaType !== "image";
} }, video: { title: "Video", type: ControlType.File, allowedFileTypes: ["mp4", "webm", "mov", "qt", "m4v"], hidden(props) {
  return props.mediaType !== "video";
} } } } }, interaction: { title: "Interaction", type: ControlType.Object, controls: { livePreview: { title: "Editor Preview", type: ControlType.Boolean }, autoPlay: { title: "Auto Play", type: ControlType.Boolean }, speed: { title: "Auto Speed", type: ControlType.Number, min: -5, max: 5, step: 0.05, displayStepper: true }, damping: { title: "Drag Damping", type: ControlType.Number, min: 1, max: 30, step: 1, description: "Lower is floatier, higher is tighter." } } }, carousel: { title: "Carousel Bounds", type: ControlType.Object, controls: { count: { title: "Item Count", type: ControlType.Number, min: 3, max: 60, step: 1 }, radius: { title: "Curve Radius", type: ControlType.Number, min: 2, max: 80, step: 0.5 }, itemWidth: { title: "Item Width", type: ControlType.Number, min: 0.1, max: 30, step: 0.1 }, itemHeight: { title: "Item Height", type: ControlType.Number, min: 0.1, max: 30, step: 0.1 }, initialRotation: { title: "Start Offset", type: ControlType.Number, min: 0, max: 360, step: 1 } } }, layout: { title: "Perspective Base", type: ControlType.Object, controls: { cameraX: { title: "Cam X", type: ControlType.Number, min: -30, max: 30, step: 0.5 }, cameraY: { title: "Cam Y", type: ControlType.Number, min: -30, max: 30, step: 0.5 }, cameraZ: { title: "Cam Z", type: ControlType.Number, min: -30, max: 30, step: 0.5 }, cameraPanY: { title: "Cam Pan Yaw", type: ControlType.Number, min: -180, max: 180, step: 1 }, fov: { title: "Fiel of View", type: ControlType.Number, min: 10, max: 150, step: 1 } } }, styleGroup: { title: "Environment", type: ControlType.Object, controls: { transparentBg: { title: "Transparent Bg", type: ControlType.Boolean }, backgroundColor: { title: "Background", type: ControlType.Color }, fog: { title: "Enable Fog Fade", type: ControlType.Boolean }, fogColor: { title: "Fog Color", type: ControlType.Color }, fogNear: { title: "Fade Start", type: ControlType.Number, min: 0, max: 50, step: 1 }, fogFar: { title: "Fade End", type: ControlType.Number, min: 0, max: 200, step: 1 } } } });
var __FramerMetadata__ = { "exports": { "default": { "type": "reactComponent", "name": "EndlessUCarousel", "slots": [], "annotations": { "framerContractVersion": "1" } }, "__FramerMetadata__": { "type": "variable" } } };
export {
  __FramerMetadata__,
  EndlessUCarousel as default
};
