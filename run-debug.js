import { db } from "./src/utils/db.ts";
import { purchaseOrders } from "./src/modules/purchase-order/model.ts";
import { auditLogs } from "./src/modules/audit/model.ts";

async function run() {
  try {
     const poData = await db.select().from(purchaseOrders).limit(1);
     console.log("PO:", poData[0]);
     
     // let's try the audit log insert directly
     await db.insert(auditLogs).values({
      entityName: "purchase_orders",
      entityId: poData[0].id,
      action: "ORDERED",
      performedBy: 1, // staff_user
    });
    console.log("OK");
  } catch (err) {
     console.error(err);
  }
  process.exit(0);
}
run();
