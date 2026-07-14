import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const srcDir = "C:/Users/dinesh/.gemini/antigravity-ide/brain/00ffb376-eb53-4a86-8050-550d03c692bd";
    const destDir = path.join(process.cwd(), "public");

    // ONLY copy new files — never overwrite existing ones, never touch page.tsx
    const filesToCopy = [
      { src: "tandoori_chaap_1783755056578.png", dest: "tandoori_chaap.png" },
      { src: "tawa_chaap_1783755088221.png", dest: "tawa_chaap.png" },
      { src: "paneer_tikka_1783755100421.png", dest: "paneer_tikka.png" },
      { src: "paneer_curry_1783755112795.png", dest: "paneer_curry.png" },
      { src: "roti_1783755124615.png", dest: "roti.png" },
      { src: "soya_roll_1783755136998.png", dest: "soya_roll.png" },
      { src: "chutney_salad_1783755150684.png", dest: "chutney_salad.png" },
      { src: "finger_chips_1783755720822.png", dest: "finger_chips.png" },
      { src: "raita_1783755938316.png", dest: "raita.png" },
      { src: "cucumber_raita_1783756055095.png", dest: "cucumber_raita.png" },
      { src: "mix_raita_1783756069240.png", dest: "mix_raita.png" },
      { src: "boondi_raita_1783756083439.png", dest: "boondi_raita.png" },
      { src: "roll_malai_1783756280646.png", dest: "roll_malai.png" },
      { src: "roll_afghani_1783756295859.png", dest: "roll_afghani.png" },
      { src: "roll_stuffed_1783756309147.png", dest: "roll_stuffed.png" },
      { src: "roll_pudina_1783756323419.png", dest: "roll_pudina.png" },
      { src: "roll_achari_1783756339525.png", dest: "roll_achari.png" },
      { src: "media__1783757584300.jpg", dest: "roll_lemon.jpg" },
      { src: "media__1783758653201.jpg", dest: "roll_masala.jpg" },
      { url: "media__1783759268821.jpg", dest: "roll_chilli_paneer.jpg" },
      { src: "media__1783759755833.jpg", dest: "roll_keema.jpg" },
      { src: "media__1783760165679.jpg", dest: "veg_spring_roll.jpg" }
    ];

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const copied: string[] = [];
    for (const item of filesToCopy) {
      const srcPath = path.join(srcDir, item.src);
      const destPath = path.join(destDir, item.dest);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        copied.push(item.dest);
      }
    }

    // ✅ page.tsx is NEVER modified here anymore.
    // All image paths in page.tsx are managed directly by the agent only.

    return NextResponse.json({
      success: true,
      message: "Images copied to public folder. page.tsx was NOT modified.",
      copied
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
