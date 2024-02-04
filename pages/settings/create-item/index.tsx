import React from "react";
import Layout from "../../../components/Layout";
import { GetStaticProps } from "next";
import prisma from "../../../lib/prisma";
import Router from "next/router";

type Supplier = {
  name: string;
};

type Props = {};
type ItemUnit = {
  name: string;
  ratioToStandard: number;
};

export default function CreateItem(props: Props) {
  const [name, setName] = React.useState<string>("");
  const [standardUnit, setStandardUnit] = React.useState<string>("");
  const [units, setUnits] = React.useState<ItemUnit[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const body = { name, standardUnit, units };
      await fetch("/api/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      Router.push("/settings");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="page">
        <main>
          <h1>Create Item</h1>

          <form onSubmit={handleSubmit}>
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Standard Unit
              <input
                type="text"
                value={standardUnit}
                onChange={(e) => setStandardUnit(e.target.value)}
              />
            </label>
            <button
              onClick={(e) => {
                e.preventDefault();
                setUnits([...units, { name: "", ratioToStandard: 1 }]);
              }}
            >
              Add Unit
            </button>
            <label>
              Units
              {units.map((unit, index) => (
                <div key={index}>
                  <input
                    type="text"
                    value={unit.name}
                    placeholder="Name"
                    onChange={(e) => {
                      const newUnits = [...units];
                      newUnits[index].name = e.target.value;
                      setUnits(newUnits);
                    }}
                  />

                  <input
                    placeholder="Ratio to Standard"
                    type="number"
                    value={unit.ratioToStandard}
                    onChange={(e) => {
                      const newUnits = [...units];
                      newUnits[index].ratioToStandard = parseFloat(
                        e.target.value
                      );
                      setUnits(newUnits);
                    }}
                  />
                </div>
              ))}
            </label>

            <button>Create</button>
          </form>
        </main>
      </div>
    </Layout>
  );
}
