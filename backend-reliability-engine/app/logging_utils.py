"""
Structured JSON Logging for Pathway Backend
"""

import json
import logging
import sys
from datetime import datetime
from pythonjsonlogger import jsonlogger

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter with Pathway-specific fields"""
    
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        
        # Add standard fields
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['level'] = record.levelname
        log_record['logger'] = record.name
        
        # Pathway-specific fields
        if hasattr(record, 'correlation_id'):
            log_record['correlation_id'] = record.correlation_id
        if hasattr(record, 'user_id'):
            log_record['user_id'] = record.user_id
        if hasattr(record, 'service'):
            log_record['service'] = record.service

def setup_logging():
    """Setup structured JSON logging"""
    logger = logging.getLogger("pathway")
    logger.setLevel(logging.INFO)
    
    # Remove existing handlers
    logger.handlers = []
    
    # JSON handler
    handler = logging.StreamHandler(sys.stdout)
    formatter = CustomJsonFormatter(
        '%(timestamp)s %(level)s %(logger)s %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger

def get_logger(name="pathway"):
    """Get logger instance"""
    return logging.getLogger(name)

def log_operation(logger, operation_name, **fields):
    """Log operation with standard fields"""
    logger.info(operation_name, extra=fields)

def log_error(logger, operation_name, error, correlation_id, **fields):
    """Log error with context"""
    fields['error'] = str(error)
    fields['correlation_id'] = correlation_id
    logger.error(operation_name, extra=fields)
