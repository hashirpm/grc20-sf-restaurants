import { Graph, Op } from "@graphprotocol/grc-20";

export function createRestaurantProperties() {
  // Create properties for Restaurant
  const { id: namePropertyId, ops: nameOps } = Graph.createProperty({
    type: "TEXT",
    name: "Restaurant Name",
  });
  const { id: descriptionPropertyId, ops: descriptionOps } =
    Graph.createProperty({
      type: "TEXT",
      name: "Restaurant Description",
    });
  const { id: addressPropertyId, ops: addressOps } = Graph.createProperty({
    type: "TEXT",
    name: "Restaurant Address",
  });
  const { id: phonePropertyId, ops: phoneOps } = Graph.createProperty({
    type: "TEXT",
    name: "Restaurant Phone",
  });
  const { id: websitePropertyId, ops: websiteOps } = Graph.createProperty({
    type: "URL",
    name: "Restaurant Website",
  });
  const ops: Array<Op> = [
    ...nameOps,
    ...descriptionOps,
    ...addressOps,
    ...phoneOps,
    ...websiteOps,
  ];
  return {
    namePropertyId,
    descriptionPropertyId,
    addressPropertyId,
    phonePropertyId,
    websitePropertyId,
    ops,
  };
}
