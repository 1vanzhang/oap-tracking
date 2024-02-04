import { GetServerSideProps } from "next";
import React from "react";
import prisma from "../../../lib/prisma";
import Layout from "../../../components/Layout";
import Router from "next/router";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const product = await prisma.product.findUnique({
    where: {
      id: String(params?.id),
    },
    include: {
      components: {
        include: {
          options: {
            include: {
              item: true,
              unit: true,
            },
          },
        },
      },
    },
  });
  const items = await prisma.item.findMany({
    include: {
      units: true,
    },
  });
  return {
    props: { product, items },
  };
};

type ProductOption = {
  id: string;
  itemId: string;
  quantity: number;
  unitId: string;
  item: {
    name: string;
    standardUnit: string;
  };
  unit: {
    name: string;
  };
};

type ProductComponent = {
  id: string;
  productId: string;
  product: string;
  options: ProductOption[];
};

type Product = {
  id: string;
  name: string;
  sellPrice: number;
  components: ProductComponent[];
};

type Item = {
  id: string;
  name: string;
  standardUnit: string;
  units: {
    id: string;
    name: string;
  }[];
};

type Props = {
  product: Product;
  items: Item[];
};

export default function EditProduct({ product, items }: Props) {
  const [name, setName] = React.useState(product.name);
  const [sellPrice, setSellPrice] = React.useState<number | "">(
    product.sellPrice
  );

  const [newItemId, setNewItemId] = React.useState<string>("");
  const [newQuantity, setNewQuantity] = React.useState<number | "">(1);
  const [newUnitId, setNewUnitId] = React.useState<string>("");
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  return (
    <Layout>
      <div>
        <h1>Edit Product</h1>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button
            disabled={product.name == name || name.length == 0}
            onClick={async () => {
              await fetch(`/api/product`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: product.id,
                  name,
                  sellPrice: product.sellPrice,
                }),
              });
              Router.reload();
            }}
          >
            Save Name
          </button>
        </label>
        <label>
          Sell Price
          <input
            type="number"
            value={sellPrice}
            onChange={(e) =>
              setSellPrice(
                e.target.value.length > 0 ? parseFloat(e.target.value) : ""
              )
            }
          />
          <button
            disabled={product.sellPrice == sellPrice || sellPrice === ""}
            onClick={async () => {
              await fetch(`/api/product`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: product.id,
                  name: product.name,
                  sellPrice,
                }),
              });
              Router.reload();
            }}
          >
            Save Sell Price
          </button>
        </label>

        <h2>Components</h2>
        <select
          value={newItemId}
          onChange={(e) => setNewItemId(e.target.value)}
        >
          <option value="" disabled selected>
            Select an Item
          </option>
          {items.map((item) => {
            return (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            );
          })}
        </select>
        <input
          type="number"
          value={newQuantity}
          onChange={(e) =>
            setNewQuantity(
              e.target.value.length > 0 ? parseFloat(e.target.value) : ""
            )
          }
        />
        <select
          value={newUnitId}
          onChange={(e) => setNewUnitId(e.target.value)}
        >
          <option value="" selected>
            {items.find((item) => item.id === newItemId)?.standardUnit}
          </option>
          {items
            .find((item) => item.id === newItemId)
            ?.units.map((unit) => {
              return (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              );
            })}
        </select>
        <select
          value={selectedIndex || ""}
          onChange={(e) =>
            setSelectedIndex(
              e.target.value == "" ? null : parseInt(e.target.value)
            )
          }
        >
          <option value="" selected>
            New Component
          </option>
          {product.components.map((component, index) => (
            <option key={component.id} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
        <button
          onClick={async () => {
            await fetch(`/api/product/component`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: product.id,
                itemId: newItemId,
                quantity: newQuantity,
                unitId: newUnitId,
                componentId: product.components[selectedIndex - 1]?.id || null,
              }),
            });
            Router.reload();
          }}
        >
          Add Item
        </button>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Options</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {product.components.map((component, i) => (
              <tr key={component.id}>
                <td>{i + 1}</td>
                <td>
                  <ul>
                    {component.options.map((option) => (
                      <li key={option.id}>
                        {option.item.name} - {option.quantity}{" "}
                        {option.unit
                          ? option.unit.name
                          : option.item.standardUnit}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <button
                    onClick={async () => {
                      await fetch(`/api/product/component`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: component.id }),
                      });
                      Router.reload();
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={async () => {
            await fetch(`/api/product`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: product.id }),
            });
            Router.push("/settings");
          }}
        >
          Delete Product
        </button>
      </div>
    </Layout>
  );
}
