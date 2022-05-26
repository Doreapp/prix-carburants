"""
Parser of data from https://www.prix-carburants.gouv.fr/rubrique/opendata/
"""

import json
import xml.etree.ElementTree as ET
from typing import List

from .models import SalePoint


def build_sale_points(filename: str) -> List[SalePoint]:
    """
    Build sale points from file
    :param filename: Name of the file to parse
    :return: Sale points parsed
    """
    with open(filename, "r", encoding="windows-1252") as stream:
        tree = ET.parse(stream)
    root = tree.getroot()
    sale_points = [SalePoint.build(element) for element in root]
    return sale_points


class ClassEncoder(json.JSONEncoder):
    """Encoder that handle custom classes"""

    def default(self, o):
        return o.__dict__


def save_as_json(obj, output_file: str):
    """
    Save ``obj`` in ``output_file`` as a json.
    :param obj: Object to save
    :param output_file: Path to the file to writ in.
        May create a file or override the existing file
    """
    with open(output_file, "w", encoding="utf8") as stream:
        json.dump(obj, stream, cls=ClassEncoder)
