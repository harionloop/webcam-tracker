'use client';

import dynamic from 'next/dynamic';

const EyeTracker = dynamic(() => import('./EyeTracker'), {
  ssr: false
});

export default function EyeTrackerWrapper() {
  return <EyeTracker />;
} 