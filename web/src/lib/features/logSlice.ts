import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ProgressMessage = {
  status: string;
  timestamp: number;
};

interface ProgressState {
  logs: ProgressMessage[];
  pageNum: number;
}

const initialState: ProgressState = {
  logs: [],
  pageNum: 1,
};

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    setLogs(state, action: PayloadAction<ProgressMessage[]>) {
      state.logs = action.payload;
    },
    addLog(state, action: PayloadAction<ProgressMessage>) {
      state.logs.push(action.payload);
    },
    clearLogs(state) {
      state.logs = [];
    },
    setPageNum(state, action: PayloadAction<number>) {
      state.pageNum = action.payload;
    },
    incrementPageNum(state) {
      state.pageNum += 1;
    },
    decrementPageNum(state) {
      state.pageNum = Math.max(1, state.pageNum - 1);
    },
  },
});

export const {
  setLogs,
  addLog,
  clearLogs,
  setPageNum,
  incrementPageNum,
  decrementPageNum,
} = progressSlice.actions;

export default progressSlice.reducer;
