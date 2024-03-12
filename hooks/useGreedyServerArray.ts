import { useState } from "react";

const useGreedyServerArray = <T>(
  initialArray: T[]
): [
  T[],
  (item: T) => void,
  (index: number) => void,
  (index: number, item: T) => void
] => {
  const [array, setArray] = useState<T[]>(initialArray);
  const addItem = (item: T) => {
    setArray((prevArray) => [item, ...prevArray]);
  };
  const removeItem = (index: number) => {
    setArray((prevArray) => [
      ...prevArray.slice(0, index),
      ...prevArray.slice(index + 1),
    ]);
  };
  const updateItem = (index: number, item: T) => {
    setArray((prevArray) =>
      prevArray.map((i, idx) => (idx === index ? item : i))
    );
  };
  return [array, addItem, removeItem, updateItem];
};

export default useGreedyServerArray;
