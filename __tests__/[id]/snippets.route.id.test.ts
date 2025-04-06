import { DELETE } from "@/app/api/snippets/[id]/route";
import fs from "fs";
import { NextRequest } from "next/server";

jest.mock("fs");

describe("Delete API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delete (overwrite) snippet file", async () => {
    const mockReq = {
      json: async () => [{ id: "789" }],
    } as unknown as NextRequest;

    const res = await DELETE(mockReq);
    const json = await res.json();

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(json).toEqual({ message: "Deleted" });
  });
});
