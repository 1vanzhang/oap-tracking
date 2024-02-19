import { ItemUnit } from "@prisma/client";
import React from "react";

type Props = {
  itemOptions: Item[];
  selectedItemId: string;
  quantity: number;
  selectedUnitId: string;
  setSelectedItemId: (id: string) => void;
  setQuantity: (quantity: number) => void;
  setSelectedUnitId: (id: string) => void;
};

type Item = {
  id: string;
  name: string;
  standardUnit: string;
  units: ItemUnit[];
};

export default function ItemAndQuantitySelector({
  itemOptions,
  selectedItemId,
  selectedUnitId,
  quantity,
  setSelectedItemId,
  setQuantity,
  setSelectedUnitId,
}: Props) {
  return (
    <div className="flex gap-0.5 py-1">
      <select
        className="h-8 rounded"
        value={selectedItemId}
        onChange={(e) => setSelectedItemId(e.target.value)}
      >
        <option value="" disabled>
          Select Item
        </option>
        {itemOptions.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <input
        className="h-8 m-0 max-w-20"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value))}
      />

      <select
        className="h-8 min-w-14 rounded"
        value={selectedUnitId}
        onChange={(e) => setSelectedUnitId(e.target.value)}
      >
        <option value="">
          {itemOptions.find((item) => item.id === selectedItemId)?.standardUnit}
        </option>
        {itemOptions
          .find((item) => item.id === selectedItemId)
          ?.units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
      </select>
    </div>
  );
}
