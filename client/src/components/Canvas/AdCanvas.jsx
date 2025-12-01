import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Transformer, Text, Rect } from 'react-konva';
import useAdStore from '../../store/useAdStore';
import URLImage from './URLImage';
import { isInsideSafeZone } from '../../utils/complianceChecker';
import toast from 'react-hot-toast';

const AdCanvas = () => {
    const stageRef = useRef(null);
    const { elements, selectedId, selectElement, updateElement, addElement, background, guidelines, showSafeZone, currentFormat } = useAdStore();
    const trRef = useRef(null);

    // Use dimensions from store
    const width = currentFormat.width;
    const height = currentFormat.height;

    // Safe Zone Calculation
    let safeZoneMargin = 0;
    if (guidelines && guidelines.constraints) {
        safeZoneMargin = guidelines.constraints.safe_zone_margin_px || 0;
    }

    useEffect(() => {
        if (selectedId && trRef.current && stageRef.current) {
            const node = stageRef.current.findOne('.' + selectedId);
            if (node) {
                trRef.current.nodes([node]);
                trRef.current.getLayer().batchDraw();
            }
        }
    }, [selectedId, elements]);

    useEffect(() => {
        const handleDownload = () => {
            selectElement(null); // Deselect to hide transformer
            setTimeout(() => {
                if (stageRef.current) {
                    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
                    const link = document.createElement('a');
                    link.download = 'ad-design.png';
                    link.href = uri;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }, 100); // Small delay to ensure render update
        };

        const handleExportRequest = () => {
            selectElement(null);
            setTimeout(() => {
                if (stageRef.current) {
                    stageRef.current.toBlob({
                        pixelRatio: 2,
                        callback: (blob) => {
                            window.dispatchEvent(new CustomEvent('export-data-ready', { detail: blob }));
                        }
                    });
                }
            }, 100);
        };

        window.addEventListener('download-ad', handleDownload);
        window.addEventListener('request-export', handleExportRequest);

        return () => {
            window.removeEventListener('download-ad', handleDownload);
            window.removeEventListener('request-export', handleExportRequest);
        };
    }, [selectElement]);

    const checkDeselect = (e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectElement(null);
            if (trRef.current) {
                trRef.current.nodes([]);
            }
        }
    };

    const handleDragEnd = (e, el) => {
        const node = e.target;
        const newAttrs = {
            x: node.x(),
            y: node.y(),
        };
        updateElement(el.id, newAttrs);

        // Compliance Check
        if (showSafeZone && safeZoneMargin > 0) {
            // Get the absolute bounding box of the node (handles rotation, scale, etc.)
            const box = node.getClientRect();

            // Check if this box is strictly inside the safe zone
            // box has {x, y, width, height} in stage coordinates
            const isSafe =
                box.x >= safeZoneMargin &&
                box.y >= safeZoneMargin &&
                (box.x + box.width) <= (width - safeZoneMargin) &&
                (box.y + box.height) <= (height - safeZoneMargin);

            if (!isSafe) {
                toast.error('⚠️ Violation: Element outside Safe Zone!', {
                    style: { border: '1px solid #ef4444', color: '#ef4444' },
                    icon: '⚠️',
                });
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();

        // Ensure stage reference exists
        if (!stageRef.current) return;

        // Register event position for Konva
        stageRef.current.setPointersPositions(e);

        let x = width / 2; // Default center x
        let y = height / 2; // Default center y

        const pointer = stageRef.current.getRelativePointerPosition();
        if (pointer) {
            x = pointer.x;
            y = pointer.y;
        } else {
            // Fallback: try getPointerPositions
            const pointers = stageRef.current.getPointerPositions();
            if (pointers && pointers[0]) {
                x = pointers[0].x;
                y = pointers[0].y;
            }
        }

        const src = e.dataTransfer.getData('image-src');

        if (src) {
            addElement({
                id: `img-${Date.now()}`,
                type: 'image',
                src,
                x,
                y,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
            });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div
            className="canvas-wrapper"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
                backgroundColor: '#1a1a1a',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <div style={{ backgroundColor: background, boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                <Stage
                    width={width}
                    height={height}
                    onMouseDown={checkDeselect}
                    onTouchStart={checkDeselect}
                    ref={stageRef}
                >
                    <Layer>
                        {/* Safe Zone Indicator */}
                        {showSafeZone && safeZoneMargin > 0 && (
                            <React.Fragment>
                                {/* Dashed Border for Safe Zone */}
                                <Rect
                                    x={safeZoneMargin}
                                    y={safeZoneMargin}
                                    width={width - (safeZoneMargin * 2)}
                                    height={height - (safeZoneMargin * 2)}
                                    stroke="rgba(0, 255, 0, 0.5)"
                                    strokeWidth={2}
                                    dash={[10, 5]}
                                    listening={false}
                                />
                                {/* Label */}
                                <Text
                                    x={safeZoneMargin + 5}
                                    y={safeZoneMargin + 5}
                                    text="SAFE ZONE"
                                    fontSize={12}
                                    fill="rgba(0, 255, 0, 0.7)"
                                    listening={false}
                                />
                            </React.Fragment>
                        )}

                        {elements.map((el, i) => {
                            if (el.type === 'image') {
                                return (
                                    <URLImage
                                        key={el.id}
                                        image={el}
                                        name={el.id}
                                        draggable
                                        onClick={() => selectElement(el.id)}
                                        onTap={() => selectElement(el.id)}
                                        scaleX={el.scaleX}
                                        scaleY={el.scaleY}
                                        rotation={el.rotation}
                                        onDragEnd={(e) => handleDragEnd(e, el)}
                                        onTransformEnd={(e) => {
                                            const node = e.target;
                                            updateElement(el.id, {
                                                x: node.x(),
                                                y: node.y(),
                                                rotation: node.rotation(),
                                                scaleX: node.scaleX(),
                                                scaleY: node.scaleY(),
                                            });
                                        }}
                                    />
                                );
                            }
                            if (el.type === 'text') {
                                return (
                                    <Text
                                        key={el.id}
                                        text={el.text}
                                        x={el.x}
                                        y={el.y}
                                        fontSize={el.fontSize}
                                        fill={el.fill}
                                        name={el.id}
                                        draggable
                                        onClick={() => selectElement(el.id)}
                                        onTap={() => selectElement(el.id)}
                                        scaleX={el.scaleX}
                                        scaleY={el.scaleY}
                                        rotation={el.rotation}
                                        onDragEnd={(e) => handleDragEnd(e, el)}
                                        onTransformEnd={(e) => {
                                            const node = e.target;
                                            updateElement(el.id, {
                                                x: node.x(),
                                                y: node.y(),
                                                rotation: node.rotation(),
                                                scaleX: node.scaleX(),
                                                scaleY: node.scaleY(),
                                            });
                                        }}
                                    />
                                );
                            }
                            return null;
                        })}

                        {selectedId && (
                            <Transformer
                                ref={trRef}
                                boundBoxFunc={(oldBox, newBox) => {
                                    if (newBox.width < 5 || newBox.height < 5) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
};

export default AdCanvas;
