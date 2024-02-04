import { GetServerSideProps } from "next";
import React from "react";
import prisma from "../../../lib/prisma";
import Layout from "../../../components/Layout";
import SupplierHistory from "./SupplierHistory";
import { Supplier } from "../SuppliersTable";
import Units from "./Units";
import Router from "next/router";
type ProductItem = {
  id: string;
  itemId: string;
  quantity: number;
  unitId: string;
  componentId: string;
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const item = await prisma.item.findUnique({
    where: {
      id: String(params?.id),
    },
    include: {
      units: {
        include: {
          productItem: true,
          itemSupplier: true,
        },
      },
      suppliers: {
        include: {
          suppliedUnit: true,
        },
      },
    },
  });
  const supplierOptions = await prisma.supplier.findMany();
  return {
    props: { item, supplierOptions },
  };
};

export type ItemUnit = {
  id: string;
  name: string;
  ratioToStandard: number;
  itemId: string;
  productItem: ProductItem[];
  itemSupplier: ItemSupplier[];
};

export type ItemSupplier = {
  id: string;
  itemId: string;
  date: Date;
  pricePerUnit: number;
  suppliedUnit: ItemUnit;
  supplierName: string;
};

export type Item = {
  id: string;
  name: string;
  standardUnit: string;
  createdAt: Date;
  updatedAt: Date;
  units: ItemUnit[];
  suppliers: ItemSupplier[];
};

type Props = {
  item: Item;
  supplierOptions: Supplier[];
};

export default function EditItem({ item, supplierOptions }: Props) {
  const [name, setName] = React.useState<string>(item.name);
  const [standardUnit, setStandardUnit] = React.useState<string>(
    item.standardUnit
  );
  const [units, setUnits] = React.useState<ItemUnit[]>(item.units);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitting");
  };
  return (
    <Layout>
      <div className="page">
        <main>
          <h1>Edit {item.name}</h1>

          <form onSubmit={handleSubmit}>
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <button
              disabled={name == item.name}
              onClick={(e) => {
                e.preventDefault();
                fetch(`/api/item`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: item.id,
                    name: name,
                  }),
                });
                Router.reload();
              }}
            >
              Save
            </button>
          </form>
          <h2>Units</h2>
          <Units
            itemId={item.id}
            currentUnits={item.units}
            currentStandardUnit={item.standardUnit}
          />

          <h2>Supplier History</h2>
          <SupplierHistory
            itemId={item.id}
            suppliers={item.suppliers}
            units={units}
            supplierOptions={supplierOptions}
          />
          <button
            onClick={() => {
              fetch(`/api/item`, {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: item.id }),
                method: "DELETE",
              });
              Router.push("/settings");
            }}
          >
            Delete Item
          </button>
        </main>
      </div>
    </Layout>
  );
}
