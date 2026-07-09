import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getFullExportData, jsonToCsv, jsonToXlsx } from "@/lib/export-utils";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "json";

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    if (!rateLimit(`export:${ip}`, 10, 60_000).success) {
      return rateLimitResponse();
    }

    const data = await getFullExportData(session.user.id);

    if (format === "csv") {
      const csv = jsonToCsv(data);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="reja-export-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    if (format === "xlsx") {
      const buffer = await jsonToXlsx(data);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="reja-export-${new Date().toISOString().slice(0, 10)}.xlsx"`,
        },
      });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("GET /api/export error:", e);
    return NextResponse.json({ error: "Eksportda xatolik yuz berdi" }, { status: 500 });
  }
}