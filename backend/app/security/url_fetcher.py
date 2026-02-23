"""
Secure URL fetcher for WeasyPrint to prevent Local File Inclusion (LFI) and SSRF attacks.

This module provides a secure URL fetcher that:
- Blocks file:// protocol to prevent reading local server files
- Blocks access to private/internal IP addresses (SSRF protection)
- Only allows http://, https://, and data: URLs
"""

import ipaddress
import logging
from urllib.parse import urlparse

from weasyprint import default_url_fetcher

logger = logging.getLogger(__name__)

# Private/internal IP ranges that should be blocked (SSRF protection)
BLOCKED_IP_RANGES = [
    ipaddress.ip_network('10.0.0.0/8'),       # Private Class A
    ipaddress.ip_network('172.16.0.0/12'),    # Private Class B
    ipaddress.ip_network('192.168.0.0/16'),   # Private Class C
    ipaddress.ip_network('127.0.0.0/8'),      # Loopback
    ipaddress.ip_network('169.254.0.0/16'),   # Link-local
    ipaddress.ip_network('::1/128'),          # IPv6 loopback
    ipaddress.ip_network('fc00::/7'),         # IPv6 private
    ipaddress.ip_network('fe80::/10'),        # IPv6 link-local
]

# Blocked hostnames
BLOCKED_HOSTNAMES = [
    'localhost',
    'metadata.google.internal',  # GCP metadata server
    '169.254.169.254',           # Cloud metadata endpoint
]


class URLFetcherSecurityError(Exception):
    """Raised when a URL fetch is blocked for security reasons."""
    pass


def _is_private_ip(hostname: str) -> bool:
    """Check if hostname resolves to a private/internal IP address."""
    try:
        ip = ipaddress.ip_address(hostname)

        # Check IPv6-mapped IPv4 addresses (e.g., ::ffff:127.0.0.1)
        # These could bypass IPv4 range checks if not handled
        if ip.version == 6 and hasattr(ip, 'ipv4_mapped') and ip.ipv4_mapped:
            ip = ip.ipv4_mapped

        for network in BLOCKED_IP_RANGES:
            if ip in network:
                return True
    except ValueError:
        # Not an IP address, could be a hostname
        pass
    return False


def secure_url_fetcher(url: str, timeout: int = 10, ssl_context=None):
    """
    Secure URL fetcher that blocks dangerous protocols and internal URLs.

    Args:
        url: The URL to fetch
        timeout: Request timeout in seconds
        ssl_context: Optional SSL context

    Returns:
        Dict with fetched resource data (from WeasyPrint's default_url_fetcher)

    Raises:
        URLFetcherSecurityError: If the URL is blocked for security reasons
    """
    parsed = urlparse(url)
    scheme = parsed.scheme.lower()
    hostname = parsed.hostname or ''

    # Block file:// protocol - main LFI vulnerability
    if scheme == 'file':
        logger.warning(f"Blocked file:// URL access attempt: {url}")
        raise URLFetcherSecurityError(
            f"Access to local files is not allowed: {url}"
        )

    # Allow data: URLs (used for inline images/resources)
    if scheme == 'data':
        return default_url_fetcher(url, timeout=timeout, ssl_context=ssl_context)

    # Only allow http and https for remote resources
    if scheme not in ('http', 'https', ''):
        logger.warning(f"Blocked unsupported URL scheme: {url}")
        raise URLFetcherSecurityError(
            f"URL scheme '{scheme}' is not allowed: {url}"
        )

    # Skip validation for empty scheme (relative URLs handled by WeasyPrint)
    if scheme == '':
        return default_url_fetcher(url, timeout=timeout, ssl_context=ssl_context)

    # Block access to internal hostnames
    hostname_lower = hostname.lower()
    if hostname_lower in BLOCKED_HOSTNAMES:
        logger.warning(f"Blocked access to internal hostname: {url}")
        raise URLFetcherSecurityError(
            f"Access to internal hostname '{hostname}' is not allowed"
        )

    # Block access to private IP ranges
    if _is_private_ip(hostname):
        logger.warning(f"Blocked access to private IP: {url}")
        raise URLFetcherSecurityError(
            f"Access to private/internal IP addresses is not allowed: {url}"
        )

    # URL passed security checks, use default fetcher
    return default_url_fetcher(url, timeout=timeout, ssl_context=ssl_context)
