import NodeCache from "node-cache";
import { GiftType } from "../../types";

const giftsCache = new NodeCache();

export function SetGiftsOnCache(gifts: GiftType[]) {
  const serializedGifts = JSON.stringify(gifts);
  giftsCache.set('gifts', serializedGifts);
}

export function GetGiftsFromCache(): GiftType[] {
  const giftsFromCache = giftsCache.get('gifts') as string;

  if (!giftsFromCache) {
    return [];
  }

  const deserializedGifts = JSON.parse(giftsFromCache) as GiftType[];
  return deserializedGifts;
}