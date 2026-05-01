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
        const token = response.data.access_token;
        localStorage.setItem('token', token);

        // Immediately fetch user so we never get stuck in "token but no user" state
        const meResponse = await api.get('/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { access_token: token, user: meResponse.data };
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
        initialized: !localStorage.getItem('token') // If no token, we are initialized (logged out)
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.initialized = true;
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
                state.user = action.payload.user;    // user is set immediately
                state.initialized = true;             // no loader gap
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
