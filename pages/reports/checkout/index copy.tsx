import React, { useEffect } from "react";
import { GetStaticProps } from "next";
import prisma from "../../../lib/prisma";
import DateTimePicker from "../../../components/DateTimePicker";
import ItemAndQuantitySelector from "../../../components/ItemAndQuantitySelector";
import { Prisma } from "@prisma/client";
import FormAndTable from "../../../components/FormAndTable";
export const getStaticProps: GetStaticProps = async () => {
  const items = await prisma.item.findMany({
    include: {
      units: true,
    },
  });
  const checkoutHistory = await prisma.itemCheckout.findMany({
    include: {
      item: {
        include: {
          units: true,
        },
      },
      unit: true,
    },
    orderBy: {
      timestamp: "desc",
    },
  });
  return {
    props: { items, checkoutHistory },
    revalidate: 1,
  };
};

type CheckoutItem = Prisma.ItemCheckoutGetPayload<{
  include: {
    item: {
      include: {
        units: true;
      };
    };
    unit: true;
  };
}>;

type Props = {
  items: Prisma.ItemGetPayload<{
    include: {
      units: true;
    };
  }>[];
  checkoutHistory: CheckoutItem[];
};

export default function Checkout({ items, checkoutHistory }: Props) {
  const [selectedItemId, setSelectedItemId] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(1);
  const [selectedUnitId, setSelectedUnitId] = React.useState<string>("");
  const [timestamp, setTimestamp] = React.useState<string>(
    new Date().toISOString()
  );
  useEffect(() => {
    const mostRecentCheckout = checkoutHistory.find(
      (checkout) => checkout.itemId === selectedItemId
    );
    if (mostRecentCheckout) {
      setSelectedUnitId(mostRecentCheckout.unitId);
    } else {
      setSelectedUnitId("");
    }
  }, [checkoutHistory, selectedItemId]);

  return (
    <FormAndTable
      title="Checkout Item"
      tableTitle="Checkout History"
      history={checkoutHistory}
      columns={["Item", "Quantity", "Timestamp"]}
      getRow={(checkout) => [
        checkout.item.name,
        `${checkout.quantity} ${
          checkout.unit?.name ?? checkout.item.standardUnit
        }`,
        new Date(checkout.timestamp).toLocaleString(),
      ]}
      deleteRow={async (id: string) => {
        await fetch("/api/checkout", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
      }}
      addRow={async () => {
        const resp = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: selectedItemId,
            quantity: quantity,
            unitId: selectedUnitId?.length > 0 ? selectedUnitId : null,
            timestamp,
          }),
        });
        const newId = (await resp.json()).id as string;
        return newId;
      }}
      getFormItem={() => {
        const item: Omit<CheckoutItem, "id"> = {
          item: items.find((item) => item.id === selectedItemId),
          itemId: selectedItemId,
          quantity,
          unitId: selectedUnitId,
          unit: items
            .find((item) => item.id === selectedItemId)
            ?.units.find((unit) => unit.id === selectedUnitId),
          timestamp: new Date(timestamp),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return item;
      }}
    >
      <ItemAndQuantitySelector
        itemOptions={items}
        selectedItemId={selectedItemId}
        selectedUnitId={selectedUnitId}
        quantity={quantity}
        setSelectedItemId={setSelectedItemId}
        setQuantity={setQuantity}
        setSelectedUnitId={setSelectedUnitId}
      />
      <DateTimePicker timestamp={timestamp} setTimestamp={setTimestamp} />
    </FormAndTable>
  );
}
