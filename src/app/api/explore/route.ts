import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

interface ContractRequest {
    slug: string;
}

interface ContractResponse {
    contract: string;
}

interface ErrorResponse {
    error: string;
}

export async function POST(req: Request): Promise<NextResponse<ContractResponse | ErrorResponse>> {
    const { slug } = await req.json() as ContractRequest;
    
    console.log("Received slug:", slug); // Debug log
    
    try {
        const contractPath = path.join(process.cwd(),`${slug}.sol`);
        console.log("Looking for file at:", contractPath); // Debug log
        console.log("File exists:", fs.existsSync(contractPath)); // Debug log
        
        if (!fs.existsSync(contractPath)) {
            return NextResponse.json({ error: "Contract not found" }, { status: 404 });
        }
        const contract = fs.readFileSync(contractPath, "utf-8");
        return NextResponse.json({ contract }, { status: 200 });
    }
    catch (err) {
        console.error("Error reading contract:", err); // Debug log
        return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }
}