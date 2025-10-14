"""
Custom exceptions for the services layer
"""


class ServiceError(Exception):
    """Base exception for all service layer errors"""
    pass


class YouTubeServiceError(ServiceError):
    """Exception for YouTube service specific errors"""
    pass


class SpotifyServiceError(ServiceError):
    """Exception for Spotify service specific errors"""
    pass


class UpdatesServiceError(ServiceError):
    """Exception for updates service specific errors"""
    pass
