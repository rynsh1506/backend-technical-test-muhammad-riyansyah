import fs from "fs";

let code = fs.readFileSync("src/modules/purchase-request/service.ts", "utf-8");

// Replace the export const with abstract class
code = code.replace(
  "export const purchaseRequestService = {",
  "export abstract class PurchaseRequestService {"
);

// We also need to change how recursive calls are made inside.
// Wait, there are calls like `purchaseRequestService.getDetail(prId)`.
// We need to change them to `this.getDetail(prId)`.
code = code.replace(/purchaseRequestService\./g, "this.");

// Add static keywords and JSDoc
code = code.replace(
  /createDraft: async \(warehouseId: number, userId: number\) => {/g,
  `/**
   * Creates a draft purchase request.
   *
   * @param warehouseId - The warehouse ID for this purchase request.
   * @param userId - The ID of the user creating the request.
   * @returns The newly created purchase request.
   */
  static async createDraft(warehouseId: number, userId: number) {`
);

code = code.replace(
  /getList: async \(page = 1, limit = 10, filterStatus\?: string\) => {/g,
  `/**
   * Retrieves a paginated list of purchase requests.
   *
   * @param page - The page number to retrieve.
   * @param limit - The maximum number of records per page.
   * @param filterStatus - Optional status filter.
   * @returns Paginated purchase requests.
   */
  static async getList(page = 1, limit = 10, filterStatus?: string) {`
);

code = code.replace(
  /getDetail: async \(prId: number\) => {/g,
  `/**
   * Retrieves the details of a specific purchase request including its items.
   *
   * @param prId - The purchase request ID.
   * @returns The purchase request and its items.
   * @throws {404} If the purchase request is not found.
   */
  static async getDetail(prId: number) {`
);

code = code.replace(
  /updateDraft: async \(prId: number, userId: number, warehouseId: number\) => {/g,
  `/**
   * Updates the warehouse of a draft purchase request.
   *
   * @param prId - The purchase request ID.
   * @param userId - The user ID making the update.
   * @param warehouseId - The new warehouse ID.
   * @returns The updated purchase request.
   * @throws {400} If the request is not in DRAFT status.
   */
  static async updateDraft(prId: number, userId: number, warehouseId: number) {`
);

code = code.replace(
  /addItem: async \(\n    prId: number,\n    userId: number,\n    productId: number,\n    quantity: number,\n  \) => {/g,
  `/**
   * Adds an item to a draft purchase request.
   *
   * @param prId - The purchase request ID.
   * @param userId - The user ID adding the item.
   * @param productId - The product ID to add.
   * @param quantity - The quantity of the product.
   * @returns The newly added item.
   * @throws {400} If the request is not in DRAFT status or product is duplicate.
   */
  static async addItem(
    prId: number,
    userId: number,
    productId: number,
    quantity: number,
  ) {`
);

code = code.replace(
  /updateItem: async \(itemId: number, userId: number, quantity: number\) => {/g,
  `/**
   * Updates the quantity of an item in a draft purchase request.
   *
   * @param itemId - The ID of the item to update.
   * @param userId - The user ID making the update.
   * @param quantity - The new quantity.
   * @returns The updated item.
   * @throws {404} If the item is not found.
   * @throws {400} If the purchase request is not in DRAFT status.
   */
  static async updateItem(itemId: number, userId: number, quantity: number) {`
);

code = code.replace(
  /removeItem: async \(itemId: number, userId: number\) => {/g,
  `/**
   * Removes an item from a draft purchase request.
   *
   * @param itemId - The ID of the item to remove.
   * @param userId - The user ID making the removal.
   * @returns A success status.
   * @throws {404} If the item is not found.
   * @throws {400} If the purchase request is not in DRAFT status.
   */
  static async removeItem(itemId: number, userId: number) {`
);

code = code.replace(
  /submit: async \(prId: number, userId: number\) => {/g,
  `/**
   * Submits a draft purchase request for approval.
   *
   * @param prId - The purchase request ID.
   * @param userId - The user ID submitting the request.
   * @returns The updated purchase request.
   * @throws {404} If the purchase request is not found.
   * @throws {400} If the request is not in DRAFT status or has no items.
   */
  static async submit(prId: number, userId: number) {`
);

code = code.replace(
  /approve: async \(prId: number, approverId: number\) => {/g,
  `/**
   * Approves a submitted purchase request.
   *
   * @param prId - The purchase request ID.
   * @param approverId - The user ID approving the request.
   * @returns The updated purchase request.
   * @throws {404} If the purchase request is not found.
   * @throws {400} If the request is not in SUBMITTED status.
   */
  static async approve(prId: number, approverId: number) {`
);

code = code.replace(
  /reject: async \(prId: number, approverId: number\) => {/g,
  `/**
   * Rejects a submitted purchase request.
   *
   * @param prId - The purchase request ID.
   * @param approverId - The user ID rejecting the request.
   * @returns The updated purchase request.
   * @throws {404} If the purchase request is not found.
   * @throws {400} If the request is not in SUBMITTED status.
   */
  static async reject(prId: number, approverId: number) {`
);

// We need to fix the commas at the end of functions to no commas or semicolons
// We can use a regex for that, or we can just format with prettier and it might fix it. Wait, no, object properties have `,`, class methods don't have `,`.
// Since we used regex above, the ends of functions will still have `,`.
// Let's replace `},\n\n  ` with `}\n\n  `
code = code.replace(/},\n\n  \/\*\*/g, "}\n\n  /**");
code = code.replace(/},\n\n  static/g, "}\n\n  static");
// Fix the last method's comma
code = code.replace(/},\n};/g, "}\n}");

fs.writeFileSync("src/modules/purchase-request/service.ts", code);

// Now index.ts update
let indexCode = fs.readFileSync("src/modules/purchase-request/index.ts", "utf-8");
indexCode = indexCode.replace(/import { purchaseRequestService }/g, "import { PurchaseRequestService }");
indexCode = indexCode.replace(/purchaseRequestService\./g, "PurchaseRequestService.");
fs.writeFileSync("src/modules/purchase-request/index.ts", indexCode);
