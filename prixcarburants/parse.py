"""
Parser of data from https://www.prix-carburants.gouv.fr/rubrique/opendata/
"""

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
