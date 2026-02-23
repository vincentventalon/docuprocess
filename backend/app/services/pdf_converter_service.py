"""PDF to Markdown conversion service using pymupdf4llm"""

import base64
import io
import ipaddress
import logging
import socket
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlparse

import httpx
import pymupdf4llm

logger = logging.getLogger(__name__)

# Maximum PDF file size (10MB)
MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024

# Timeout for fetching PDFs
FETCH_TIMEOUT_SECONDS = 30


@dataclass
class ConversionResult:
    """Result of a PDF to Markdown conversion"""
    success: bool
    markdown: str = ""
    page_count: int = 0
    error: Optional[str] = None
    error_code: Optional[str] = None


class PdfConverterService:
    """Service for converting PDFs to Markdown"""

    def _is_private_ip(self, hostname: str) -> bool:
        """
        Check if a hostname resolves to a private IP (SSRF protection).

        Blocks:
        - Private IP ranges (10.x, 172.16-31.x, 192.168.x)
        - Loopback addresses (127.x)
        - Link-local addresses (169.254.x)
        - Reserved addresses
        """
        try:
            # Resolve hostname to IP
            ip_str = socket.gethostbyname(hostname)
            ip = ipaddress.ip_address(ip_str)

            # Check if IP is private, loopback, link-local, or reserved
            return (
                ip.is_private or
                ip.is_loopback or
                ip.is_link_local or
                ip.is_reserved or
                ip.is_multicast
            )
        except (socket.gaierror, ValueError):
            # If we can't resolve, block it
            return True

    def _validate_url(self, url: str) -> tuple[bool, Optional[str], Optional[str]]:
        """
        Validate URL for safety and correctness.

        Returns:
            Tuple of (is_valid, error_message, error_code)
        """
        try:
            parsed = urlparse(url)

            # Must be HTTPS
            if parsed.scheme != "https":
                return False, "URL must use HTTPS", "INVALID_URL"

            # Must have a hostname
            if not parsed.hostname:
                return False, "Invalid URL format", "INVALID_URL"

            # Check for SSRF - private IPs
            if self._is_private_ip(parsed.hostname):
                return False, "URL points to a private or reserved address", "SSRF_BLOCKED"

            return True, None, None

        except Exception as e:
            logger.warning(f"URL validation error: {e}")
            return False, "Invalid URL format", "INVALID_URL"

    async def fetch_pdf_from_url(self, url: str) -> tuple[Optional[bytes], Optional[str], Optional[str]]:
        """
        Fetch PDF content from a URL.

        Returns:
            Tuple of (pdf_bytes, error_message, error_code)
        """
        # Validate URL first
        is_valid, error_msg, error_code = self._validate_url(url)
        if not is_valid:
            return None, error_msg, error_code

        try:
            async with httpx.AsyncClient(
                timeout=FETCH_TIMEOUT_SECONDS,
                follow_redirects=True,
                max_redirects=5
            ) as client:
                response = await client.get(url)
                response.raise_for_status()

                # Check content length
                content_length = response.headers.get("content-length")
                if content_length and int(content_length) > MAX_PDF_SIZE_BYTES:
                    return None, f"PDF exceeds maximum size of {MAX_PDF_SIZE_BYTES // (1024*1024)}MB", "FILE_TOO_LARGE"

                pdf_bytes = response.content

                # Double-check actual size
                if len(pdf_bytes) > MAX_PDF_SIZE_BYTES:
                    return None, f"PDF exceeds maximum size of {MAX_PDF_SIZE_BYTES // (1024*1024)}MB", "FILE_TOO_LARGE"

                # Basic PDF validation - check magic bytes
                if not pdf_bytes.startswith(b"%PDF"):
                    return None, "URL does not point to a valid PDF file", "INVALID_PDF"

                return pdf_bytes, None, None

        except httpx.TimeoutException:
            return None, "Timeout fetching PDF from URL", "URL_FETCH_TIMEOUT"
        except httpx.HTTPStatusError as e:
            return None, f"HTTP error {e.response.status_code} fetching PDF", "URL_FETCH_FAILED"
        except Exception as e:
            logger.error(f"Error fetching PDF from URL: {e}")
            return None, "Failed to fetch PDF from URL", "URL_FETCH_FAILED"

    def decode_base64_pdf(self, pdf_base64: str) -> tuple[Optional[bytes], Optional[str], Optional[str]]:
        """
        Decode base64-encoded PDF.

        Returns:
            Tuple of (pdf_bytes, error_message, error_code)
        """
        try:
            # Handle data URL format
            if pdf_base64.startswith("data:"):
                # Extract base64 part from data URL
                if ";base64," in pdf_base64:
                    pdf_base64 = pdf_base64.split(";base64,")[1]
                else:
                    return None, "Invalid data URL format", "INVALID_BASE64"

            pdf_bytes = base64.b64decode(pdf_base64)

            # Check size
            if len(pdf_bytes) > MAX_PDF_SIZE_BYTES:
                return None, f"PDF exceeds maximum size of {MAX_PDF_SIZE_BYTES // (1024*1024)}MB", "FILE_TOO_LARGE"

            # Validate PDF magic bytes
            if not pdf_bytes.startswith(b"%PDF"):
                return None, "Invalid PDF data", "INVALID_PDF"

            return pdf_bytes, None, None

        except Exception as e:
            logger.error(f"Error decoding base64 PDF: {e}")
            return None, "Invalid base64-encoded PDF", "INVALID_BASE64"

    def convert_pdf_to_markdown(self, pdf_bytes: bytes) -> ConversionResult:
        """
        Convert PDF bytes to Markdown using pymupdf4llm.

        Args:
            pdf_bytes: Raw PDF file bytes

        Returns:
            ConversionResult with markdown content and metadata
        """
        import tempfile
        import os

        temp_path = None
        try:
            # Write bytes to temporary file (pymupdf4llm requires file path)
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
                f.write(pdf_bytes)
                temp_path = f.name

            # Use pymupdf4llm to convert PDF to markdown
            # This extracts text while preserving structure, tables, and formatting
            markdown = pymupdf4llm.to_markdown(temp_path)

            # Get page count using fitz (PyMuPDF)
            import fitz
            doc = fitz.open(temp_path)
            page_count = doc.page_count
            doc.close()

            return ConversionResult(
                success=True,
                markdown=markdown,
                page_count=page_count
            )

        except Exception as e:
            logger.error(f"Error converting PDF to markdown: {e}")
            return ConversionResult(
                success=False,
                error=f"Failed to convert PDF: {str(e)}",
                error_code="CONVERSION_FAILED"
            )
        finally:
            # Clean up temp file
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except Exception:
                    pass

    async def convert(
        self,
        url: Optional[str] = None,
        pdf_base64: Optional[str] = None
    ) -> ConversionResult:
        """
        Main conversion method - handles both URL and base64 input.

        Args:
            url: URL to fetch PDF from (HTTPS only)
            pdf_base64: Base64-encoded PDF content

        Returns:
            ConversionResult with markdown content or error
        """
        pdf_bytes: Optional[bytes] = None

        if url:
            pdf_bytes, error, error_code = await self.fetch_pdf_from_url(url)
            if error:
                return ConversionResult(
                    success=False,
                    error=error,
                    error_code=error_code
                )
        elif pdf_base64:
            pdf_bytes, error, error_code = self.decode_base64_pdf(pdf_base64)
            if error:
                return ConversionResult(
                    success=False,
                    error=error,
                    error_code=error_code
                )
        else:
            return ConversionResult(
                success=False,
                error="Must provide either 'url' or 'pdf_base64'",
                error_code="INVALID_REQUEST"
            )

        # Convert PDF to markdown
        return self.convert_pdf_to_markdown(pdf_bytes)


# Singleton instance
pdf_converter_service = PdfConverterService()
