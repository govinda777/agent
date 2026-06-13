'use client';

import React, { useState, useEffect } from 'react';
import { RealAuthProvider } from '@/modules/auth/providers/RealAuthProvider';
import { MockAuthProvider } from '@/modules/auth/providers/MockAuthProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isE2E, setIsE2E] = useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window.localStorage.getItem('playwright-mock-auth') === 'true' ||
        process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST === 'true')
    ) {
      setIsE2E(true);
    }
  }, []);

  if (isE2E) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  return <RealAuthProvider>{children}</RealAuthProvider>;
}
