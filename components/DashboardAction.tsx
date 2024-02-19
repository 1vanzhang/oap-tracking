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
      className="grid place-items-center w-150 max-w-40vw aspect-w-1 aspect-h-1 rounded-5"
    >
      <h3 style={{ textAlign: "center" }}>{action}</h3>
    </button>
  );
}
