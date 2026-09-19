import { db, queryClient } from "@/utils/db";
import { users } from "@/entities/auth.schema";
import { products } from "@/entities/product.schema";
import { suppliers } from "@/entities/supplier.schema";
import { warehouses } from "@/entities/warehouse.schema";

/**
 * Executes the database seeding process.
 * Populates essential initial data for users (USER and APPROVER), products,
 * suppliers, and warehouses to ensure the application is immediately testable.
 *
 * Safe to run multiple times (uses onConflictDoNothing).
 */
async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    const defaultPassword = await Bun.password.hash("password123");

    console.log("Seeding users...");
    await db
      .insert(users)
      .values([
        {
          username: "staff_user",
          password: defaultPassword,
          role: "USER",
        },
        {
          username: "staff_user_2",
          password: defaultPassword,
          role: "USER",
        },
        {
          username: "manager_approver",
          password: defaultPassword,
          role: "APPROVER",
        },
      ])
      .onConflictDoNothing();

    console.log("Seeding products...");
    await db
      .insert(products)
      .values([
        { sku: "IND-OIL-01", name: "Industrial Oil", unit: "PCS" },
        { sku: "SFT-GLV-01", name: "Safety Gloves", unit: "BOX" },
      ])
      .onConflictDoNothing();

    console.log("Seeding suppliers...");
    await db
      .insert(suppliers)
      .values([
        {
          name: "PT. Sentosa Logistik",
          email: "contact@sentosalogistik.com",
          phone: "081234567890",
        },
      ])
      .onConflictDoNothing();

    console.log("Seeding warehouses...");
    await db
      .insert(warehouses)
      .values([
        {
          code: "JKT-01",
          name: "Jakarta Main Warehouse",
          location: "Jakarta, Indonesia",
        },
      ])
      .onConflictDoNothing();

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

main();
