import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        
        const response = await api.post('/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        localStorage.setItem('token', response.data.access_token);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.detail || 'Login failed');
    }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/me');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.detail || 'Session expired');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem('token'),
        loading: false,
        error: null,
        initialized: false
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access_token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.initialized = true;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.user = null;
                state.token = null;
                state.initialized = true;
                localStorage.removeItem('token');
            });
    }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
