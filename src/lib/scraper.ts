import * as puppeteer from "puppeteer";
import { Restaurant } from "../interface/Restaurant";

export async function scrapeEater(): Promise<Restaurant[]> {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true, 
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    console.log("Navigating to SF Eater...");
    await page.goto(
      "https://sf.eater.com/maps/best-restaurants-san-francisco-38",
      {
        waitUntil: "networkidle2",
        timeout: 60000,
      }
    );

    await page.waitForSelector(".c-mapstack__card");

    // Get all restaurant cards
    const restaurants: Restaurant[] = await page.evaluate(() => {
      const main = document.querySelector("main#content");
      const restaurantCards = Array.from(
        main?.querySelectorAll(".c-mapstack__card") || []
      );

      const validRestaurants: Restaurant[] = [];

      restaurantCards.forEach((card) => {
        // Extract name
        const nameElement =
          card.querySelector(".c-mapstack__card-hed h1") ||
          card.querySelector(".c-mapstack__card-hed div h1");
        const name = nameElement ? nameElement.textContent?.trim() : null;

        // Skip this card if name is null, undefined, or empty
        if (!name) {
          return; // Skip to next iteration
        }

        // Extract description
        const descriptionElement = card.querySelector(
          ".c-entry-content.venu-card"
        );
        let description = "";
        if (descriptionElement) {
          // Get text from all p elements except those that begin with "strong" tags for details
          const paragraphs = Array.from(
            descriptionElement.querySelectorAll("p")
          ).filter((p) => {
            const firstChild = p.firstElementChild;
            return !(firstChild && firstChild.tagName === "STRONG");
          });

          description = paragraphs
            .map((p) => p.textContent?.trim())
            .join(" ")
            .trim();
        }
        let address = "";
        let phone = "";
        let website = "";

        // Extract address, phone, and website
        const infoSection = card.querySelector(".c-mapstack__info");
        if (infoSection) {
          const addressElement = infoSection.querySelector(
            ".c-mapstack__address a"
          );
          if (addressElement) {
            address = addressElement.textContent?.trim() || "";
          }

          const phoneElement = infoSection.querySelector(
            ".c-mapstack__phone a"
          );
          if (phoneElement) {
            phone = phoneElement.textContent?.trim() || "";
          }
          const websiteElement = infoSection.querySelector(
            '.info a[data-analytics-link="link-icon"]'
          );
          if (websiteElement) {
            website = websiteElement.getAttribute("href")?.trim() || "";
          }

          // Extract image
          const imageElement = card.querySelector(".c-mapstack__photo img");
          const image = imageElement?.getAttribute("src") || "";

          // Add this restaurant to valid restaurants array
          validRestaurants.push({
            name,
            description,
            address,
            phone,
            website,
            image,
          });
        }
      });

      return validRestaurants;
    });

    console.log(`Found ${restaurants.length} valid restaurants with names`);
    return restaurants;
  } catch (error) {
    console.error("An error occurred during scraping:", error);
    return [];
  } finally {
    await browser.close();
    console.log("Browser closed");
  }
}
