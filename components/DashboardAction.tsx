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
        width: "200px",
        height: "200px",
        borderRadius: "5px",
      }}
    >
      <h3 style={{ textAlign: "center" }}>{action}</h3>
    </button>
  );
}
