"""
Parser of data from https://www.prix-carburants.gouv.fr/rubrique/opendata/
"""

import json
import logging
import os
import xml.etree.ElementTree as ET
from datetime import datetime
from enum import Enum
from typing import List

from .models import FuelType, SalePoint, WeekDay

LOGGER = logging.getLogger(os.path.basename(__file__))


def build_sale_points(filename: str) -> List[SalePoint]:
    """
    Build sale points from file
    :param filename: Name of the file to parse
    :return: Sale points parsed
    """
    LOGGER.info("Building sale points from %f", filename)
    with open(filename, "r", encoding="windows-1252") as stream:
        tree = ET.parse(stream)
    root = tree.getroot()
    return [SalePoint.build(element) for element in root]


def _latest_metrics(latest_sale_points: List[dict]) -> dict:
    """Build metrics about latest sale points"""
    prices = {key.value: [0, 0] for key in FuelType}
    for sale_point in latest_sale_points:
        for key, (_, price) in sale_point["prices"].items():
            prices[key][0] += price
            prices[key][1] += 1
    return {
        "sums": {key: price for key, (price, _) in prices.items()},
        "counts": {key: count for key, (_, count) in prices.items()},
        "averages": {key: price / count for key, (price, count) in prices.items()},
    }


def degrade_to_latest(sale_points: List[SalePoint]) -> dict:
    """
    Degrade sales points to keep only meaningful latest data.
    """

    def degrade(sale_point: SalePoint) -> dict:
        """Degrade a single sale point"""
        prices = {}
        for key, values in sale_point.prices.items():
            if len(values) > 0:
                prices[key] = max(values, key=lambda value: value[1])  # Newer
        return {
            "id": sale_point.id,
            "lat": sale_point.location.latitude,
            "lng": sale_point.location.longitude,
            "address": sale_point.address.address,
            "postcode": sale_point.address.postcode,
            "city": sale_point.address.city,
            "prices": prices,
        }

    sale_points = [degrade(sale_point) for sale_point in sale_points]
    return {
        "metrics": _latest_metrics(sale_points),
        "week_days": {day.value: day.name for day in WeekDay},
        "fuel_types": {type.value: type.name for type in FuelType},
        "sale_points": sale_points,
    }


class ClassEncoder(json.JSONEncoder):
    """Encoder that handles custom classes"""

    def default(self, o):
        if isinstance(o, set):
            return list(o)
        if isinstance(o, datetime):
            return str(o)
        if isinstance(o, Enum):
            return o.value
        return o.__dict__


def save_as_json(obj, output_file: str):
    """
    Save ``obj`` in ``output_file`` as a json.
    :param obj: Object to save
    :param output_file: Path to the file to write in.
        May create a file or override the existing file
    """
    LOGGER.debug("Saving a json in %f", output_file)
    with open(output_file, "w", encoding="utf8") as stream:
        json.dump(obj, stream, cls=ClassEncoder)
