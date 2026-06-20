// Compatibility declarations for Next.js 14 type issues

// next/font/google named exports
declare module 'next/font/google' {
  export function Geist(options?: any): any;
  export function Geist_Mono(options?: any): any;
  const font: any;
  export default font;
}

// next/server exports with static methods
declare module 'next/server' {
  export class NextResponse extends Response {
    static json(data: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }
  export type NextRequest = Request;
}

// Declare missing modules for vite plugins
declare module '@vitejs/plugin-react' {
  const plugin: any;
  export default plugin;
}
