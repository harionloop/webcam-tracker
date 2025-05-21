'use client';

import React, { useEffect, useRef, useState } from 'react';
import webgazer, { GazeData, FaceMeshPositions } from 'webgazer';

const EyeTracker = () => {
    const gazeDotRef = useRef<HTMLDivElement>(null);
    const [isWebgazerReady, setIsWebgazerReady] = useState(false);
    const [lastBlinkTime, setLastBlinkTime] = useState<number>(0);
    const [lastEyeCloseTime, setLastEyeCloseTime] = useState<number>(Date.now());
    const blinkThreshold: number = 300; // Min time (ms) between blinks
    const eyeOpenThreshold: number = 10 * 1000; // 10 seconds in ms

    useEffect(() => {
        let isInitialized = false;

        const initWebgazer = async () => {
            try {
                await webgazer.setGazeListener((data: GazeData | null) => {
                    if (data && gazeDotRef.current) {
                        gazeDotRef.current.style.left = `${data.x}px`;
                        gazeDotRef.current.style.top = `${data.y}px`;
                        gazeDotRef.current.style.display = "block";
                    }
                }).begin();
                
                console.log("WebGazer initialized");
                isInitialized = true;
                setIsWebgazerReady(true);
            } catch (err) {
                console.error("WebGazer failed:", err);
                setIsWebgazerReady(false);
            }
        };

        initWebgazer();

        return () => {
            if (isInitialized) {
                try {
                    webgazer.end();
                } catch (err) {
                    console.error("Error cleaning up webgazer:", err);
                }
            }
        };
    }, []);

    const calculateEAR = (eye: number[][]) => {
        if (!eye || eye.length < 6) return 1;
        const vertical1 = Math.hypot(eye[1][0] - eye[5][0], eye[1][1] - eye[5][1]);
        const vertical2 = Math.hypot(eye[2][0] - eye[4][0], eye[2][1] - eye[4][1]);
        const horizontal = Math.hypot(eye[0][0] - eye[3][0], eye[0][1] - eye[3][1]);
        return (vertical1 + vertical2) / (2.0 * horizontal);
    };

    useEffect(() => {
        if (!isWebgazerReady) return;

        let animationFrameId: number | undefined;
        let isTracking = true;

        const trackEyeState = () => {
            if (!isTracking) return;

            const faceTracker = webgazer.getTracker();
            if (faceTracker?.getPositions) {
                const positions: FaceMeshPositions | null = faceTracker.getPositions();
                if (positions) {
                    const leftEye = positions.slice(36, 42);
                    const rightEye = positions.slice(42, 48);
                    const leftEAR = calculateEAR(leftEye);
                    const rightEAR = calculateEAR(rightEye);
                    const avgEAR = (leftEAR + rightEAR) / 2;

                    if (avgEAR < 0.2) {
                        const now = Date.now();
                        if (now - lastBlinkTime > blinkThreshold) {
                            console.log("Blink detected!");
                            setLastBlinkTime(now);
                        }
                        setLastEyeCloseTime(now);
                    }

                    if (Date.now() - lastEyeCloseTime > eyeOpenThreshold) {
                        console.log("Eyes have been open for 10 seconds!");
                        // alert("You haven't closed your eyes for 10 seconds!");
                        setLastEyeCloseTime(Date.now());
                    }
                }
            }
            animationFrameId = requestAnimationFrame(trackEyeState);
        };

        setTimeout(() => {
            if (isTracking) {
                trackEyeState();
            }
        }, 3000);

        return () => {
            isTracking = false;
            if (animationFrameId !== undefined) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [lastBlinkTime, lastEyeCloseTime, isWebgazerReady]);

    if (!isWebgazerReady) {
        return <div>Initializing eye tracker...</div>;
    }

    return (
        <div>
            <h1>Webcam Eye Tracker</h1>
            <p>Look around, and the red dot will follow your gaze!</p>
            <p>Blink detection + &quot;Eyes not closed for 10s&quot; feature.</p>
            <div
                ref={gazeDotRef}
                style={{
                    position: 'absolute',
                    width: '10px',
                    height: '10px',
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    display: 'none',
                }}
            ></div>
        </div>
    );
};

export default EyeTracker; 