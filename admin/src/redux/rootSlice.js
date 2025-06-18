import { createSlice } from "@reduxjs/toolkit";

const rootSlice = createSlice({
  name: "root",
  initialState: {
    loading: true,
    applications: [],
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setApplications: (state, action) => {
      state.applications = action.payload;
    },
  },
});

export const { setLoading, setApplications } = rootSlice.actions;
export default rootSlice.reducer;
