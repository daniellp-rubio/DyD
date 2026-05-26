import prisma from "@/lib/prisma";
import { submitImageToVideo } from "@/lib/ai/fal";

// Provider opcional de video por fal.ai (cloud). NO reemplaza el video-server
// local — se usa solo cuando VIDEO_PROVIDER=fal. Submit + guarda el job id;
// el resultado se resuelve con poll (fal getQueueResult) en un paso posterior.
export async function submitFalVideoForPost(
  contentPostId: string,
  imageUrl: string,
  prompt: string
) {
  const submission = await submitImageToVideo(imageUrl, prompt);

  await prisma.contentPost.update({
    where: { id: contentPostId },
    data: { videoStatus: "generating", videoJobId: submission.requestId },
  });

  return submission;
}
