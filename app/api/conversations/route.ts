import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("http://localhost:8080/api/conversations");
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch("http://localhost:8080/api/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Conversation ID is required" },
      { status: 400 }
    );
  }

  const res = await fetch(`http://localhost:8080/api/conversations/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
