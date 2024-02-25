import React from "react";

type Props = {
  children: React.ReactNode;
  confirm?: boolean;
  onClick?: () => void;
};

export default function DeleteButton({
  children,
  confirm = true,
  onClick = () => {},
}: Props) {
  const handleClick = () => {
    if (confirm) {
      if (window.confirm("Are you sure?")) {
        onClick();
      }
    } else {
      onClick();
    }
  };

  return (
    <div>
      <button onClick={handleClick} className="bg-red-700 hover:bg-red-900">
        {children}
      </button>
    </div>
  );
}
