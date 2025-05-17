"use client";
/* eslint-disable @next/next/no-img-element */
import React, { Fragment, useReducer } from "react";
import { useRouter } from "next/navigation";
import { sidebarButtons } from "@/constants/dashboard";
import ActionButton from "../../components/ui/ActionableButtons";
import { usePathname } from "next/navigation";

function changeSidebar(
  state: typeof sidebarButtons,
  action: { type: string; title?: string },
) {
  if (action.type === "changeSidebar") {
    const updatedSidebars = state.map((sidebar) => ({
      ...sidebar,
      selected: sidebar.router === action?.title,
    }));
    return updatedSidebars;
  }
  console.log(state);
  return state;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(changeSidebar, sidebarButtons);
  const router = useRouter();

  const pathname = usePathname();

  React.useEffect(() => {
    const title = pathname.split("/")[2];
    dispatch({ type: "changeSidebar", title });
  }, [pathname]);

  const handleSidebarClick = (title: string) => {
    dispatch({ type: "changeSidebar", title });
    router.push(`/dashboard/${title}`);
  };

  function capitalize(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  return (
    <Fragment>
      <div className="w-screen h-screen flex flex-row overflow-y-scroll">
        <div className="w-[15%] flex flex-col h-full border-2 border-gray-200">
          <div className="bg-white  h-1/5 flex items-center justify-center">
            <img
              src="/assets/dashboard/jarvis.svg"
              alt=""
              className="h-1/2 w-1/2"
            />
          </div>
          <div className="bg-sideBarGradient flex-grow flex flex-col items-center">
            {state?.map((sidebar, index) => (
              <button
                key={index}
                onClick={() => handleSidebarClick(sidebar.router)}
                className={`${
                  sidebar.selected ? "bg-selectedButton" : ""
                } py-6 w-full text-white`}
              >
                <div className="flex justify-center items-center">
                  <div className="flex flex-col justify-center items-center">
                    {sidebar.router === "help-and-feedback" ? (
                      <img
                        src={sidebar.icon}
                        alt={sidebar.title}
                        className="h-10 w-10"
                      />
                    ) : (
                      <img
                        src={sidebar.icon}
                        alt={sidebar.title}
                        className="h-12 w-12"
                      />
                    )}

                    <div className={`${sidebar.selected ? "" : "text-white"}`}>
                      {capitalize(sidebar.title)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="w-[85%] bg-gray-100 shadow-xl h-full overflow-y-scroll">
          <div className="h-16 gap-2 flex shadow-xl flex-row justify-between items-center px-4">
            <div className=" w-1/2">
              <input
                type="text"
                placeholder="Search by name, contact, or claim number"
                value=""
                className="border p-2 rounded w-full"
              />
            </div>
            <ActionButton
              imgSrc="/assets/dashboard/Profile.svg"
              label="Annie Adjuster"
            />
          </div>
          <div className="flex w-full  h-full bg-gray-100">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}
