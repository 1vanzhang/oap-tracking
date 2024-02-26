import moment from "moment";
import Router from "next/router";
import React from "react";
import Form from "../../../components/Form";
import DateTimePicker from "../../../components/DateTimePicker";

type Props = {};

export default function CapacityForm({}: Props) {
  const [numPeople, setNumPeople] = React.useState<number | "">("");
  const [timestamp, setTimestamp] = React.useState<string>(
    moment().toISOString()
  );
  const [preventingEntry, setPreventingEntry] = React.useState<boolean>(false);

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      //timestamp by date and time
      const body = { numPeople, timestamp, preventingEntry };
      await fetch("/api/capacity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      Router.reload();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Form title="Report Capacity" onSubmit={submitData}>
      <div>
        <input
          autoFocus
          type="number"
          placeholder="# People"
          min={0}
          className="w-32"
          value={numPeople}
          onChange={(e) => {
            setNumPeople(
              e.target.value.length == 0 ? "" : parseInt(e.target.value)
            );
          }}
        />
        <label>
          Preventing Entry
          <input
            type="checkbox"
            onChange={(e) => setPreventingEntry(e.target.checked)}
            checked={preventingEntry}
          />
        </label>
      </div>
      <DateTimePicker timestamp={timestamp} setTimestamp={setTimestamp} />
    </Form>
  );
}
