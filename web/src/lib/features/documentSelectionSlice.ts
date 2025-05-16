import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state with pdfName, documents, and selectedDocument
export interface PdfSelectionState {
  documents: string[]; // Change to an array to hold multiple documents
  selectedDocument: string | null; // Nullable to indicate no selection
}

const initialState: PdfSelectionState = {
  documents: [], // Initially no documents are available
  selectedDocument: null, // Initially no document is selected
};

export const documentSelectionSlice = createSlice({
  name: "pdfSelection",
  initialState,
  reducers: {
    // Reducer for adding a document to the list
    ADD_DOCUMENT: (state, action: PayloadAction<string>) => {
      state.documents.push(action.payload);
      console.log(state.documents);
    },
    // Reducer for setting documents (multiple selections)
    SET_ALL_DOCUMENTS: (state, action: PayloadAction<string[]>) => {
      state.documents = action.payload; // Expecting an array of document names
      console.log(state.documents);
    },
    // Reducer for selecting a document
    SELECT_DOCUMENT: (state, action: PayloadAction<string | null>) => {
      state.selectedDocument = action.payload; // Allow null for deselecting
      console.log(state.selectedDocument);
    },
  },
});

// Export actions
export const { ADD_DOCUMENT, SET_ALL_DOCUMENTS, SELECT_DOCUMENT } =
  documentSelectionSlice.actions;

// Export reducer
export default documentSelectionSlice.reducer;
