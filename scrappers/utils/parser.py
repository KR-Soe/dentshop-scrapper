import re


def text_to_number(text):
    if text is None:
        return 0

    result = re.sub(r'\D*', '', text)
    return 0 if result == '' else result
