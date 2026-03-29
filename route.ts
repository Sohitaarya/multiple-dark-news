import { NextRequest, NextResponse } from "next/server";

const TECHSPECS_API_ID = process.env.TECHSPECS_API_ID || "";
const TECHSPECS_API_KEY = process.env.TECHSPECS_API_KEY || "";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!TECHSPECS_API_ID || !TECHSPECS_API_KEY) {
    return NextResponse.json(
      { error: "TechSpecs API credentials not configured" },
      { status: 500 }
    );
  }

  try {
    // TechSpecs API v5 with Bearer Token
    const baseUrl = "https://api.techspecs.io/v5";
    
    // First, get Bearer Token from v4 auth endpoint
    const tokenResponse = await fetch("https://api.techspecs.io/v4/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiid: TECHSPECS_API_ID,
        apikey: TECHSPECS_API_KEY,
      }),
    });

    // Check if response is JSON
    const contentType = tokenResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await tokenResponse.text();
      console.error("TechSpecs Auth Error - Non-JSON response:", text.substring(0, 200));
      return NextResponse.json(
        { error: "TechSpecs API authentication failed - invalid response format" },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.token) {
      console.error("TechSpecs Auth Error:", tokenData);
      return NextResponse.json(
        { error: tokenData.message || "Failed to authenticate with TechSpecs API" },
        { status: 401 }
      );
    }

    const bearerToken = tokenData.token;

    // Search for products using v5 API
    const searchUrl = query
      ? `${baseUrl}/product/search?query=${encodeURIComponent(query)}`
      : `${baseUrl}/product/search?query=laptop`;

    const response = await fetch(searchUrl, {
      headers: {
        "Authorization": `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
    });

    // Check if search response is JSON
    const searchContentType = response.headers.get("content-type");
    if (!searchContentType || !searchContentType.includes("application/json")) {
      const text = await response.text();
      console.error("TechSpecs Search Error - Non-JSON response:", text.substring(0, 200));
      return NextResponse.json(
        { error: "TechSpecs API search failed - invalid response format" },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch tech specs" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("TechSpecs API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tech data - API may be unavailable" },
      { status: 500 }
    );
  }
}