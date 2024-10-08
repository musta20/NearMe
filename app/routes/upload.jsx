// app/routes/upload.jsx

import { Form, useActionData } from "@remix-run/react";
import { unstable_parseMultipartFormData, unstable_createFileUploadHandler, json } from "@remix-run/node";
 import path from "path";

export const action = async ({ request }) => {
  const uploadHandler = unstable_createFileUploadHandler({
    maxFileSize: 5_000_000,
    directory: path.join(process.cwd(), "public", "uploads"),
  });

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return json({ error: "No file uploaded or invalid file" }, { status: 400 });
  }

  try {
    // The file is already saved by the upload handler, so we just need to return the success message
    console.log("File saved at:", file.filepath);

    return json({ success: true, filename: file.name });
  } catch (error) {
    console.error("Error handling file upload:", error);
    return json({ error: "Failed to handle file upload" }, { status: 500 });
  }
};

export default function Upload() {
  const actionData = useActionData();

  return (
    <div>
      <h1>File Upload</h1>
      <Form method="post" encType="multipart/form-data">
        <input type="file" name="file" />
        <button type="submit">Upload</button>
      </Form>
      {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
      {actionData?.success && (
        <p style={{ color: "green" }}>
          File "{actionData.filename}" uploaded successfully!
        </p>
      )}
    </div>
  );
}