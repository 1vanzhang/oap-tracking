import React from "react";
import Layout from "../../../components/Layout";
import { GetStaticProps } from "next";
import prisma from "../../../lib/prisma";
import DateTimePicker from "../../../components/DateTimePicker";
import Router from "next/router";
import Form from "../../../components/Form";
import ItemAndQuantitySelector from "../../../components/ItemAndQuantitySelector";
import DeleteButton from "../../../components/DeleteButton";
import DataTable from "../../../components/DataTable";
import { Prisma } from "@prisma/client";

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

type Props = {
  items: Prisma.ItemGetPayload<{
    include: {
      units: true;
    };
  }>[];
  stockHistory: Prisma.ItemStockGetPayload<{
    include: {
      item: {
        include: {
          units: true;
        };
      };
      unit: true;
    };
  }>[];
};

export default function ReportStock({ items, stockHistory }: Props) {
  const [itemId, setItemId] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(NaN);
  const [unitId, setUnitId] = React.useState<string>("");
  const [timestamp, setTimestamp] = React.useState<string>(
    new Date().toISOString()
  );
  const submit = async () => {
    const response = await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity, unitId, timestamp }),
    });
    Router.reload();
  };
  return (
    <Layout>
      <div className="page">
        <main>
          <Form title="Report Stock" onSubmit={submit}>
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
          </Form>

          <DataTable
            title="Stock History"
            columns={["Item", "Quantity", "Unit", "Timestamp", "Delete"]}
            data={stockHistory.map((stock) => [
              stock.item.name,
              stock.quantity,
              stock.unit.name,
              stock.timestamp.toLocaleString(),
              <DeleteButton
                onClick={async () => {
                  await fetch("/api/stock", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: stock.id }),
                  });
                  Router.reload();
                }}
              >
                Delete
              </DeleteButton>,
            ])}
          />
        </main>
      </div>
    </Layout>
  );
}
