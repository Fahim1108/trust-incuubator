import {notFound} from "next/navigation";
import {reviewInventoryEnabled} from "@/lib/storefront-policy";
import LoaderPreviewClient from "@/components/loading/LoaderPreviewClient";
export default function LoaderPreview(){
 if(!reviewInventoryEnabled())notFound();
 return <LoaderPreviewClient/>;
}
