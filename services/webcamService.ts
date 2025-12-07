
// We rely on globals loaded via script tags in index.html to avoid ESM resolution issues
declare const tf: any;
declare const poseDetection: any;

let detector: any = null;

export const initDetector = async () => {
  if (detector) return detector;
  
  // Wait for TFJS to be ready
  await tf.ready();
  
  const model = poseDetection.SupportedModels.MoveNet;
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    enableSmoothing: true,
  };
  detector = await poseDetection.createDetector(model, detectorConfig);
  return detector;
};

export const estimatePose = async (video: HTMLVideoElement) => {
  if (!detector) return null;
  try {
    const poses = await detector.estimatePoses(video);
    return poses.length > 0 ? poses[0] : null;
  } catch (e) {
    console.error("Pose estimation error:", e);
    return null;
  }
};
