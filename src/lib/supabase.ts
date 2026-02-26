import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "meetings";

// Create Supabase client
const supabase = createClient(
  "https://pdqfewgwuqdcktokxhjf.supabase.co",
  "sb_publishable_Yo2WBzK8rreuTj1v_mwZtQ_9irqm8MS",
);

// Upload file using standard upload
async function uploadFile(file: File, userId: string) {
  const filePath = `${BUCKET_NAME}/${userId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from("meetings")
    .upload(filePath, file);

  if (error) {
    // Handle error
    console.log(error.message);
    throw new Error(error.message);
  } else {
    // Handle success
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    if (!data.publicUrl) throw new Error("Error getting public url");
    return data.publicUrl;
  }
}
// const file = new File(["hello"], "hello.txt", { type: "text/plain" });
// uploadFile(file, "1");
