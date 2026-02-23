"""WeasyPrint configuration - suppress warnings and configure logging"""

import logging
import warnings

# Suppress WeasyPrint CSS warnings that can be noisy
logging.getLogger('weasyprint').setLevel(logging.ERROR)
logging.getLogger('fonttools').setLevel(logging.ERROR)

# Suppress Python warnings from WeasyPrint dependencies
warnings.filterwarnings('ignore', module='weasyprint')
warnings.filterwarnings('ignore', module='fonttools')
