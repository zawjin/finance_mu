import { configureStore } from '@reduxjs/toolkit';
import financeReducer from './financeSlice';
import authReducer from './authSlice';

const store = configureStore({
    reducer: {
        finance: financeReducer,
        auth: authReducer
    }
});

export default store;
