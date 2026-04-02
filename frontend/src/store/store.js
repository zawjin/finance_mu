import { configureStore } from '@reduxjs/toolkit';
import financeReducer from './financeSlice';

const store = configureStore({
    reducer: {
        finance: financeReducer
    }
});

export default store;
