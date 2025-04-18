import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Separator } from "@/components/ui/separator";

import { toast } from "sonner";

import {
  ShoppingBasket,
  CirclePlus,
  CloudOff,
  CloudDownload,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import ConfirmOrderButton from "./snippets/ConfirmOrderButton";

type orderMetadata = {
  orderPreTip: number;
  orderPostTip: number;
  tip: number;
};

function handleData(data, itemsInBasket): string[] {
  if ("error_msg" in data) {
    return [];
  }
  const elements: string[] = [];
  data.map((item) => {
    if (!itemsInBasket.includes(item)) {
      elements.push(item);
    }
  });

  return elements;
}

export default function PlaceRequest() {
  const [orderID, setOrderID] = useState<number>(0);
  const [orderDetails, setOrderDetails] = useState<orderMetadata>({
    orderPostTip: -1,
    orderPreTip: -1,
    tip: 0.2,
  });

  const [itemSearch, setItemSearch] = useState("i");
  const [searchResult, setSearchResult] = useState<string[]>();
  const [searchInProgress, setSearchInProgress] = useState(false);

  const [itemsInBasket, setItemsInBasket] = useState<string[]>([]);

  const [termsAccepted, setTermsAccepted] = useState(false);

  // https://stackoverflow.com/q/53253940
  const firstUpdate = useRef(true);

  useEffect(() => {
    // don't search on first render
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    setSearchInProgress(true);
    fetch(`${import.meta.env.VITE_API_ENDPOINT}/search?q=${itemSearch.trim()}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setSearchResult(handleData(data, itemsInBasket));
        setSearchInProgress(false);
      })
      .catch(() => {
        console.error(
          "search error, if you see this message report to administrator"
        );
        setSearchInProgress(false);
      });
  }, [itemSearch]);

  // *******************************************
  // add another useEffect here to save the order
  // *******************************************

  useEffect(() => {
    // ignore for blank orders
    if (itemsInBasket.length == 0) {
      return
    }
    fetch(`${import.meta.env.VITE_API_ENDPOINT}/modOrder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderItems: itemsInBasket,
        orderID: orderID != undefined ? orderID : 0,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((apiData) => {
        setOrderDetails({
          orderPreTip: apiData.preTipTotal,
          orderPostTip: apiData.postTipTotal,
          tip: apiData.tip,
        });
        setOrderID(apiData.orderID);
      })
      .catch(() => {
        toast(
          <p>
            <CloudOff /> Unable to connect to the API. Check your network
            connection.
          </p>
        );
      });
  }, [itemsInBasket]);

  // *******************************************
  // *******************************************
  return (
    <>
      {itemsInBasket.length > 0 ? (
        <div className="inProgressOrder">
          <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
            Editing Order #{orderID}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <CloudDownload className="mr-2" />
            <span>{searchInProgress ? `Saving changes...` : `All changes saved.`}</span>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
        {itemsInBasket.map((ele) => (
          <Button
            onClick={() => {
              setItemsInBasket(itemsInBasket.filter((item) => item !== ele));
              toast(`${ele} removed from the basket`, {
                action: {
                  label: "Undo",
                  onClick: () => setItemsInBasket((prev) => [...prev, ele]),
                },
              });
              // one more message: if that was the last item, we also make note the order was destroyed
              if (itemsInBasket.length == 0) {
                toast(`#${orderID} has been deleted`)
                setOrderID(0)
              }
            }}
            className="strike-on-hover"
          >
            {ele}
          </Button>
        ))}
      </div>
      <Sheet>
        <SheetTrigger asChild>
          {/* clear the search query when opening the dialouge */}
          <Button variant="outline" onClick={() => setItemSearch("")}>
            <ShoppingBasket />{" "}
            {itemsInBasket.length > 0 ? (
              <span>Edit Order</span>
            ) : (
              <span>New Order</span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {itemsInBasket.length > 0 ? (
                <span>Edit Order</span>
              ) : (
                <span>New Order</span>
              )}
            </SheetTitle>
            <SheetDescription>
              To remove an item, click out of this dialogue, and click the item
              in the cart.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4 mx-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                <CirclePlus /> Item
              </Label>
              <Input
                id="items"
                value={itemSearch}
                className="col-span-3"
                onChange={(e) => setItemSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              {searchResult?.map((ele) => (
                <Button
                  onClick={() => {
                    // First add item to useState
                    setItemsInBasket([...itemsInBasket, ele]);
                    // Then remove it from the options
                    setSearchResult(
                      searchResult.filter((item) => item !== ele)
                    );
                  }}
                >
                  <CirclePlus /> {ele}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 items-center">
              <Checkbox
                id="terms"
                checked={termsAccepted ? true : false}
                onClick={() => setTermsAccepted(!termsAccepted)}
              />
              <Label htmlFor="terms">Accept Terms of Service</Label>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {orderID != 0 ? (
        <>
          <Separator />
          <ConfirmOrderButton
            apiEndpoint={`${import.meta.env.VITE_API_ENDPOINT}/submitOrder`}
            orderID={orderID}
            orderItems={itemsInBasket}
            totalBeforeTip={orderDetails.orderPreTip}
            totalAfterTip={orderDetails.orderPostTip}
            isEnabled={termsAccepted}
            // finally, a callback function that wipes everything after the order is submitted
            pageWipeListener={(doWeWipeEverything: boolean) => {
              if (doWeWipeEverything) {
                setOrderID(0)
                setItemsInBasket([])
              }
            }}
          />
        </>
      ) : (
        <></>
      )}
    </>
  );
}
