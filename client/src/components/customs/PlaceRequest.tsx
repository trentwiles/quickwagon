import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { ShoppingBasket } from "lucide-react";
import { useEffect, useState } from "react";

function handleData(data): string[] {
    console.log(data)
    return []
}

export default function PlaceRequest() {
  const [itemSearch, setItemSearch] = useState("i");
  const [searchResult, setSearchResult] = useState<string[]>()
  const [searchInProgress, setSearchInProgress] = useState(false)

  useEffect(() => {
    setSearchInProgress(true)
    fetch(`${import.meta.env.VITE_API_ENDPOINT}/search?q=${itemSearch}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setSearchResult(handleData(data))
        setSearchInProgress(false);
      })
      .catch(() => {
        console.error("search error, if you see this message report to administrator")
        setSearchInProgress(false);
      });
  }, [itemSearch]);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <ShoppingBasket /> New Order
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Order</SheetTitle>
          <SheetDescription>
            Don't forget to press "submit" when you're done!
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4 mx-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Items
            </Label>
            <Input
              id="items"
              value={itemSearch}
              className="col-span-3"
              onChange={(e) => setItemSearch(e.target.value)}
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
