import React from "react";
import Router from "next/router";

type Props = {
  action: string;
  href: string;
};

export default function DashboardAction({ action, href }: Props) {
  return (
    <button
      onClick={() => {
        Router.push(href);
      }}
      style={{
        display: "grid",
        placeItems: "center",
        backgroundColor: "white",
        width: "150px",
        maxWidth: "40vw",
        aspectRatio: "1/1",
        borderRadius: "5px",
      }}
    >
      <h3 style={{ textAlign: "center" }}>{action}</h3>
    </button>
  );
}
