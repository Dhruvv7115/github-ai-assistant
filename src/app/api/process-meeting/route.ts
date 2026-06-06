import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import z from "zod";

const bodySchema = z.object({
  meetingUrl: z.string(),
  projectId: z.string(),
  meetingId: z.string(),
});

export const maxDuration = 300; // 5 mins

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({
      message: "Unauthorized",
      status: 401,
    });
  }
  const body = await req.json();
  const { meetingUrl, meetingId } = bodySchema.parse(body);

  try {
    const { summaries } = await processMeeting(meetingUrl);
    if (!summaries) {
      return NextResponse.json({
        message: "Error in processing meeting",
        status: 400,
      });
    }
    console.log(summaries);

    const issues = await db.issue.createMany({
      data:
        summaries?.map((summary) => {
          return {
            start: summary.start,
            end: summary.end,
            gist: summary.gist,
            headline: summary.headline,
            summary: summary.summary,
            meetingId,
          };
        }) || [],
    });
    console.log("issues", issues);
    await db.meeting.update({
      where: {
        id: meetingId,
      },
      data: {
        status: "COMPLETED",
        name: summaries[0]?.headline,
      },
    });
    return NextResponse.json({
      message: "Success",
      status: 200,
      issues,
    });
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({
      message: "Error in processing meeting",
      status: 400,
    });
  }
}
