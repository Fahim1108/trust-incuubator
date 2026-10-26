/** Admin DTO for a future trusted entitlement service. All money is integer BDT minor units. */
export interface FirstOrderRewardOffer {
 code:string;
 discount:{type:'fixed';amountMinor:number}|{type:'percentage';basisPoints:number};
 minimumOrderMinor:number;
 maximumDiscountMinor?:number;
 expiresAt:string;
 eligibleCollectionIds?:string[];
 eligibleProductIds?:string[];
 active:boolean;
 maximumUses:number;
 usesPerEligibleCustomer:1;
}
export interface FirstOrderRewardSettings {
 enabled:boolean;
 /** Versioned business-approved lifecycle event; not a payment-submitted event. */
 qualifyingMilestone:{eventName:string;version:number}|null;
 offer:FirstOrderRewardOffer|null;
}
/** No offer or success milestone has been approved/configured. Nothing can issue or redeem rewards. */
export const firstOrderReward:FirstOrderRewardSettings={enabled:false,qualifyingMilestone:null,offer:null};
