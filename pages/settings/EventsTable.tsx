import React from "react";
import { GetStaticProps } from "next";
import prisma from "../../lib/prisma";
import Router from "next/router";
import moment from "moment";
import { Event } from "@prisma/client";

type Props = { events: Event[] };

function compareEvents(a: Event, b: Event) {
  if (a.dates.length == 0) {
    return 1;
  }
  if (b.dates.length == 0) {
    return -1;
  }
  return new Date(b.dates[0]).getTime() - new Date(a.dates[0]).getTime();
}

const EventsTable: React.FC<Props> = (props) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Capacity</th>
          <th>Dates</th>
          <th>Edit</th>
        </tr>
      </thead>
      <tbody>
        {props.events?.sort(compareEvents).map((event) => {
          const dates = event.dates
            .sort()
            .filter((_, i) => i == 0 || i == event.dates.length - 1)
            .map((date, i) =>
              i == event.dates.length - 1
                ? moment(date).format("MMM Do YYYY")
                : moment(date).format("MMM Do")
            )
            .join(" to ");

          return (
            <tr key={event.name}>
              <td>{event.name}</td>
              <td>{event.capacity}</td>
              <td>{dates}</td>
              <td>
                <button
                  onClick={() => {
                    Router.push(`/settings/edit-event/${event.name}`);
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default EventsTable;
