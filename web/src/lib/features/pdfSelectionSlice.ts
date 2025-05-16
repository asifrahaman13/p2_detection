import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state with both pdfName and documents
export interface PdfSelectionState {
  pdfName: string;
  document: string;
}

const initialState: PdfSelectionState = {
  pdfName: "", // Initially no pdf is selected
  document: "", // Initially no documents are selected
};

export const pdfSelectionSlice = createSlice({
  name: "pdfSelection",
  initialState,
  reducers: {
    // Reducer for setting pdfName (single selection)
    SET_PDF_NAME: (state, action: PayloadAction<string>) => {
      state.pdfName = action.payload;
      console.log(state.pdfName);
    },
    // Reducer for setting documents (multiple selections)
    SET_DOCUMENTS: (state, action: PayloadAction<string>) => {
      state.document = action.payload;
      console.log(state.document);
    },
  },
});

export const { SET_PDF_NAME, SET_DOCUMENTS } = pdfSelectionSlice.actions;

export default pdfSelectionSlice.reducer;
