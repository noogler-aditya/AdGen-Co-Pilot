import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

const Stars = ({ warpSpeed = false }) => {
    const ref = useRef();
    const materialRef = useRef();

    // Create star positions
    const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));

    // Animate based on warp mode
    useFrame((state, delta) => {
        if (warpSpeed) {
            // WARP SPEED - dramatic rotation and zoom effect
            ref.current.rotation.x -= delta * 2;
            ref.current.rotation.y -= delta * 3;
            ref.current.rotation.z += delta * 1.5;

            // Scale up stars during warp
            if (materialRef.current) {
                materialRef.current.size = Math.min(0.015, materialRef.current.size + delta * 0.01);
            }
        } else {
            // Normal slow rotation
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    ref={materialRef}
                    transparent
                    color={warpSpeed ? "#a5b4fc" : "#6366f1"}
                    size={warpSpeed ? 0.008 : 0.002}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
};

// Warp flash overlay effect
const WarpFlash = ({ active }) => {
    const ref = useRef();

    useFrame((state, delta) => {
        if (active && ref.current) {
            ref.current.material.opacity = Math.min(1, ref.current.material.opacity + delta * 2);
        }
    });

    if (!active) return null;

    return (
        <mesh ref={ref} position={[0, 0, 0.5]}>
            <planeGeometry args={[10, 10]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} />
        </mesh>
    );
};

const ThreeBackground = ({ warpSpeed = false }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            background: '#050505',
            transition: warpSpeed ? 'background 0.5s ease' : 'none',
            backgroundColor: warpSpeed ? '#0a0a1a' : '#050505'
        }}>
            <Canvas camera={{ position: [0, 0, 1] }}>
                <Stars warpSpeed={warpSpeed} />
                <WarpFlash active={warpSpeed} />
            </Canvas>
        </div>
    );
};

export default ThreeBackground;
