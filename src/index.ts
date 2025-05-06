import dotenv from "dotenv";
import { scrapeEater } from "./lib/scraper";
import { createRestaurantProperties } from "./lib/properties";
import { createCoverImage } from "./lib/image";
import { Graph, Ipfs, Op } from "@graphprotocol/grc-20";
import {
  AUTHOR,
  GRC20_API_URL,
  RESTAURANT_TYPE_ID,
  SPACE_ID,
} from "./lib/const";
import { submitAndSendTransaction } from "./lib/transaction";

dotenv.config();

async function main() {
  try {
    const allOps: Array<Op> = []; // Array to hold all operations

    //Scrape restaurants from Eater
    const restaurants = await scrapeEater();

    // Create Restaurant properties
    const propertyData = createRestaurantProperties();

    console.log({ propertyData });

    allOps.push(...propertyData.ops);

    // Iterate over the scraped restaurants
    for (const restaurant of restaurants) {
      // Create a cover image for the restaurant
      const coverImageData = await createCoverImage(restaurant.image);

      allOps.push(...coverImageData.ops);

      // Create restaurant entity
      const { id: restaurantId, ops: createRestaurantOps } = Graph.createEntity(
        {
          name: restaurant.name,
          description: restaurant.description,
          cover: coverImageData.id,
          types: [RESTAURANT_TYPE_ID],
          properties: {
            [propertyData.namePropertyId]: {
              type: "TEXT",
              value: restaurant.name,
            },
            [propertyData.descriptionPropertyId]: {
              type: "TEXT",
              value: restaurant.description,
            },
            [propertyData.addressPropertyId]: {
              type: "TEXT",
              value: restaurant.address,
            },
            [propertyData.phonePropertyId]: {
              type: "TEXT",
              value: restaurant.phone,
            },
            [propertyData.websitePropertyId]: {
              type: "URL",
              value: restaurant.website,
            },
          },
        }
      );
      console.log(`Restaurant entity created with ID: ${restaurantId}`);
      allOps.push(...createRestaurantOps);
    }

    // Publish the edit to IPFS
    const { cid } = await Ipfs.publishEdit({
      name: "Add Restaurant",
      ops: allOps,
      author: AUTHOR,
    });
    console.log(`Edit published to IPFS with CID: ${cid}`);

    // Fetch calldata
    const calldataResponse = await fetch(
      `${GRC20_API_URL}/space/${SPACE_ID}/edit/calldata`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cid: cid,
          network: "TESTNET",
        }),
      }
    );

    // Check response status and content
    if (!calldataResponse.ok) {
      const responseText = await calldataResponse.text();
      throw new Error(
        `Failed to fetch calldata: ${calldataResponse.statusText}\nResponse: ${responseText}`
      );
    }

    let responseJson;
    try {
      responseJson = await calldataResponse.json();
    } catch (parseError) {
      const responseText = await calldataResponse.text();
      throw new Error(
        `Failed to parse JSON response: ${
          parseError instanceof Error ? parseError.message : "Unknown error"
        }\nRaw response: ${responseText}`
      );
    }

    const { to, data: calldata } = responseJson;

    // Submit and send the transaction to the blockchain
    const txResult = await submitAndSendTransaction({
      to: to,
      data: calldata,
      cid: cid,
    });
    console.log(`Transaction sent: ${txResult.txHash}`);
    process.exit(0);
  } catch (error) {
    console.error("Error in main function:", error);
  }
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
