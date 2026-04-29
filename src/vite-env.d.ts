/// <reference types="vite/client" />

declare global {
  interface Window {
    faceApiReady?: boolean;
  }
  var faceapi: any;
}

export {};
