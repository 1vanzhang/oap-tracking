import React from "react";

type Props = {
  title: string;
  submitText?: string;
  onSubmit: (e: React.SyntheticEvent) => void;
  children: React.ReactNode | React.ReactNode[];
};

export default function Form({
  onSubmit,
  children,
  title,
  submitText = "Submit",
}: Props) {
  return (
    <div className="bg-stone-300 py-2 px-5 rounded w-fit mx-auto mt-2">
      <h1 className="text-center">{title}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
      >
        <div className="flex flex-col gap-2">{children}</div>
        <div className="w-fit mx-auto">
          <button type="submit">{submitText}</button>
        </div>
      </form>
    </div>
  );
}
