import NodeCache from "node-cache";
import { GiftModel } from "../../types";

const secondsToExpireGifts = 50000;
const giftsCache = new NodeCache();

export function SetGiftsOnCache(gifts: GiftModel[]) {
  const serializedGifts = JSON.stringify(gifts);
  giftsCache.set('gifts', serializedGifts, secondsToExpireGifts);
}

export function GetGiftsFromCache(): GiftModel[] {
  const giftsFromCache = giftsCache.get('gifts') as string;

  if (!giftsFromCache) {
    return [];
  }

  const deserializedGifts = JSON.parse(giftsFromCache) as GiftModel[];
  return deserializedGifts;
}