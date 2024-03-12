import React from "react";

type Props = {
  children: React.ReactNode;
  confirm?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export default function DeleteButton({
  children,
  disabled = false,
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
      <button
        onClick={handleClick}
        className="bg-red-700 hover:bg-red-900 disabled:bg-gray-400"
        disabled={disabled}
      >
        {children}
      </button>
    </div>
  );
}
