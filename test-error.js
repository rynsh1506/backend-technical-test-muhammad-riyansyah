import { app } from "./src/app.ts";
app.handle(new Request("http://localhost/purchase-orders/2/order", {
  method: "POST",
  headers: {
    cookie: "auth=token_or_something_valid_wait_no",
  }
})).then(async (res) => {
  console.log(res.status);
  console.log(await res.text());
});
