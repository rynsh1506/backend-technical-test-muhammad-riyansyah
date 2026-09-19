import { app } from "./src/app";
import { treaty } from "@elysiajs/eden";

const api = treaty(app);

const run = async () => {
    type ProductPostPayload = Parameters<typeof api.products.post>[0];
    const payload = { name: "Incomplete Product" } as unknown as ProductPostPayload;
}
