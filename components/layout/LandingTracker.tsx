'use client';

import { useEffect } from 'react';
import { recordLanding } from '@/lib/landing';

export function LandingTracker() {
  useEffect(() => {
    recordLanding();
  }, []);
  return null;
}
