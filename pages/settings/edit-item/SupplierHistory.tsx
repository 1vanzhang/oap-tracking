import React from "react";
import { ItemSupplier, ItemUnit } from "./[id]";
import { Supplier } from "../SuppliersTable";
import moment from "moment";
import Router from "next/router";

type Props = {
  supplierOptions: Supplier[];
  suppliers: ItemSupplier[];
  units: ItemUnit[];
  itemId: string;
};

export default function SupplierHistory({
  supplierOptions,
  suppliers,
  units,
  itemId,
}: Props) {
  const [selectedSupplier, setSelectedSupplier] =
    React.useState<Supplier | null>(supplierOptions[0] || null);
  const [date, setDate] = React.useState<string>(moment().format("YYYY-MM-DD"));
  const [pricePerUnit, setPricePerUnit] = React.useState<number | "">("");
  const [selectedUnit, setSelectedUnit] = React.useState<ItemUnit | null>(
    units[0] || null
  );

  const addSupplier = async () => {
    console.log(selectedSupplier, date, pricePerUnit, selectedUnit);
    if (selectedSupplier && date && pricePerUnit && selectedUnit) {
      await fetch(`/api/item/supplierHistory`, {
        method: "POST",
        body: JSON.stringify({
          itemId: itemId,
          date: new Date(date),
          pricePerUnit,
          suppliedUnitId: selectedUnit.id,
          supplierName: selectedSupplier.name,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      Router.reload();
    }
  };
  return (
    <div>
      <p>*Active supplier is whichever has the most recent date</p>
      <select
        value={selectedSupplier?.name || ""}
        onChange={(e) => {
          const selected = supplierOptions.find(
            (supplier) => supplier.name === e.target.value
          );
          setSelectedSupplier(selected || null);
        }}
      >
        {supplierOptions.map((supplier) => {
          return <option key={supplier.name}>{supplier.name}</option>;
        })}
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price Per Unit"
        value={pricePerUnit}
        onChange={(e) =>
          setPricePerUnit(
            e.target.value.length > 0 ? parseFloat(e.target.value) : ""
          )
        }
      />
      <select
        value={selectedUnit?.name || ""}
        onChange={(e) => {
          const selected = units.find((unit) => unit.name === e.target.value);
          setSelectedUnit(selected || null);
        }}
      >
        {units.map((unit) => {
          return <option key={unit.id}>{unit.name}</option>;
        })}
      </select>

      <button
        onClick={() => {
          addSupplier();
        }}
      >
        Add Supplier
      </button>
      <table>
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Price Per Unit</th>
            <th>Date</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td>{supplier.supplierName}</td>
              <td>
                ${supplier.pricePerUnit}/{supplier.suppliedUnit.name}
              </td>
              <td>{moment(supplier.date).format("YYYY-MM-DD")}</td>
              <td>
                <button
                  onClick={async () => {
                    await fetch(`/api/item/supplierHistory`, {
                      method: "DELETE",
                      body: JSON.stringify({
                        id: supplier.id,
                      }),
                      headers: {
                        "Content-Type": "application/json",
                      },
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
    </div>
  );
}
