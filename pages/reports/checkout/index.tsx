import React, { useEffect } from "react";
import Layout from "../../../components/Layout";
import { GetStaticProps } from "next";
import prisma from "../../../lib/prisma";
import DateTimePicker from "../../../components/DateTimePicker";
import { useSession } from "next-auth/react";
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

type Props = {
  items: Prisma.ItemGetPayload<{
    include: {
      units: true;
    };
  }>[];
  checkoutHistory: Prisma.ItemCheckoutGetPayload<{
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
  const { data: session, status } = useSession();

  const userId = session?.user?.email;

  const submit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: selectedItemId,
        quantity: quantity,
        unitId: selectedUnitId?.length > 0 ? selectedUnitId : null,
        timestamp,
      }),
    });
    Router.reload();
  };
  return (
    <Layout>
      <div className="page">
        <main>
          <Form title="Checkout Item" onSubmit={submit}>
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
          </Form>
          <DataTable
            title="Checkout History"
            columns={["Item", "Quantity", "Timestamp", "Delete"]}
            data={checkoutHistory.map((checkout) => [
              checkout.item.name,
              `${checkout.quantity} ${
                checkout.unit?.name || checkout.item.standardUnit
              }`,
              new Date(checkout.timestamp).toLocaleString(),
              <DeleteButton
                onClick={async () => {
                  await fetch("/api/checkout", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: checkout.id }),
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
