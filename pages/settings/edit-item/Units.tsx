import React from "react";
import { ItemUnit, ItemSupplier, ProductItem, Prisma } from "@prisma/client";

import Router from "next/router";

type Props = {
  currentUnits: Prisma.ItemUnitGetPayload<{
    include: {
      productItem: true;
      itemSupplier: true;
    };
  }>[];
  currentStandardUnit: string;
  itemId: string;
};

type EditItemUnit = {
  ratioToStandard: number | "";
  name: string;
  id: string;
  itemId: string;
  productItem: ProductItem[];
  itemSupplier: ItemSupplier[];
};

export default function Units({
  currentUnits,
  currentStandardUnit,
  itemId,
}: Props) {
  const [newUnitName, setNewUnitName] = React.useState("");
  const [newUnitRatio, setNewUnitRatio] = React.useState<"" | number>("");
  const [standardUnit, setStandardUnit] = React.useState(currentStandardUnit);
  const [units, setUnits] = React.useState<EditItemUnit[]>(currentUnits ?? []);

  const deleteUnit = async (unitId: string) => {
    fetch(`/api/unit`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: unitId }),
    });
    Router.reload();
  };

  const addUnit = async () => {
    if (newUnitName && newUnitRatio) {
      fetch("/api/unit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratioToStandard: newUnitRatio,
          name: newUnitName,
          itemId,
        }),
      });
      Router.reload();
    }
  };
  return (
    <div>
      <label>
        Standard Unit
        <input
          type="text"
          value={standardUnit}
          onChange={(e) => setStandardUnit(e.target.value)}
        />
        <button
          disabled={currentStandardUnit == standardUnit}
          onClick={() => {
            fetch(`/api/item/standardUnit`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: itemId,
                standardUnit,
              }),
            });
            Router.reload();
          }}
        >
          Save
        </button>
      </label>
      <div>
        <label>
          Existing Units
          {units?.map((unit, index) => (
            <div key={index}>
              <input
                type="text"
                value={unit.name}
                placeholder="Name"
                onChange={(e) => {
                  const newUnits = units.map((unit, i) => ({
                    ...unit,
                    name: i == index ? e.target.value : unit.name,
                  }));
                  setUnits(newUnits);
                }}
              />

              <input
                placeholder="Ratio to Standard"
                type="number"
                value={unit.ratioToStandard}
                onChange={(e) => {
                  const newUnits = units.map((unit, i) => ({
                    ...unit,
                    ratioToStandard:
                      i == index
                        ? e.target.valueAsNumber
                        : unit.ratioToStandard,
                  }));
                  setUnits(newUnits);
                }}
              />

              <button
                disabled={
                  unit.name == currentUnits[index].name &&
                  unit.ratioToStandard == currentUnits[index].ratioToStandard
                }
                onClick={() => {
                  fetch(`/api/unit`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: unit.id,
                      name: unit.name,
                      ratioToStandard: unit.ratioToStandard,
                    }),
                  });
                  Router.reload();
                }}
              >
                Save
              </button>
              <button
                disabled={
                  unit.productItem.length > 0 || unit.itemSupplier.length > 0
                }
                onClick={() => deleteUnit(unit.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </label>
      </div>
      <div>
        <label>
          New Unit
          <input
            type="text"
            placeholder="Name"
            onChange={(e) => setNewUnitName(e.target.value)}
            value={newUnitName}
          />
          <input
            type="number"
            placeholder="Ratio to Standard"
            onChange={(e) =>
              setNewUnitRatio(
                e.target.value.length > 0 ? parseFloat(e.target.value) : ""
              )
            }
            value={newUnitRatio}
          />
          <button
            disabled={newUnitName.length == 0 || newUnitRatio == ""}
            onClick={(e) => {
              addUnit();
            }}
          >
            Add Unit
          </button>
        </label>
      </div>
    </div>
  );
}
