"use server";

export async function uploadImageAction(buffer: Buffer) {
  // Convert buffer to Blob and send via FormData
  const blob = new Blob([buffer]);
  const formData = new FormData();
  formData.append("file", blob);

  const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:9002"}/api/upload`, {
    method: "POST",
    body: formData,
    headers: {
      // Note: Don't set Content-Type for FormData, browser will set it
    },
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  return response.json();
}
