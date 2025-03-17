import { ImageResponse } from "@vercel/og";
import { sampleSongs } from "@/app/data/sample-songs";

export const runtime = "edge";
export const alt = "Song Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function og({ params }: { params: { id: string } }) {
  const song = sampleSongs.find((s) => s.id === params.id);
  if (!song) {
    return new Response("Not Found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom, #1a1b1e, #2a2b2e)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Background Image with Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${song.coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
          }}
        />

        {/* Content Container */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            padding: "40px",
            gap: "20px",
          }}
        >
          {/* Album Art */}
          <div
            style={{
              width: "300px",
              height: "300px",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            }}
          >
            <img
              src={song.coverUrl}
              alt={song.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Song Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontSize: "72px",
                fontWeight: "bold",
                color: "white",
                margin: "0",
                lineHeight: "1.1",
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
              }}
            >
              {song.title}
            </h1>
            <p
              style={{
                fontSize: "36px",
                color: "rgba(255, 255, 255, 0.8)",
                margin: "0",
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
              }}
            >
              {song.artist}
            </p>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: "32px",
                marginTop: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "24px",
                  color: "rgba(255, 255, 255, 0.6)",
                  margin: "0",
                }}
              >
                {song.likes.toLocaleString()} likes
              </p>
              <p
                style={{
                  fontSize: "24px",
                  color: "rgba(255, 255, 255, 0.6)",
                  margin: "0",
                }}
              >
                {song.plays.toLocaleString()} plays
              </p>
            </div>
          </div>

          {/* Podium Logo */}
          <div
            style={{
              position: "absolute",
              bottom: "32px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <p
              style={{
                fontSize: "28px",
                color: "rgba(255, 255, 255, 0.8)",
                margin: "0",
              }}
            >
              Listen on Podium
            </p>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: await fetch(
            new URL("https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"),
          ).then((res) => res.arrayBuffer()),
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: await fetch(
            new URL("https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2"),
          ).then((res) => res.arrayBuffer()),
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}