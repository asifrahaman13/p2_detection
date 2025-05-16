import React, { Fragment } from "react";
import { Message } from "@/types/dashboard/dashboard";

const NotSelected = ({ message }: Message) => {
  return (
    <Fragment>
      <div className="flex w-full h-full justify-center items-center">
        {message}
      </div>
    </Fragment>
  );
};

export default NotSelected;
