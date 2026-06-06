// "use client";
import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
type Props = {
  params: Promise<{ projectId: string }>;
};

const JoinProjectPage = async ({ params }: Props) => {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-up");
  const dbUser = await db.user.findUnique({
    where: {
      id: userId,
    },
  });
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if (!user) redirect("/sign-up");
  if (!dbUser) {
    await db.user.create({
      data: {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    });
  }
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
  });
  if (!project) redirect("/dashboard");
  try {
    await db.userToProject.create({
      data: {
        userId,
        projectId,
      },
    });
  } catch (error) {
    console.log("User already in project", error);
  }

  return redirect("/dashboard");
};

export default JoinProjectPage;
