/* eslint-disable @typescript-eslint/no-unused-vars */
import { combineReducers, configureStore } from "@reduxjs/toolkit";

export default configureStore({
  reducer: {},
});

const rootReducer = combineReducers({});

export type RootState = ReturnType<typeof rootReducer>;
