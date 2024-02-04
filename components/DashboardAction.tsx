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
        width: "100px",
        height: "100px",
        borderRadius: "5px",
      }}
    >
      <div style={{ textAlign: "center" }}>{action}</div>
    </button>
  );
}
