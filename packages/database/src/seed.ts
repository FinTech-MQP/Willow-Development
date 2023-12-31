import { prisma } from ".";
import fetch from "node-fetch";

// list of address IDs
const DEFAULT_ADDRESSES_TO_LIST = ["24", "1282", "564"];

(async () => {
  try {
    await Promise.all(
      DEFAULT_ADDRESSES_TO_LIST.map(async (addressId) => {
        // create/update address in db
        await fetch(`http://localhost:2999/gis/address/${addressId}`, {
          method: "POST",
        })
          .then((res) => res.text())
          .then((str) => {
            console.log(`Result of adding address ID ${addressId} to database: ${str}`)
          });
        // create/update listing for
        await fetch("http://localhost:2999/api/listing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addressId: addressId,
          }),
        })
          .then((res) => res.text())
          .then((str) => {
            console.log(`Result of adding listing for address ID ${addressId} to database: ${str}`)
          });
      })
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
