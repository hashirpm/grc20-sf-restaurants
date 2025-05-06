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
    const restaurants = await scrapeEater();
    // const restaurant = {
    //   name: "Abacá",
    //   description:
    //     "When Francis Ang opened the doors to his Kimpton Alton Hotel restaurant in Fisherman’s Wharf, the city already knew it was the breath of fresh seabreeze air diners needed. In short order his Pinoy heritage cooking drew eaters to the otherwise-for-tourists neighborhood: sisig fried rice with poached egg and pickled onions, adobo-glazed yuba skin barbecue skewer, American wagyu beef pares with parsnip and soy beef jus. Ang was a pop-up phenom before rolling out the chic bar and restaurant in 2021. The vibe is fancy but accessible; this is not a suit-and-tie restaurant, though that wouldn’t be overdressing, either. Breakfast here is geared to tourists — though a $6 bibingka rice cake with caramelized brie and salted egg is awesome any day — whereas brunch is a San Francisco-wide weekend affair. Reservations are bookable here.",
    //   address: "2700 Jones St, San Francisco, CA 94133",
    //   phone: "(415) 486-0788",
    //   website: "http://www.restaurantabaca.com/",
    //   image:
    //     "https://cdn.vox-cdn.com/thumbor/44lTkiD0ceq2seBDl71UhiYxE7c=/0x0:2000x1333/1200x900/filters:focal(840x507:1160x827):no_upscale()/cdn.vox-cdn.com/uploads/chorus_image/image/71100690/Abaca_PChang_0829.0.jpg",
    // };
    const allOps: Array<Op> = [];
    const propertyData = createRestaurantProperties();
    console.log({ propertyData });
    let { ops } = propertyData;
    allOps.push(...ops);
    for (const restaurant of restaurants) {
      const coverImageData = await createCoverImage(restaurant.image);
      console.log({ coverImageData });
      allOps.push(...coverImageData.ops);
      // Create restaurant entity for Abacá
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
    const { cid } = await Ipfs.publishEdit({
      name: "Add Restaurant",
      ops: ops,
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

    const txResult = await submitAndSendTransaction({
      to: to,
      data: calldata,
      cid: cid,
    });
    console.log(`Transaction sent: ${txResult.txHash}`);
  } catch (error) {
    console.error("Error in main function:", error);
  }
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
