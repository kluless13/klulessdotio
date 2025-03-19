"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Color, Raycaster, Vector2 } from "three";
import ThreeGlobe from "three-globe";
import { Canvas, useThree, extend, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import countries from "@/data/globe.json";
import { visitedCountries, workCountries, highlightColors } from "@/data/visited-countries";

extend({ ThreeGlobe });

const RING_PROPAGATION_SPEED = 3;
const aspect = 1.2;
const cameraZ = 300;

export function Globe({
  globeConfig,
  data,
  onCountryHover,
  onCountryClick
}) {
  const globeRef = useRef(null);
  const groupRef = useRef();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hoverCountry, setHoverCountry] = useState(null);

  // For raycasting and detecting hover/click events
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());
  const prevIntersected = useRef(null);
  const threeContext = useThree();

  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: highlightColors.default,
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  };

  useEffect(() => {
    if (!globeRef.current && groupRef.current) {
      globeRef.current = new ThreeGlobe();
      (groupRef.current).add(globeRef.current);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!globeRef.current || !isInitialized) return;

    const globeMaterial = globeRef.current.globeMaterial();
    globeMaterial.color = new Color(defaultProps.globeColor);
    globeMaterial.emissive = new Color(defaultProps.emissive);
    globeMaterial.emissiveIntensity = defaultProps.emissiveIntensity || 0.1;
    globeMaterial.shininess = defaultProps.shininess || 0.9;
  }, [
    isInitialized,
    defaultProps.globeColor,
    defaultProps.emissive,
    defaultProps.emissiveIntensity,
    defaultProps.shininess,
  ]);

  useEffect(() => {
    if (!globeRef.current || !isInitialized || !data) return;

    const arcs = data;
    let points = [];
    for (let i = 0; i < arcs.length; i++) {
      const arc = arcs[i];
      const rgb = hexToRgb(arc.color);
      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.startLat,
        lng: arc.startLng,
      });
      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.endLat,
        lng: arc.endLng,
      });
    }

    const filteredPoints = points.filter((v, i, a) =>
      a.findIndex((v2) =>
        ["lat", "lng"].every((k) => v2[k] === v[k])) === i);

    globeRef.current
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(defaultProps.showAtmosphere)
      .atmosphereColor(defaultProps.atmosphereColor)
      .atmosphereAltitude(defaultProps.atmosphereAltitude)
      .hexPolygonColor((feature) => {
        // Check if the country is in the visited countries list
        const countryCode = feature.properties.ISO_A3;
        
        if (visitedCountries.includes(countryCode)) {
          return highlightColors.visited;
        }
        
        if (workCountries.includes(countryCode)) {
          return highlightColors.work;
        }
        
        return highlightColors.default;
      });

    globeRef.current
      .arcsData(data)
      .arcStartLat((d) => d.startLat * 1)
      .arcStartLng((d) => d.startLng * 1)
      .arcEndLat((d) => d.endLat * 1)
      .arcEndLng((d) => d.endLng * 1)
      .arcColor((e) => e.color)
      .arcAltitude((e) => e.arcAlt * 1)
      .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
      .arcDashLength(defaultProps.arcLength)
      .arcDashInitialGap((e) => e.order * 1)
      .arcDashGap(15)
      .arcDashAnimateTime(() => defaultProps.arcTime);

    globeRef.current
      .pointsData(filteredPoints)
      .pointColor((e) => e.color)
      .pointsMerge(true)
      .pointAltitude(0.0)
      .pointRadius(2);

    globeRef.current
      .ringsData([])
      .ringColor(() => defaultProps.polygonColor)
      .ringMaxRadius(defaultProps.maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod((defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings);
  }, [
    isInitialized,
    data,
    defaultProps.pointSize,
    defaultProps.showAtmosphere,
    defaultProps.atmosphereColor,
    defaultProps.atmosphereAltitude,
    defaultProps.polygonColor,
    defaultProps.arcLength,
    defaultProps.arcTime,
    defaultProps.rings,
    defaultProps.maxRings,
  ]);

  useEffect(() => {
    if (!globeRef.current || !isInitialized || !data) return;

    const interval = setInterval(() => {
      if (!globeRef.current) return;

      const newNumbersOfRings = genRandomNumbers(0, data.length, Math.floor((data.length * 4) / 5));

      const ringsData = data
        .filter((d, i) => newNumbersOfRings.includes(i))
        .map((d) => ({
          lat: d.startLat,
          lng: d.startLng,
          color: d.color,
        }));

      globeRef.current.ringsData(ringsData);
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [isInitialized, data]);

  // Handle hover/click interactions
  const handleInteractions = useCallback((event, isClick = false) => {
    if (!globeRef.current || !isInitialized) return;

    // Calculate mouse position in normalized device coordinates
    const canvas = threeContext.gl.domElement;
    const rect = canvas.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.current.setFromCamera(mouse.current, threeContext.camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.current.intersectObjects(globeRef.current.children, true);
    
    // Find the first hexPolygon intersection
    const hexIntersect = intersects.find(obj => 
      obj.object && 
      obj.object.parent && 
      obj.object.__data && 
      obj.object.__data.properties
    );

    if (hexIntersect) {
      const country = hexIntersect.object.__data.properties;
      
      if (isClick) {
        // Handle click event
        onCountryClick && onCountryClick(country.ISO_A3, country.ADMIN);
      } else {
        // Handle hover event
        if (prevIntersected.current !== country.ISO_A3) {
          prevIntersected.current = country.ISO_A3;
          setHoverCountry(country);
          onCountryHover && onCountryHover(country.ISO_A3, country.ADMIN);
        }
      }
    } else {
      // No intersection, clear selection
      if (prevIntersected.current !== null) {
        prevIntersected.current = null;
        setHoverCountry(null);
        onCountryHover && onCountryHover(null);
      }
    }
  }, [isInitialized, onCountryHover, onCountryClick, threeContext]);

  // Handle click event
  const handleClick = useCallback((event) => {
    handleInteractions(event, true);
  }, [handleInteractions]);

  // Handle hover event - check continuously
  useFrame(() => {
    if (!threeContext || !threeContext.gl) return;
    
    // Get current mouse position from Three.js
    const canvas = threeContext.gl.domElement;
    if (!canvas) return;
    
    const state = threeContext.get();
    if (state && state.mouse && state.raycaster) {
      // Use the existing raycaster and mouse from r3f state
      const intersects = state.raycaster.intersectObjects(
        globeRef.current ? globeRef.current.children : [],
        true
      );
      
      // Find hex polygon intersection
      const hexIntersect = intersects.find(obj => 
        obj.object && 
        obj.object.parent && 
        obj.object.__data && 
        obj.object.__data.properties
      );
      
      if (hexIntersect) {
        const country = hexIntersect.object.__data.properties;
        if (prevIntersected.current !== country.ISO_A3) {
          prevIntersected.current = country.ISO_A3;
          setHoverCountry(country);
          onCountryHover && onCountryHover(country.ISO_A3, country.ADMIN);
        }
      } else if (prevIntersected.current !== null) {
        prevIntersected.current = null;
        setHoverCountry(null);
        onCountryHover && onCountryHover(null);
      }
    }
  });

  return <group ref={groupRef} onClick={handleClick} />;
}

export function WebGLRendererConfig() {
  const { gl, size } = useThree();

  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio);
    gl.setSize(size.width, size.height);
    gl.setClearColor(0xffaaff, 0);
  }, [gl, size]);

  return null;
}

export function World(props) {
  const { globeConfig, onCountryHover, onCountryClick } = props;
  
  return (
    <Canvas 
      camera={{ position: [0, 0, cameraZ], fov: 50, aspect, near: 180, far: 1800 }}
      gl={{ antialias: true, alpha: true }}
      scene={{ background: null }}
    >
      <WebGLRendererConfig />
      <ambientLight color={globeConfig.ambientLight} intensity={0.6} />
      <directionalLight
        color={globeConfig.directionalLeftLight}
        position={[-400, 100, 400]} />
      <directionalLight
        color={globeConfig.directionalTopLight}
        position={[-200, 500, 200]} />
      <pointLight
        color={globeConfig.pointLight}
        position={[-200, 500, 200]}
        intensity={0.8} />
      <Globe 
        {...props} 
        onCountryHover={onCountryHover}
        onCountryClick={onCountryClick}
      />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={cameraZ}
        maxDistance={cameraZ}
        autoRotateSpeed={1}
        autoRotate={true}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI - Math.PI / 3} />
    </Canvas>
  );
}

export function hexToRgb(hex) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function genRandomNumbers(min, max, count) {
  const arr = [];
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    if (arr.indexOf(r) === -1) arr.push(r);
  }

  return arr;
} 