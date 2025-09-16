import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("http://localhost:8080/api/conversations"); // Express backend
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id"); // Get id from query params

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
  return NextResponse.json(data);
}
