import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Transformer, Text, Rect, Circle } from 'react-konva';
import useAdStore from '../../store/useAdStore';
import URLImage from './URLImage';
import toast from 'react-hot-toast';
import ContextMenu from '../ContextMenu/ContextMenu';

const AdCanvas = () => {
    const stageRef = useRef(null);
    const trRef = useRef(null);

    const {
        elements, selectedIds, selectElement, updateElement, addElement,
        background, guidelines, showSafeZone, currentFormat, heatmapVisible
    } = useAdStore();

    // Context menu state
    const [contextMenu, setContextMenu] = useState(null);

    // Backward compatibility for selectedId
    const selectedId = selectedIds && selectedIds.length > 0 ? selectedIds[0] : null;

    // Use dimensions from store
    const width = currentFormat.width;
    const height = currentFormat.height;

    // Container ref for calculating scale
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    // Calculate scale to fit canvas in container
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth - 60; // padding
                const containerHeight = containerRef.current.clientHeight - 60;

                const scaleX = containerWidth / width;
                const scaleY = containerHeight / height;
                const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

                setScale(Math.max(newScale, 0.1)); // Minimum 10% scale
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [width, height]);

    // Sort elements by zIndex for proper rendering order
    const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

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
                    // Hide Safe Zone for capture
                    const safeZoneNodes = stageRef.current.find('.safe-zone-indicator');
                    safeZoneNodes.forEach(node => node.hide());
                    stageRef.current.batchDraw();

                    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });

                    // Restore Safe Zone
                    safeZoneNodes.forEach(node => node.show());
                    stageRef.current.batchDraw();

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
                    // Hide Safe Zone for capture
                    const safeZoneNodes = stageRef.current.find('.safe-zone-indicator');
                    safeZoneNodes.forEach(node => node.hide());
                    stageRef.current.batchDraw();

                    stageRef.current.toBlob({
                        pixelRatio: 2,
                        callback: (blob) => {
                            // Restore Safe Zone
                            safeZoneNodes.forEach(node => node.show());
                            stageRef.current.batchDraw();

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
            ref={containerRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
                backgroundColor: '#1a1a1a',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            }}
        >
            <div style={{
                backgroundColor: background,
                boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                transform: `scale(${scale})`,
                transformOrigin: 'center center'
            }}>
                <Stage
                    width={width}
                    height={height}
                    onMouseDown={checkDeselect}
                    onTouchStart={checkDeselect}
                    ref={stageRef}
                >
                    <Layer>
                        {/* Background Layer - Essential for Export */}
                        <Rect
                            x={0}
                            y={0}
                            width={width}
                            height={height}
                            fill={background}
                            listening={false} // Don't interfere with clicks
                        />

                        {/* Safe Zone Indicator */}
                        {showSafeZone && safeZoneMargin > 0 && (
                            <React.Fragment>
                                {/* Dashed Border for Safe Zone */}
                                <Rect
                                    name="safe-zone-indicator"
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
                                    name="safe-zone-indicator"
                                    x={safeZoneMargin + 5}
                                    y={safeZoneMargin + 5}
                                    text="SAFE ZONE"
                                    fontSize={12}
                                    fill="rgba(0, 255, 0, 0.7)"
                                    listening={false}
                                />
                            </React.Fragment>
                        )}

                        {sortedElements.map((el) => {
                            if (el.type === 'image') {
                                return (
                                    <URLImage
                                        key={el.id}
                                        image={el}
                                        name={el.id}
                                        draggable
                                        onClick={(e) => selectElement(el.id, e.evt.shiftKey)}
                                        onTap={() => selectElement(el.id)}
                                        onContextMenu={(e) => {
                                            e.evt.preventDefault();
                                            setContextMenu({
                                                x: e.evt.clientX,
                                                y: e.evt.clientY,
                                                elementId: el.id
                                            });
                                        }}
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
                                        fontFamily={el.fontFamily || 'Inter'}
                                        fill={el.fill}
                                        name={el.id}
                                        draggable
                                        onClick={(e) => selectElement(el.id, e.evt.shiftKey)}
                                        onTap={() => selectElement(el.id)}
                                        onContextMenu={(e) => {
                                            e.evt.preventDefault();
                                            setContextMenu({
                                                x: e.evt.clientX,
                                                y: e.evt.clientY,
                                                elementId: el.id
                                            });
                                        }}
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
                                keepRatio={true}
                                enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                                boundBoxFunc={(oldBox, newBox) => {
                                    if (newBox.width < 5 || newBox.height < 5) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                            />
                        )}
                    </Layer>

                    {/* Attention Heatmap Overlay Layer */}
                    {heatmapVisible && (
                        <Layer listening={false} opacity={0.6}>
                            {elements.map((el) => {
                                // Calculate visual weight based on element properties
                                let radius = 100;
                                let colorStart = 'rgba(255, 0, 0, 0.8)'; // Red for high attention
                                let colorEnd = 'rgba(255, 0, 0, 0)';

                                if (el.type === 'image') {
                                    // Images get larger heatspots based on scale
                                    const avgScale = (Math.abs(el.scaleX || 1) + Math.abs(el.scaleY || 1)) / 2;
                                    radius = 150 * avgScale;
                                } else if (el.type === 'text') {
                                    // Text saliency depends on font size
                                    radius = (el.fontSize || 20) * 2.5;
                                    colorStart = 'rgba(255, 140, 0, 0.9)'; // Orange for text
                                    colorEnd = 'rgba(255, 140, 0, 0)';
                                }

                                return (
                                    <Circle
                                        key={`heat-${el.id}`}
                                        x={el.x + radius / 3}
                                        y={el.y + radius / 3}
                                        radius={radius}
                                        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
                                        fillRadialGradientStartRadius={0}
                                        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
                                        fillRadialGradientEndRadius={radius}
                                        fillRadialGradientColorStops={[0, colorStart, 1, colorEnd]}
                                    />
                                );
                            })}
                        </Layer>
                    )}
                </Stage>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    elementId={contextMenu.elementId}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
};

export default AdCanvas;
