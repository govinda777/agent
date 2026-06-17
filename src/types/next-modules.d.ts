// Temporary type declarations to satisfy TypeScript during migration to Next.js 14
declare module 'next' {
  export type Metadata = any;
}

declare module 'next/link' {
  import * as React from 'react';
  const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;
  export default Link;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

declare module 'next/server' {
  export class NextResponse {}
  export const cookies: any;
}

declare module 'next/font/google' {
  const font: any;
  export default font;
}
