import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

function msToTime(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}
export const processMeeting = async (meetingUrl: string) => {
  const transcript = await client.transcripts.transcribe({
    audio: meetingUrl,
    language_detection: true,
    auto_chapters: true,
    speech_models: ["universal-3-pro", "universal-2"],
  });
  const summaries = transcript?.chapters?.map((chapter) => {
    return {
      start: msToTime(chapter.start * 1000),
      end: msToTime(chapter.end * 1000),
      gist: chapter.gist,
      headline: chapter.headline,
      summary: chapter.summary,
    };
  });
  if (!transcript.text) throw new Error("No text found in transcript");
  return {
    summaries,
  };
};
