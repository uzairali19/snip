import { GET, POST } from "@/app/api/snippets/route";
import fs from "fs";
import { NextRequest } from "next/server";

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe("Snippets API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return snippets from GET", async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.promises.readFile as jest.Mock).mockResolvedValue('[{ "id": "123" }]');

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual([{ id: "123" }]);
  });

  it("should write snippets to file on POST", async () => {
    const mockReq = {
      json: async () => [{ id: "456" }],
    } as unknown as NextRequest;

    const res = await POST(mockReq);
    const json = await res.json();

    expect(fs.promises.writeFile).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(json).toEqual({ message: "Saved" });
  });

  it("should return 400 on invalid POST data", async () => {
    const mockReq = {
      json: async () => ({ invalid: true }),
    } as unknown as NextRequest;

    const res = await POST(mockReq);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid data format");
  });
});
