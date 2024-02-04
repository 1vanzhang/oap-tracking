import React from "react";
import Layout from "../../../components/Layout";
import { GetServerSideProps } from "next";
import prisma from "../../../lib/prisma";
import Router from "next/router";
type ItemUnit = {
  id: string;
  name: string;
  ratioToStandard: number;
  itemId: string;
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const items = await prisma.item.findMany({
    include: {
      units: true,
    },
  });
  return {
    props: { items },
  };
};
type Props = {
  items: Item[];
};

type Item = {
  id: string;
  name: string;
  standardUnit: string;
  createdAt: Date;
  updatedAt: Date;
  units: ItemUnit[];
};
type ProductItem = {
  itemId: string;
  quantity: number;
  unitId: string;
};
type ProductComponent = {
  options: ProductItem[];
};

export default function CreateProduct({ items }: Props) {
  const [name, setName] = React.useState("");
  const [sellPrice, setSellPrice] = React.useState<number | "">("");
  const [components, setComponents] = React.useState<ProductComponent[]>([]);
  const addComponent = (e) => {
    e.preventDefault();
    setComponents([
      ...components,
      {
        options: [
          {
            itemId: "",
            quantity: 1,
            unitId: "",
          },
        ],
      },
    ]);
  };

  const handleCreate = async () => {
    try {
      const body = { name, sellPrice, components };
      await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      Router.push("/settings");
    } catch (error) {
      console.error(error);
    }
  };

  const addOption = (componentIndex: number) => {
    const newComponents = [...components];
    newComponents[componentIndex].options.push({
      itemId: "",
      quantity: 1,
      unitId: "",
    });
    setComponents(newComponents);
  };
  return (
    <Layout>
      <div className="page">
        <main>
          <h1>Create Product</h1>
          <form>
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Sell Price ($)
              <input
                type="number"
                value={sellPrice}
                onChange={(e) =>
                  setSellPrice(
                    e.target.value.length > 0 ? parseFloat(e.target.value) : ""
                  )
                }
              />
            </label>
            <h2>Components</h2>
            <button onClick={addComponent}>Add Component</button>
            {components.map((component, componentIndex) => (
              <div key={componentIndex}>
                <h3>Component {componentIndex + 1}</h3>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addOption(componentIndex);
                  }}
                >
                  Add Option
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const newComponents = [...components].filter(
                      (_, i) => i !== componentIndex
                    );
                    setComponents(newComponents);
                  }}
                >
                  Remove Component
                </button>
                {component.options.map((option, optionIndex) => (
                  <div key={optionIndex}>
                    <label>
                      Item
                      <select
                        value={option.itemId}
                        onChange={(e) => {
                          const newComponents = [...components];
                          newComponents[componentIndex].options[
                            optionIndex
                          ].itemId = e.target.value;
                          newComponents[componentIndex].options[
                            optionIndex
                          ].unitId = "";
                          setComponents(newComponents);
                        }}
                      >
                        <option value="">Select an Item</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    {option.itemId && (
                      <div>
                        <label>
                          Quantity
                          <input
                            type="number"
                            value={option.quantity}
                            onChange={(e) => {
                              const newComponents = [...components];
                              newComponents[componentIndex].options[
                                optionIndex
                              ].quantity = parseFloat(e.target.value);
                              setComponents(newComponents);
                            }}
                          />
                        </label>
                        <label>
                          Unit
                          <select
                            value={option.unitId}
                            onChange={(e) => {
                              const newComponents = [...components];
                              newComponents[componentIndex].options[
                                optionIndex
                              ].unitId = e.target.value;
                              setComponents(newComponents);
                            }}
                          >
                            <option value="">
                              {
                                items.find((item) => item.id === option.itemId)
                                  .standardUnit
                              }
                            </option>
                            {items
                              .find((item) => item.id === option.itemId)
                              .units.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                  {unit.name}
                                </option>
                              ))}
                          </select>
                        </label>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const newComponents = [...components];
                        newComponents[componentIndex].options = newComponents[
                          componentIndex
                        ].options.filter((_, i) => i !== optionIndex);
                        setComponents(newComponents);
                      }}
                    >
                      Remove Option
                    </button>
                  </div>
                ))}
              </div>
            ))}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleCreate();
              }}
            >
              Create
            </button>
          </form>
        </main>
      </div>
    </Layout>
  );
}
