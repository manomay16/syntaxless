# Python Execution Setup Guide

This guide explains how Python code execution works in both development and production environments.

## How It Works

The app automatically detects whether you're running in development or production and routes code execution accordingly:

- **Development**: Uses local Python server at `http://localhost:3001`
- **Production (Vercel)**: Uses Vercel Python serverless function

## Automatic Detection

The system automatically detects the environment:
- If `process.env.VERCEL === '1'` → Uses Vercel serverless function
- Otherwise → Uses local Python server

## Manual Override (For Testing)

You can force a specific mode using environment variables:

### Force Local Mode (Even on Vercel)

Add to your `.env.local` or Vercel environment variables:
```
PYTHON_EXECUTION_MODE=local
```

### Force Vercel Mode (Even in Development)

Add to your `.env.local`:
```
PYTHON_EXECUTION_MODE=vercel
```

### Custom Local Server URL

If your local Python server runs on a different port:
```
PYTHON_SERVER_URL=http://localhost:3002/api/run
```

## Development Setup

1. **Start the local Python server:**
   ```bash
   cd api
   python run.py
   ```

2. **The server will start on port 3001** (or the port specified in `PORT` env var)

3. **Start Next.js:**
   ```bash
   npm run dev
   ```

4. **Code execution will automatically use the local server**

## Production Setup (Vercel)

1. **No additional setup needed!** The `vercel.json` configuration automatically routes `/api/run` to the Python serverless function.

2. **The Python function is deployed automatically** when you push to Vercel.

## Testing Both Environments

### Test Local Execution
1. Make sure `PYTHON_EXECUTION_MODE` is not set (or set to `local`)
2. Start local Python server: `cd api && python run.py`
3. Run code in the IDE - it will use the local server

### Test Vercel Execution (Locally)
1. Set `PYTHON_EXECUTION_MODE=vercel` in `.env.local`
2. Make sure you have a Vercel deployment
3. Set `NEXT_PUBLIC_VERCEL_URL=your-app.vercel.app` (optional, for testing production)
4. Run code in the IDE - it will use the Vercel serverless function

### Test in Production
1. Deploy to Vercel
2. Code execution will automatically use the serverless function
3. No environment variables needed (auto-detected)

## Troubleshooting

### "Local Python server is not running"
- **Solution**: Start the local server with `cd api && python run.py`
- The error message will tell you exactly what to do

### Code execution fails in production
- **Check**: Vercel function logs in the dashboard
- **Verify**: `api/run.py` exists and is in the correct format
- **Verify**: `vercel.json` routes `/api/run` correctly

### Want to test production locally
- Set `PYTHON_EXECUTION_MODE=vercel` in `.env.local`
- Make sure you have a Vercel deployment to test against

## Environment Variables Summary

| Variable | Values | Description |
|----------|--------|-------------|
| `PYTHON_EXECUTION_MODE` | `local`, `vercel`, or unset | Force execution mode (unset = auto-detect) |
| `PYTHON_SERVER_URL` | URL string | Custom local server URL (default: `http://localhost:3001/api/run`) |
| `VERCEL` | `1` (set by Vercel) | Auto-detected by Vercel |
| `VERCEL_URL` | URL string | Auto-set by Vercel for preview deployments |
| `NEXT_PUBLIC_VERCEL_URL` | URL string | Your production Vercel URL (optional, for testing) |

## Notes

- The system is smart enough to handle both environments without configuration
- You only need to set environment variables if you want to override the default behavior
- Local development requires the Python server to be running
- Production automatically uses the serverless function

