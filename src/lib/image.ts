import { Graph } from "@graphprotocol/grc-20";

export async function createCoverImage(url: string) {
    const { id, ops } = await Graph.createImage({ url });
    return { id, ops };
}

