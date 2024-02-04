import React from "react";
import { GetServerSideProps } from "next";
import Router from "next/router";
import prisma from "../../../lib/prisma";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const event = await prisma.event.findUnique({
    where: {
      name: String(params?.name),
    },
  });
  return {
    props: event,
  };
};

type Props = {
  name: string;
  capacity: number;
  dates: string[];
};

export default function EditEvent(props: Props) {
  const [dates, setDates] = React.useState(props.dates);
  const [capacity, setCapacity] = React.useState(props.capacity);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const body = { name: props.name, capacity, dates };
      await fetch("/api/event", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await Router.push("/settings");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Edit {props.name}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="capacity">Capacity</label>
          <input
            id="capacity"
            type="number"
            name="capacity"
            value={capacity}
            onChange={(e) =>
              setCapacity(
                e.target.value.length > 0 ? parseInt(e.target.value) : 0
              )
            }
          />
        </div>
        <label>
          Dates
          <button
            onClick={(e) => {
              e.preventDefault();
              setDates([...dates, ""]);
            }}
          >
            Add Date
          </button>
          <ul>
            {dates.map((date, index) => {
              return (
                <li key={index}>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      const newDates = [...dates];
                      newDates[index] = e.target.value;
                      setDates(newDates);
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const newDates = [...dates].filter((_, i) => i !== index);
                      setDates(newDates);
                    }}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        </label>
        <div>
          <button type="submit">Save</button>
          <button
            onClick={async (e) => {
              e.preventDefault();
              await fetch("/api/event", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: props.name }),
              });
              await Router.push("/settings");
            }}
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
