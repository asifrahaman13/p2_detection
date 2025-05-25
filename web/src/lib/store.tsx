/* eslint-disable @typescript-eslint/no-unused-vars */
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import docSlice from "./features/docSlice";
import logSlice from "./features/logSlice";

export default configureStore({
  reducer: {
    docSlice: docSlice,
    logSlice: logSlice,
  },
});

const rootReducer = combineReducers({
  docSlice: docSlice,
  logSlice: logSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
