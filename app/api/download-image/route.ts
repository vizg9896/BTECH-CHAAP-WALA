import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get("path");
    
    if (!imagePath) {
      return NextResponse.json(
        { success: false, error: "No image path provided" },
        { status: 400 }
      );
    }

    let fullPath = "";
    // Parse absolute file:/// or /C:/ formats or standard relative paths
    if (imagePath.startsWith("file:///")) {
      fullPath = imagePath.replace("file:///", "");
    } else if (imagePath.startsWith("/") && (imagePath.includes(":/") || imagePath.includes(":\\"))) {
      fullPath = imagePath.substring(1);
    } else if (imagePath.includes(":/") || imagePath.includes(":\\")) {
      fullPath = imagePath;
    } else {
      const cleanPath = imagePath.replace(/^\/+/, "");
      fullPath = path.join(process.cwd(), "public", cleanPath);
    }

    // Normalize the path structure
    fullPath = path.normalize(fullPath);

    // Security check: Only allow files from process public directory or .gemini data directory
    const allowedRoots = [
      path.join(process.cwd(), "public"),
      "C:\\Users\\dinesh\\.gemini"
    ];

    const isAllowed = allowedRoots.some(root => {
      const normalizedRoot = path.normalize(root).toLowerCase();
      const normalizedFullPath = fullPath.toLowerCase();
      return normalizedFullPath.startsWith(normalizedRoot);
    });

    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    // Read file and parse name
    const fileBuffer = fs.readFileSync(fullPath);
    const filename = path.basename(fullPath);
    
    // Determine content type
    let contentType = "image/png";
    const lowerName = filename.toLowerCase();
    if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    } else if (lowerName.endsWith(".webp")) {
      contentType = "image/webp";
    } else if (lowerName.endsWith(".gif")) {
      contentType = "image/gif";
    }

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Download API error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
