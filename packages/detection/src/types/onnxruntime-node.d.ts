declare module 'onnxruntime-node' {
  export const InferenceSession: {
    create(modelPath: string): Promise<unknown>;
  };
}
