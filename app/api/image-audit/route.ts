import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Simple image compression using canvas-free approach
// Reads image files and reports their sizes
// For actual compression, use the sharp library or run: npx sharp-cli
export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const files = fs.readdirSync(publicDir);
    
    const imageFiles = files.filter(f => 
      f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".webp")
    );

    const report = imageFiles.map(file => {
      const filePath = path.join(publicDir, file);
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      return { file, sizeMB: parseFloat(sizeMB), bytes: stats.size };
    }).sort((a, b) => b.bytes - a.bytes);

    const totalMB = report.reduce((sum, f) => sum + f.bytes, 0) / (1024 * 1024);

    return NextResponse.json({
      success: true,
      totalImages: report.length,
      totalSizeMB: totalMB.toFixed(2),
      files: report,
      tip: "Run: npx @squoosh/cli --webp '{quality:80}' public/*.png public/*.jpg to compress all images"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
