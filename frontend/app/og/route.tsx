import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

// Dynamic OG image route
// Usage: /og?title=Page%20Title
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawTitle = searchParams.get("title") || "YourApp";
  // Strip "| YourApp" suffix if present
  const title = rawTitle.split(" | ")[0];

  // Read the icon file and convert to base64
  const iconPath = join(process.cwd(), "app", "iconwhite.png");
  const iconBuffer = await readFile(iconPath);
  const iconBase64 = `data:image/png;base64,${iconBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Left side - Text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingRight: "60px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#570df8",
                letterSpacing: "-0.02em",
              }}
            >
              YourApp
            </div>
          </div>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#f8fafc",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </div>
        </div>

        {/* Right side - Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "300px",
            height: "300px",
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconBase64}
            alt="YourApp Logo"
            width={280}
            height={280}
            style={{
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
