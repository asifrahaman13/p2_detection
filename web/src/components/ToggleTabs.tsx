type Props = {
  active: string;
  onChange: (tab: string) => void;
};

export default function ToggleTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-4">
      {["Outline", "Files"].map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`text-xl px-2 border-b-2 ${
            active === tab
              ? "border-sideBarBorder font-medium text-buttonTextColor"
              : "border-transparent text-buttonTextColor"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
