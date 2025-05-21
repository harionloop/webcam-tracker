declare module 'webgazer' {
    export interface GazeData {
        x: number;
        y: number;
    }

    export type FaceMeshPositions = [number, number][];

    interface WebGazer {
        setGazeListener: (listener: (data: GazeData | null) => void) => WebGazer;
        begin: () => Promise<void>;
        end: () => void;
        addEventListeners: (event: string, callback: () => void) => void;
        removeEventListeners: (event: string, callback: () => void) => void;
        getTracker: () => { getPositions: () => FaceMeshPositions | null } | null;
    }

    const webgazer: WebGazer;
    export default webgazer;
} 