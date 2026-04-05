import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchFinanceData = createAsyncThunk('finance/fetchData', async () => {
    const [resSpending, resInvesting, resCategories, resAssetClasses, resSummary, resDebt] = await Promise.all([
        api.get('/spending'),
        api.get('/investments'),
        api.get('/categories'),
        api.get('/asset_classes').catch(() => ({ data: [] })),
        api.get('/summary'),
        api.get('/debt').catch(() => ({ data: [] }))
    ]);

    return {
        spending: resSpending.data,
        investments: resInvesting.data,
        categories: resCategories.data,
        assetClasses: resAssetClasses.data,
        summary: resSummary.data,
        debt: resDebt.data
    };
});

const financeSlice = createSlice({
    name: 'finance',
    initialState: {
        spending: [],
        investments: [],
        categories: [],
        assetClasses: [],
        debt: [],
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
                state.assetClasses = action.payload.assetClasses;
                state.summary = action.payload.summary;
                state.debt = action.payload.debt;
            })
            .addCase(fetchFinanceData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default financeSlice.reducer;
