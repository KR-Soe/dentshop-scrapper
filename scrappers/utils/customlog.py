import logging


def create_custom_log(filename, logname='customlogger'):
    temp = logging.FileHandler(filename, 'a')
    logger = logging.getLogger(logname)
    logger.addHandler(temp)
    return logger
