import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchFinanceData = createAsyncThunk('finance/fetchData', async () => {
    const [resSpending, resInvesting, resCategories, resSummary] = await Promise.all([
        api.get('/spending'),
        api.get('/investments'),
        api.get('/categories'),
        api.get('/summary')
    ]);

    return {
        spending: resSpending.data,
        investments: resInvesting.data,
        categories: resCategories.data,
        summary: resSummary.data
    };
});

const financeSlice = createSlice({
    name: 'finance',
    initialState: {
        spending: [],
        investments: [],
        categories: [],
        summary: null,
        loading: true,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFinanceData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFinanceData.fulfilled, (state, action) => {
                state.loading = false;
                state.spending = action.payload.spending;
                state.investments = action.payload.investments;
                state.categories = action.payload.categories;
                state.summary = action.payload.summary;
            })
            .addCase(fetchFinanceData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default financeSlice.reducer;
