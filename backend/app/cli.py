#!/usr/bin/env python3
"""CLI entry points for the application"""
import uvicorn


def start_server():
    """Start the development server"""
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )


if __name__ == "__main__":
    start_server()
