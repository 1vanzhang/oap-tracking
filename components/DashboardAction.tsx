import React from "react";
import Router from "next/router";

type Props = {
  action: string;
  href: string;
  icon?: React.ReactNode;
};

export default function DashboardAction({ action, href, icon }: Props) {
  return (
    <button
      onClick={() => {
        Router.push(href);
      }}
      className="grid place-items-center w-150 max-w-40vw aspect-w-1 aspect-h-1 rounded-5 p-3"
    >
      <div className="flex flex-col gap-1 items-center">
        <h3 className="text-center p-0 m-0">{action}</h3>
        {icon && icon}
      </div>
    </button>
  );
}
