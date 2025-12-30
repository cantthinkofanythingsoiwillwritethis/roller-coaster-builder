import { useRef, useEffect, useState } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import * as THREE from "three";
import { useRollerCoaster } from "@/lib/stores/useRollerCoaster";

interface TrackPointProps {
  id: string;
  position: THREE.Vector3;
  index: number;
}

export function TrackPoint({ id, position, index }: TrackPointProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const transformRef = useRef<any>(null);
  const [meshReady, setMeshReady] = useState(false);
  const { selectedPointId, selectPoint, updateTrackPoint, mode, setIsDraggingPoint } = useRollerCoaster();
  
  const isSelected = selectedPointId === id;
  
  useEffect(() => {
    if (meshRef.current) {
      setMeshReady(true);
    }
  }, []);
  
  useEffect(() => {
    if (!transformRef.current) return;
    
    const controls = transformRef.current;
    
    const handleDraggingChanged = (event: any) => {
      setIsDraggingPoint(event.value);
      
      if (!event.value && meshRef.current) {
        const worldPos = new THREE.Vector3();
        meshRef.current.getWorldPosition(worldPos);
        const clampedY = Math.max(0.5, worldPos.y);
        updateTrackPoint(id, new THREE.Vector3(worldPos.x, clampedY, worldPos.z));
      }
    };
    
    const handleObjectChange = () => {
      if (meshRef.current) {
        const worldPos = new THREE.Vector3();
        meshRef.current.getWorldPosition(worldPos);
        const clampedY = Math.max(0.5, worldPos.y);
        updateTrackPoint(id, new THREE.Vector3(worldPos.x, clampedY, worldPos.z));
      }
    };
    
    controls.addEventListener("dragging-changed", handleDraggingChanged);
    controls.addEventListener("objectChange", handleObjectChange);
    
    return () => {
      controls.removeEventListener("dragging-changed", handleDraggingChanged);
      controls.removeEventListener("objectChange", handleObjectChange);
    };
  }, [id, updateTrackPoint, setIsDraggingPoint, isSelected, meshReady]);
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (mode !== "build") return;
    e.stopPropagation();
    selectPoint(id);
  };
  
  if (mode === "ride") return null;
  
  return (
    <group>
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? "#ff6600" : "#4488ff"}
          emissive={isSelected ? "#ff3300" : "#000000"}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {isSelected && meshReady && meshRef.current && (
        <TransformControls
          ref={transformRef}
          object={meshRef.current}
          mode="translate"
          size={0.75}
          showX={true}
          showY={true}
          showZ={true}
        />
      )}
    </group>
  );
}
