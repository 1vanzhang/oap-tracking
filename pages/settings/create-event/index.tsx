import React from "react";
import Layout from "../../../components/Layout";
import Router from "next/router";

type Props = {};

export default function CreateEvent({}: Props) {
  const [name, setName] = React.useState("");
  const [capacity, setCapacity] = React.useState<"" | number>("");
  const [dates, setDates] = React.useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const body = { name, capacity, dates };
      await fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await Router.push("/settings");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Layout>
      <div className="page">
        <main>
          <h1>Create Event</h1>
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
              Capacity
              <input
                type="number"
                value={capacity}
                onChange={(e) =>
                  setCapacity(
                    e.target.value.length > 0 ? parseInt(e.target.value) : ""
                  )
                }
              />
            </label>
            <button
              onClick={(e) => {
                e.preventDefault();
                setDates([...dates, ""]);
              }}
            >
              Add Date
            </button>

            <label>
              Dates
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
                          const newDates = [...dates].filter(
                            (_, i) => i !== index
                          );
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
            <button>Create Event</button>
          </form>
        </main>
      </div>
    </Layout>
  );
}
