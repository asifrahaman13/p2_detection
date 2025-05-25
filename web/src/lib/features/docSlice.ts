import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DocumentData, KeyPoint } from "@/types/dashboard/dashboard";

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
    updateKeyPoint(
      state,
      action: PayloadAction<{
        index: number;
        field: keyof KeyPoint;
        value: string;
      }>,
    ) {
      const { index, field, value } = action.payload;
      if (state.data && state.data.key_points[index]) {
        state.data.key_points[index][field] = value;
        console.log("Updated key point:", state.data.key_points[index]);
      }
    },
    addKeyPoint(state) {
      const newPoint = {
        entity: "",
        description: "",
        replaceWith: "",
      };

      if (!state.data) {
        state.data = {
          pdf_name: state.docName,
          key_points: [newPoint],
        };
      } else {
        state.data.key_points.push(newPoint);
      }
    },
    removeKeyPoint(state, action: PayloadAction<number>) {
      const index = action.payload;
      if (state.data && state.data.key_points.length > index) {
        state.data.key_points.splice(index, 1);
        console.log(`Key point at index ${index} removed`);
      }
    },
    setProcessType(state, action: PayloadAction<string>) {
      if (state.data) {
        state.data.process_type = action.payload;
        console.log("Process type set:", state.data.process_type);
      }
    },
  },
});

export const {
  updatePdfName,
  setDocumentData,
  clearDocumentData,
  updateKeyPoint,
  addKeyPoint,
  removeKeyPoint,
  setProcessType,
} = documentSlice.actions;
export default documentSlice.reducer;
