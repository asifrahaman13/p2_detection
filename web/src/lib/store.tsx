/* eslint-disable @typescript-eslint/no-unused-vars */
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import pdfSelectionReducer from "./features/pdfSelectionSlice";
import documentSelectionReducer from "./features/documentSelectionSlice";

export default configureStore({
  reducer: {
    pdfSelection: pdfSelectionReducer,
    documentSelection: documentSelectionReducer,
  },
});

const rootReducer = combineReducers({
  pdfSelection: pdfSelectionReducer,
  documentSelection: documentSelectionReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
