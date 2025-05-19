import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { downloads as downloadsStore } from "../shared-store";

// GET: Lấy thông tin chi tiết của một download hoặc trạng thái của nó
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extend the user type to include 'id'
        type UserWithId = typeof session.user & { id: string };
        const userWithId = session.user as UserWithId;
        const userId = userWithId.id?.toString() || "";
        const downloadId = parseInt(params.id);

        if (isNaN(downloadId)) {
            return NextResponse.json(
                { error: "Invalid download ID" },
                { status: 400 }
            );
        }

        // Lấy danh sách tải xuống của người dùng
        const userDownloads = downloadsStore[userId] || [];

        // Tìm download theo ID
        const download = userDownloads.find((d) => d.id === downloadId);

        if (!download) {
            return NextResponse.json(
                { error: "Download not found" },
                { status: 404 }
            );
        }

        // Kiểm tra xem có tham số truy vấn 'statusOnly' không
        const { searchParams } = new URL(req.url);
        const statusOnly = searchParams.get("statusOnly");

        if (statusOnly === "true") {
            // Trả về chỉ trạng thái
            return NextResponse.json(
                {
                    id: download.id,
                    status: download.status,
                    status_display: download.status_display,
                    progress: download.progress,
                },
                { status: 200 }
            );
        } else {
            // Trả về toàn bộ thông tin download
            return NextResponse.json(download, { status: 200 });
        }
    } catch (error) {
        console.error("Error fetching download:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// DELETE: Xóa một download
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extend the user type to include 'id'
        type UserWithId = typeof session.user & { id: string };
        const userWithId = session.user as UserWithId;
        const userId = userWithId.id?.toString() || "";
        const downloadId = parseInt(params.id);

        if (isNaN(downloadId)) {
            return NextResponse.json(
                { error: "Invalid download ID" },
                { status: 400 }
            );
        }

        // Lấy danh sách tải xuống của người dùng
        const userDownloads = downloadsStore[userId] || [];

        // Tìm vị trí của download cần xóa
        const downloadIndex = userDownloads.findIndex((d) => d.id === downloadId);

        if (downloadIndex === -1) {
            return NextResponse.json(
                { error: "Download not found" },
                { status: 404 }
            );
        }

        // Xóa download khỏi danh sách
        userDownloads.splice(downloadIndex, 1);

        return NextResponse.json(
            { message: "Download deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting download:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}