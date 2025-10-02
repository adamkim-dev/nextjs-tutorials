/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { SplitSBClient } from "@/app/utils/supabase/SplitSBClient";

class DebugClient extends SplitSBClient {}
const client = new DebugClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const schema = searchParams.get("schema") || "public";

    if (!table) {
      return NextResponse.json(
        { error: "Query param 'table' is required" },
        { status: 400 }
      );
    }

    const { data, error } = {
      data: [],
      error: {
        message: "Internal server error",
      },
    };
    // .getClient()
    // .from("information_schema.columns")
    // .select("column_name")
    // .eq("table_schema", schema)
    // .eq("table_name", table);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const columns = (data || []).map((d: any) => d.column_name);
    return NextResponse.json({ data: { schema, table, columns } });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
