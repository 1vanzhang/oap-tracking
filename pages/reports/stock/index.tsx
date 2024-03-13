import React from "react";
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
  const stockHistory = await prisma.itemStock.findMany({
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
    props: { items, stockHistory },
    revalidate: 5,
  };
};

type StockHistoryRecord = Prisma.ItemStockGetPayload<{
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
  stockHistory: StockHistoryRecord[];
};

export default function ReportStock({ items, stockHistory }: Props) {
  const [itemId, setItemId] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(NaN);
  const [unitId, setUnitId] = React.useState<string>("");
  const [timestamp, setTimestamp] = React.useState<string>(
    new Date().toISOString()
  );

  return (
    <FormAndTable
      title="Report Stock"
      tableTitle="Stock History"
      history={stockHistory}
      columns={["Item", "Quantity", "Unit", "Timestamp"]}
      getRow={(item) => [
        item.item.name,
        item.quantity,
        item.unit?.name ?? item.item.standardUnit,
        item.timestamp.toLocaleString(),
      ]}
      deleteRow={async (id: string) => {
        await fetch("/api/stock", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
      }}
      addRow={async () => {
        const resp = await fetch("/api/stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId,
            quantity,
            unitId: unitId.length > 0 ? unitId : null,
            timestamp,
          }),
        });
        const newId = (await resp.json()).id as string;
        return newId;
      }}
      getFormItem={() => {
        const item: Omit<StockHistoryRecord, "id"> = {
          item: items.find((item) => item.id === itemId),
          itemId,
          quantity,
          unitId,
          unit: items
            .find((item) => item.id === itemId)
            ?.units.find((unit) => unit.id === unitId),
          timestamp: new Date(timestamp),
        };
        return item;
      }}
    >
      <ItemAndQuantitySelector
        itemOptions={items}
        selectedItemId={itemId}
        selectedUnitId={unitId}
        quantity={quantity}
        setSelectedItemId={setItemId}
        setQuantity={setQuantity}
        setSelectedUnitId={setUnitId}
      />
      <DateTimePicker timestamp={timestamp} setTimestamp={setTimestamp} />
    </FormAndTable>
  );
}
