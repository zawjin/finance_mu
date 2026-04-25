import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchFinanceData = createAsyncThunk('finance/fetchData', async () => {
    const [resSpending, resInvesting, resCategories, resAssetClasses, resSummary, resDebt, resReserves, resYearly, resLending, resQuote] = await Promise.all([
        api.get('/spending'),
        api.get('/investments'),
        api.get('/categories'),
        api.get('/asset_classes').catch(() => ({ data: [] })),
        api.get('/summary'),
        api.get('/debt').catch(() => ({ data: [] })),
        api.get('/reserves').catch(() => ({ data: [] })),
        api.get('/yearly-expenses').catch(() => ({ data: [] })),
        api.get('/private-lending').catch(() => ({ data: [] })),
        api.get('/daily-quote').catch(() => ({ data: null }))
    ]);

    return {
        spending: resSpending.data,
        investments: resInvesting.data,
        categories: resCategories.data,
        assetClasses: resAssetClasses.data,
        summary: resSummary.data,
        debt: resDebt.data,
        reserves: resReserves.data,
        yearlyExpenses: resYearly.data,
        privateLending: resLending.data,
        dailyQuote: resQuote.data
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
        reserves: [],
        yearlyExpenses: [],
        privateLending: [],
        dailyQuote: null,
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
                state.reserves = action.payload.reserves;
                state.yearlyExpenses = action.payload.yearlyExpenses;
                state.privateLending = action.payload.privateLending;
                state.dailyQuote = action.payload.dailyQuote;
            })
            .addCase(fetchFinanceData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default financeSlice.reducer;
