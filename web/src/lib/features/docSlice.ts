import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DocumentData } from "@/types/dashboard/dashboard";

interface DocumentState {
  data: DocumentData | null;
  docName: string;
}

const initialState: DocumentState = {
  data: null,
  docName: "",
};

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    updatePdfName(state, action: PayloadAction<string>) {
      state.docName = action.payload;
      console.log("docName updated:", state.docName);
    },
    setDocumentData(state, action: PayloadAction<DocumentData>) {
      state.data = action.payload;
      console.log(state.data);
    },
    clearDocumentData(state) {
      state.data = null;
    },
  },
});

export const { updatePdfName, setDocumentData, clearDocumentData } =
  documentSlice.actions;
export default documentSlice.reducer;
