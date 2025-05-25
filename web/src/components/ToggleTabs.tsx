import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  docName?: string;
};

export default function ToggleTabs({ docName }: Props) {
  const pathname = usePathname();
  const currLink = pathname.split("/").at(-1);
  return (
    <div className="flex gap-4">
      {["outline", "result", "logs"].map((tab) => (
        <Link
          href={`/dashboard/cases/${docName}/${tab}`}
          key={tab}
          className={`text-lg px-2 border-b-2 ${
            tab === currLink
              ? "border-sideBarBorder  font-semibold text-buttonTextColor"
              : " text-buttonTextColor"
          }`}
        >
          {tab}
        </Link>
      ))}
    </div>
  );
}
