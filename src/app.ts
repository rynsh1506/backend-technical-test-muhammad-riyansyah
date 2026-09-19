import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { logger } from "@/utils/logger";
import { authController } from "@/modules/auth";
import { productController } from "@/modules/product";
import { supplierController } from "@/modules/supplier";
import { warehouseController } from "@/modules/warehouse";
import { purchaseRequestController } from "@/modules/purchase-request";
import { purchaseOrderController } from "@/modules/purchase-order";
import { goodsReceiptController } from "@/modules/goods-receipt";
import { inventoryController } from "@/modules/inventory";
import { auditController } from "@/modules/audit";

/**
 * The main Elysia application instance.
 * Export this for use in tests and the root entrypoint.
 */
export const app = new Elysia()
  .use(logger)
  .use(cors())

  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "Backend Technical Test API",
          version: "1.0.11",
          description:
            "API Documentation for Master Data and Purchase Request System",
        },
      },
    }),
  )
  .use(authController)
  .use(productController)
  .use(supplierController)
  .use(warehouseController)
  .use(purchaseRequestController)
  .use(purchaseOrderController)
  .use(goodsReceiptController)
  .use(inventoryController)
  .use(auditController);
