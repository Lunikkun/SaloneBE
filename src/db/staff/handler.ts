import { eq } from "drizzle-orm";
import { db } from "../../dbConnection";
import { StaffMember, StaffMemberInsert, staff } from "./schema";

export async function insertStaffMemberData({nome}: StaffMemberInsert){
    return await db.insert(staff).values({nome})
}
export async function deleteStaffMember(worker: StaffMember) {
    return await db.delete(staff).where(eq(staff.id, worker.id))
}

export async function selectStaffMember(id:number) {
    return await db.select().from(staff).where(eq(staff.id, id))
}
export async function selectAllStaffMembers() {
    return await db.selectDistinct().from(staff)
}